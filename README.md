# HackSphere

HackSphere is a multi-role hackathon management platform built to run the full event lifecycle from onboarding to leaderboard publishing and certificate distribution.

The platform supports:

- public event discovery and registration
- participant approval, team formation, problem selection, and project submission
- judge approval, assigned reviews, rubric scoring, and leaderboard visibility
- admin operations for participants, judges, teams, problems, submissions, announcements, certificates, and audit logs

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- MongoDB with Mongoose
- Tailwind CSS
- Sonner
- Cloudinary
- Nodemailer

## Main Workspaces

### Public

- landing page
- about page
- public problem statement browsing
- registration and login
- forgot/reset password
- invite acceptance

### Participant

- approval pending experience
- dashboard
- team management
- problem selection
- submission workspace
- announcements
- leaderboard
- profile
- certificate access after published results

### Judge

- dashboard
- review queue
- review detail workspace
- leaderboard
- profile

### Admin

- dashboard
- participants
- judges
- teams
- problem statements
- submissions
- announcements
- leaderboard
- certificates
- audit logs
- profile

## Event Workflow

1. Users register for the event.
2. Admin approves participants and judges.
3. Participants create or join teams.
4. Teams select a problem statement.
5. Teams prepare and submit their projects.
6. Admin assigns judges to submissions.
7. Judges review and submit evaluations.
8. Admin reviews the derived leaderboard and publishes results.
9. Certificates become available from published standings.

## Environment Variables

Create `.env.local` and configure the following values.

### Required

```env
MONGODB_URI=
JWT_SECRET=
ADMIN_SIGNUP_CODE=
JUDGE_SIGNUP_CODE=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
NEXT_PUBLIC_HACKATHON_SUBMISSION_DEADLINE=
NEXT_PUBLIC_HACKATHON_END_TIME=
NEXT_PUBLIC_WHATSAPP_GROUP_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### Optional

```env
MONGODB_DB_NAME=hacksphere
MONGODB_CONNECT_TIMEOUT_MS=15000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=15000
NEXTAUTH_URL=
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Run quality checks:

```bash
npm run lint
npx tsc --noEmit --pretty false --incremental false
npm run build
```

## Important Routes

### Public

- `/`
- `/about`
- `/problem-statements`
- `/register`
- `/login`
- `/forgot-password`
- `/reset-password`

### Protected

- `/participant/*`
- `/judge/*`
- `/admin/*`

## Data Model Overview

Core models used in the app:

- `User`
- `Team`
- `ProblemStatement`
- `Submission`
- `Evaluation`
- `JudgeAssignment`
- `Announcement`
- `LeaderboardSettings`
- `AdminLog`

## Supporting Documents

- `FACULTY_TESTING_GUIDE.md`
- `AUDIT_REPORT.md`
- `PROJECT_OVERVIEW_AND_RECOMMENDATIONS.md`
- `PROJECT_ISSUES_AND_IMPROVEMENTS.md`

## Deployment Notes

Before deploying:

1. Configure all required environment variables.
2. Verify MongoDB connectivity.
3. Verify Cloudinary upload credentials.
4. Verify SMTP configuration for mail flows.
5. Run lint, TypeScript, and production build checks.
