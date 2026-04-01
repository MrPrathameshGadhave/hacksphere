# Approval & Status Mechanism Analysis - HackSphere

## Executive Summary
The HackSphere platform implements a dual approval system:
- **Participants**: `isApproved` boolean field (automatic approval on signup)
- **Judges**: `judgeStatus` enum field (`pending|active|blocked`) with manual review
- **Teams**: `status` enum field (`active|pending|disqualified`) for team verification

---

## 1. USER MODEL APPROVAL MECHANISM

### Location
[models/User.ts](models/User.ts)

### Participant Approval Fields
```typescript
isApproved: {
  type: Boolean,
  default: false,
}
```

### Judge Status Fields
```typescript
judgeStatus: {
  type: String,
  enum: ["active", "pending", "blocked"],
  default: "pending",
}
```

### Current Issue
**BUG IDENTIFIED**: Participants are auto-approved on signup (`isApproved: true`), which means the approval flow is not actually used. The `isApproved` field exists but is never set to `false` during registration.

---

## 2. TEAM MODEL STATUS MECHANISM

### Location
[models/Team.ts](models/Team.ts)

### Team Status Field
```typescript
status: {
  type: String,
  enum: ["active", "pending", "disqualified"],
  default: "active",
}
```

### Team Status Meanings
| Status | Meaning |
|--------|---------|
| `active` | Team passes all checks (complete members, approved members) |
| `pending` | Team incomplete or awaiting member approvals |
| `disqualified` | Team removed/blocked by admins |

### Team Member Approval Tracking
Teams track member approval indirectly:
- Store member IDs (including leader)
- Populate member data when fetching
- Count `approvedMembersCount` and `pendingMembersCount` in admin responses

---

## 3. REGISTRATION FLOW FOR PARTICIPANTS

### Location
[app/api/auth/signup/route.ts](app/api/auth/signup/route.ts)

### Registration Flow
```
1. User submits registration form
2. Email validation & password hash
3. User created with:
   - role: "participant"
   - isApproved: true ← AUTO-APPROVED (Bug!)
   - college: from input
   - avatar: empty
4. User redirected to /participant/dashboard
```

### Current State
- ✅ **Form validates**: Name, email, college, password (6+ chars + letter + number)
- ✅ **Unique email check**: Prevents duplicates
- ❌ **Approval required**: No - automatically approved

### Request/Response
```typescript
POST /api/auth/signup
{
  "name": "string",
  "email": "string",
  "college": "string",
  "password": "string"
}

// Response
{
  "success": true,
  "message": "Participant account created successfully",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "participant",
    "college": "string",
    "avatar": "string",
    "isApproved": true,
    "createdAt": "ISO date"
  }
}
```

---

## 4. JUDGE SIGNUP FLOW

### Location
[app/api/auth/signup/judge/route.ts](app/api/auth/signup/judge/route.ts)

### Judge Registration Flow
```
1. Judge submits registration with JUDGE_SIGNUP_CODE
2. Validates code against JUDGE_SIGNUP_CODE environment variable
3. Code verification FAILS → 403 Forbidden
4. On success:
   - role: "judge"
   - isApproved: true ← (for judges, uses isApproved)
   - judgeStatus: "pending" (default, but overridden by isApproved: true)
5. Judge account created
```

### Inconsistency
- Judges have TWO approval fields: `isApproved` (boolean) and `judgeStatus` (enum)
- Judge signup sets `isApproved: true` automatically
- `judgeStatus` defaults to `pending` but never used in practice
- Admin never reviews judges using this mechanism

---

## 5. ADMIN APPROVAL ENDPOINTS

### Endpoint Structure
```
GET  /api/admin/participants          - List all participants
PATCH /api/admin/participants/[id]    - Approve/reject participant
GET   /api/admin/teams                - List all teams
PATCH /api/admin/teams/[id]           - Update team status
```

### GET /api/admin/participants

**Location**: [app/api/admin/participants/route.ts](app/api/admin/participants/route.ts)

**Response Format**:
```typescript
{
  success: true,
  participants: [
    {
      id: string;
      name: string;
      email: string;
      college: string;
      team: string;
      teamId: string | null;
      teamStatus: "active" | "pending" | "disqualified" | null;
      isLeader: boolean;
      status: "Approved" | "Pending";  // Uses isApproved field
      joinedAt: ISO date;
    }
  ]
}
```

**Logic**:
- Fetches all participants (role: "participant")
- Maps each to their team(s)
- Maps `isApproved: true` → `status: "Approved"`
- Maps `isApproved: false` → `status: "Pending"`

### PATCH /api/admin/participants/[id]

