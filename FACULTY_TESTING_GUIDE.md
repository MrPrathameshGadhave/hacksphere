# HackSphere Faculty Testing Guide

Updated: April 1, 2026

## Purpose

This document is meant to help faculty reviewers understand what HackSphere does, how the platform is structured, and which links/features should be tested on the live Vercel deployment.

## Before Sharing This Document

1. The live deployed URL used in this guide is `https://hacksphere-lake.vercel.app`
2. Share role credentials separately if you are using pre-created accounts.
3. If you want faculty to register their own participant account, they can use the public registration page.
4. Admin and judge accounts should usually be tested using credentials already created by the team, unless you also want to share the secret registration links.

## What HackSphere Is

HackSphere is a hackathon/event management platform with 3 main roles:

- Participant: joins the event, forms a team, selects a problem, submits a project, checks leaderboard status, and downloads a certificate after results are published.
- Judge: reviews assigned submissions, scores them, and submits evaluations.
- Admin: manages participants, judges, teams, problems, submissions, announcements, leaderboard publishing, audit logs, and certificates.

## Recommended Testing Order

The easiest way to understand the system is to test it in this order:

1. Open the public pages and understand the event entry flow.
2. Test the participant flow:
   registration -> approval -> team creation -> problem selection -> submission -> profile -> certificate lock state
3. Test the judge flow:
   login -> assigned reviews -> review submission -> leaderboard view
4. Test the admin flow:
   approvals -> problems -> submissions -> judge assignments -> announcements -> leaderboard -> certificates
5. Finally, publish the leaderboard from admin and confirm that participant certificates unlock correctly.

## Important Things To Know Before Testing

- New participants may need admin approval before they can fully proceed.
- New judges are expected to remain pending until approved by admin.
- Participant certificates should stay locked until the admin publishes the leaderboard.
- Admin certificate previews can exist before publishing, but final participant access is intentionally blocked until publishing.
- Judge reviews are expected to become locked after final submission.
- Some dashboards become more meaningful only after sample event data exists.

## Main Public Links

Use these links to understand the public-facing side of the platform:

| Area | Link |
|------|------|
| Home | `https://hacksphere-lake.vercel.app/` |
| About | `https://hacksphere-lake.vercel.app/about` |
| Problem Statements | `https://hacksphere-lake.vercel.app/problem-statements` |
| Participant Register | `https://hacksphere-lake.vercel.app/register` |
| Login | `https://hacksphere-lake.vercel.app/login` |
| Forgot Password | `https://hacksphere-lake.vercel.app/forgot-password` |

## Participant Testing Links

These are the main participant pages that should be reviewed:

| Area | Link | What To Check |
|------|------|---------------|
| Dashboard | `https://hacksphere-lake.vercel.app/participant/dashboard` | Overall event summary, progress, announcements, navigation |
| Team Management | `https://hacksphere-lake.vercel.app/participant/my-team` | Create team, join team, invite code flow, member handling |
| Problems | `https://hacksphere-lake.vercel.app/participant/problems` | Problem listing, readability, selection flow |
| Submission | `https://hacksphere-lake.vercel.app/participant/submission` | Draft/final submission flow, validation, uploads |
| Announcements | `https://hacksphere-lake.vercel.app/participant/announcements` | Notices readability and visibility |
| Leaderboard | `https://hacksphere-lake.vercel.app/participant/leaderboard` | Public rankings after publish |
| Profile | `https://hacksphere-lake.vercel.app/participant/profile` | Profile details, approval state, certificate section |
| Certificate | `https://hacksphere-lake.vercel.app/participant/certificate` | Locked before publish, enabled after publish |

## Judge Testing Links

These are the main judge pages:

| Area | Link | What To Check |
|------|------|---------------|
| Dashboard | `https://hacksphere-lake.vercel.app/judge/dashboard` | Review workload summary and navigation |
| Reviews Queue | `https://hacksphere-lake.vercel.app/judge/reviews` | Assigned review list, status wording, search/readability |
| Leaderboard | `https://hacksphere-lake.vercel.app/judge/leaderboard` | Judge-side leaderboard visibility |
| Profile | `https://hacksphere-lake.vercel.app/judge/profile` | Profile details and persistence |

Note:

- Individual review detail pages open from the review queue.
- Submitted judge reviews should not remain editable after final submit.

## Admin Testing Links

These are the main admin pages:

| Area | Link | What To Check |
|------|------|---------------|
| Dashboard | `https://hacksphere-lake.vercel.app/admin/dashboard` | Event summary, progress, important metrics |
| Participants | `https://hacksphere-lake.vercel.app/admin/participants` | Approve/pending flow, bulk approval, filters |
| Judges | `https://hacksphere-lake.vercel.app/admin/judges` | Approve/block/pending flow, judge management |
| Teams | `https://hacksphere-lake.vercel.app/admin/teams` | Team records, readiness, problem linkage |
| Problems | `https://hacksphere-lake.vercel.app/admin/problems` | Create/edit/publish/archive problems |
| Submissions | `https://hacksphere-lake.vercel.app/admin/submissions` | Submission review, unlock, judge assignment |
| Announcements | `https://hacksphere-lake.vercel.app/admin/announcements` | Create/edit/pin/delete announcements |
| Leaderboard | `https://hacksphere-lake.vercel.app/admin/leaderboard` | Ranking review, publish controls, export |
| Certificates | `https://hacksphere-lake.vercel.app/admin/certificates` | Certificate generation records and preview |
| Audit Logs | `https://hacksphere-lake.vercel.app/admin/audit-logs` | Admin action tracking |

## Suggested Full End-To-End Demo Flow

If faculty want to test the system as a complete event workflow, use this sequence:

1. Participant registers or logs in.
2. Admin approves participant.
3. Participant creates or joins a team.
4. Participant selects a problem statement.
5. Participant submits the project.
6. Admin verifies the submission and assigns judges.
7. Judge logs in and completes assigned review(s).
8. Admin opens leaderboard and publishes results.
9. Admin checks certificate records.
10. Participant opens profile/certificate page and confirms certificate unlock.

## What Faculty Should Specifically Observe

### Public Experience

- Is navigation clear?
- Does the event look understandable without technical guidance?
- Are login/register/recovery pages easy to use?

### Participant Experience

- Is the team flow easy to understand?
- Is problem selection clear?
- Is submission validation understandable?
- Is certificate access correctly blocked before leaderboard publish?

### Judge Experience

- Is the review list clear and easy to prioritize?
- Is the scoring flow understandable?
- Does the review lock properly after submission?

### Admin Experience

- Are dashboards easy to read?
- Is it easy to approve participants and judges?
- Is it easy to manage problems, submissions, announcements, and rankings?
- Is certificate generation understandable?
- Are audit logs visible and useful?

## If You Are Sharing Test Accounts

You can paste credentials in this section before sending the document:

| Role | Email / Username | Password | Notes |
|------|-------------------|----------|-------|
| Participant | `<fill here>` | `<fill here>` | Use for participant flow |
| Judge | `<fill here>` | `<fill here>` | Use for review flow |
| Admin | `<fill here>` | `<fill here>` | Use for full platform control |

## Optional Secret Access Links

Only include these if you intentionally want faculty to test secret registration pages:

- Admin secret registration: `https://hacksphere-lake.vercel.app/admin-register-secret`
- Judge secret registration: `https://hacksphere-lake.vercel.app/judge-register-secret`

## Expected Locked/Controlled Behaviors

The following are not bugs if seen during testing:

- Participant certificate download is disabled before leaderboard publish.
- Judge access can be blocked until admin approval.
- Participant access may remain limited until approval.
- Some rankings and certificates may look incomplete until submissions and reviews exist.

## What To Report Back

If faculty find issues, the most helpful report format is:

1. Page URL
2. Role used
3. What action was performed
4. What was expected
5. What actually happened
6. Screenshot, if available

## Quick Share Message

You can send the following message along with the link:

`Please review the HackSphere testing build using the attached guide. The platform includes participant, judge, and admin workflows. The most useful way to test it is to go through the participant journey, judge review journey, and then the admin controls for approvals, leaderboard publishing, and certificate generation.`