**Location**: [app/api/admin/participants/[id]/route.ts](app/api/admin/participants/[id]/route.ts)

**Request**:
```typescript
PATCH /api/admin/participants/{participantId}
{
  "isApproved": boolean
}
```

**Response**:
```typescript
{
  success: true,
  message: "Participant approved successfully" | "Participant moved to pending successfully",
  participant: {
    id: string;
    status: "Approved" | "Pending";
    // ... other fields
  }
}
```

**Actions**:
- Updates User.isApproved field
- Reflects in participant list immediately
- No email notification sent

### GET /api/admin/teams

**Location**: [app/api/admin/teams/route.ts](app/api/admin/teams/route.ts)

**Response Format** (with detailed team info):
```typescript
{
  success: true,
  teams: [
    {
      id: string;
      teamName: string;
      leader: { id, name, email, isApproved, role };
      members: [ { id, name, email, isApproved, role } ];
      allMembers: [ {...}, {...} ];  // leader + members deduped
      approvedMembersCount: number;
      pendingMembersCount: number;
      memberCount: number;
      maxSize: number;
      isFull: boolean;
      availableSlots: number;
      problemStatement: { id, title, slug, category, difficulty };
      status: "Active" | "Incomplete" | "Blocked";  // UI version
      dbStatus: "active" | "pending" | "disqualified";  // DB version
      inviteCode: string | null;
      createdAt: ISO date;
      updatedAt: ISO date;
    }
  ],
  meta: {
    totalTeams: number;
    activeTeams: number;
    pendingTeams: number;
    disqualifiedTeams: number;
    fullTeams: number;
    teamsWithProblemSelected: number;
  }
}
```

### PATCH /api/admin/teams/[id]

**Location**: [app/api/admin/teams/[id]/route.ts](app/api/admin/teams/[id]/route.ts)

**Request**:
```typescript
PATCH /api/admin/teams/{teamId}
{
  "status": "Active" | "Incomplete" | "Blocked" |  // UI format
            "active" | "pending" | "disqualified"  // DB format
}
```

**Response**:
```typescript
{
  success: true,
  message: "Team status updated successfully",
  team: { /* transformed team object */ }
}
```

**Status Mapping**:
| UI Status | DB Status | Meaning |
|-----------|-----------|---------|
| Active | active | Approved, all checks pass |
| Incomplete | pending | Awaiting completion |
| Blocked | disqualified | Admin blocked |

---

## 6. MIDDLEWARE & AUTH GUARDS

### Location
[middleware.ts](middleware.ts)

### Route Protection
```typescript
// Applies to:
- /participant/:path*
- /judge/:path*
- /admin/:path*

// Checks:
1. Token exists in cookies (hacksphere_token)
2. Token is valid JWT
3. User role matches route:
   - participant route → role must be "participant"
   - judge route → role must be "judge"
   - admin route → role must be "admin"
4. Redirects to /unauthorized if role doesn't match
```

### Does NOT Check Approval Status
⚠️ **Important**: The middleware checks role ONLY, not `isApproved` or `judgeStatus`.
- Even "pending" participants can access /participant/* routes
- Even "blocked" judges can access /judge/* routes
- No approval gate at the routing level

---

## 7. UI COMPONENTS SHOWING APPROVAL STATUS

### Admin Dashboard
**Location**: [app/admin/dashboard/page.tsx](app/admin/dashboard/page.tsx)

**Displays**:
- "Pending Reviews" count
- "Participant approvals" card showing pending approvals
- "Teams pending setup" count

### Admin Participants Page
**Location**: [app/admin/participants/page.tsx](app/admin/participants/page.tsx)

**Features**:
- Table showing all participants
- Status column: `"Approved" | "Pending"`
- Color coding:
  - `Approved`: Green background (`bg-green-100 text-green-700`)
  - `Pending`: Amber background (`bg-amber-100 text-amber-700`)
- Inline action to toggle approval status
- Search & filter by status

### Admin Teams Page
**Location**: [app/admin/teams/page.tsx](app/admin/teams/page.tsx)

**Features**:
- Team status badges showing:
  - `Active` (green badge)
  - `Incomplete` (amber badge)
  - `Blocked` (red badge)
- Member approval count displayed
- Problem statement status
- Ability to change team status via dropdown

### Participant Dashboard
**Location**: [app/participant/dashboard/page.tsx](app/participant/dashboard/page.tsx)

**Shows**:
```typescript
// Team Status Card
{
  title: "Team Status",
  value: "Active" | "Pending" | "Restricted" | "Not Joined",
  subtext: "Team name • Approval pending" // ← Shows if unapproved members
}

// Checks for unapproved members:
const hasUnapprovedParticipants = useMemo(() => {
  return [team.leader, ...team.members].some(
    (participant) => participant?.isApproved === false
  );
}, [team]);
```

---

## 8. SECURITY & AUTHORIZATION ANALYSIS

### Current Implementation ✅
| Component | Status |
|-----------|--------|
| Role-based middleware | ✅ Implemented |
| Admin-only endpoints | ✅ Verified in API |
| JWT token validation | ✅ Present |
| Token verification for sensitive operations | ✅ Present |

### Missing Implementation ⚠️
| Component | Status | Impact |
|-----------|--------|--------|
| Approval gate in middleware | ❌ Missing | Unapproved participants can still access participant routes |
| Email notifications on approval | ❌ Missing | Users don't know their status |
| Approval workflow documentation | ❌ Missing | Unclear what "pending" means |
| Judge approval endpoint | ❌ Missing | Judges auto-approved, judgeStatus ignored |

---

## 9. DATA FLOW DIAGRAM

```
USER REGISTRATION
├── Participant Signup (/api/auth/signup)
│   ├── Validate email, password, college
│   ├── Create User with isApproved: true ← AUTO-APPROVED BUG
│   └── Redirect to /participant/dashboard
│
├── Judge Signup (/api/auth/signup/judge)
│   ├── Validate JUDGE_SIGNUP_CODE
│   ├── Create User with:
│   │   ├── isApproved: true
│   │   └── judgeStatus: "pending" (ignored)
│   └── Redirect to /judge/dashboard
│
└── Admin Signup (/api/auth/signup/admin)
    └── [Not analyzed in this scope]

ADMIN MANAGEMENT
├── Get Participants (/api/admin/participants)
│   └── Maps isApproved to "Approved" | "Pending" status
│
├── Update Participant (/api/admin/participants/{id})
│   └── Toggles isApproved field
│
├── Get Teams (/api/admin/teams)
│   └── Shows team status & member approval counts
│
└── Update Team (/api/admin/teams/{id})
    └── Changes team status (active|pending|disqualified)

MIDDLEWARE CHECK
├── Role verification only
├── No approval checking
└── Routes always accessible if logged in
```

---

## 10. KEY FINDINGS & RECOMMENDATIONS

### Critical Issues
1. **Auto-Approval Bug**: All participants auto-approved on signup with `isApproved: true`
   - **Impact**: Approval mechanism is non-functional
   - **Fix**: Change default to `isApproved: false`

2. **Judge Status Field Unused**: Two fields (`isApproved`, `judgeStatus`) but only one is used
   - **Impact**: Inconsistent data model
   - **Fix**: Decide which field judges use and create approval workflow

3. **No Approval Gate in Middleware**: Users can access routes even if not approved
   - **Impact**: Unapproved participants can submit projects
   - **Fix**: Add approval check to middleware

### Missing Features
- Email notifications for status changes
- Approval deadline or SLA tracking
- Bulk approval actions
- Approval request reasons/comments
- Audit logs for approval changes

### Inconsistencies
- Participants use `isApproved` (boolean)
- Teams use `status` (enum)
- Judges use both `isApproved` and `judgeStatus`

---

## 11. API CONTRACT SUMMARY

| Operation | Role Required | Approval Required | Status |
|-----------|---------------|------------------|--------|
| Signup (Participant) | None | Auto-approved | Working |
| Signup (Judge) | Code | Auto-approved | Working |
| Access /participant/* | participant | None checked | Implemented |
| Access /judge/* | judge | None checked | Implemented |
| Access /admin/* | admin | N/A | Implemented |
| List participants | admin | N/A | Working |
| Approve participant | admin | N/A | Working |
| Update team status | admin | N/A | Working |

---

## Files Modified/Analyzed

### Models
- `models/User.ts` - User schema with approval fields
- `models/Team.ts` - Team schema with status field

### Authentication & API
- `lib/auth.ts` - JWT utilities
- `app/api/auth/signup/route.ts` - Participant signup
- `app/api/auth/signup/judge/route.ts` - Judge signup
- `app/api/admin/participants/route.ts` - List participants
- `app/api/admin/participants/[id]/route.ts` - Update participant
- `app/api/admin/teams/route.ts` - List teams
- `app/api/admin/teams/[id]/route.ts` - Update team

### Middleware
- `middleware.ts` - Role-based routing protection

### UI Components
- `app/admin/dashboard/page.tsx` - Admin overview
- `app/admin/participants/page.tsx` - Participant management
- `app/admin/teams/page.tsx` - Team management
- `app/participant/dashboard/page.tsx` - Participant view

---

**Analysis Date**: March 30, 2026  
**Status**: Complete
