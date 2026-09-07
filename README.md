# MBU CampusFinder

### A Campus Lost and Found Management System

**Mohan Babu University (MBU)**

CampusFinder is a real web-based campus lost-and-found platform designed to help students report lost or found belongings, discover approved reports, communicate for recovery, and resolve recovered items through a controlled workflow. It is a React and Firebase PBL project for the MBU campus community.

## Project Status

| Item | Current project value |
| --- | --- |
| Project | MBU CampusFinder |
| Type | PBL project |
| Platform | Web application |
| Frontend | React 19 + JavaScript + Vite |
| Backend / cloud | Firebase |
| Database | Cloud Firestore |
| Authentication | Firebase Authentication |
| Storage | Firebase Storage rules and upload path |
| Deployment target | Vercel-compatible production build; no Vercel configuration is committed |
| Repository state | `master` branch, one initial commit at the time of documentation |

## Introduction

Lost belongings on a university campus are often handled through WhatsApp groups, informal announcements, physical notices, word-of-mouth, and other scattered communication channels. These methods make it difficult to find reliable information, verify reports, contact the right person, and close the recovery process properly.

CampusFinder provides one moderated digital platform where students can register securely, verify their email, submit lost or found reports, browse approved campus reports, search for relevant belongings, view item details, send controlled contact requests, manage recovery requests, and resolve recovered reports. Administrators review reports before they become publicly discoverable.

The system is organized around **trust, moderation, privacy, recovery, and campus community**.

## Problem Statement

Students may lose an item on campus without knowing whether another student has found it. A student who finds an item may also have no reliable way to identify or contact its owner. When information is scattered across multiple groups and informal channels:

- reports are difficult to search and compare;
- duplicate, incomplete, or misleading reports may appear;
- personal contact information can be exposed unnecessarily;
- there is no consistent moderation process;
- report ownership and permissions are unclear; and
- there is no structured lifecycle for recovery and resolution.

CampusFinder addresses these problems with a centralized application, authenticated user accounts, private pending reports, administrator moderation, controlled contact requests, ownership-aware actions, and a resolved state for recovered items.

## Objectives

1. Create a centralized campus lost-and-found platform.
2. Allow students to report lost and found belongings.
3. Provide secure student authentication.
4. Verify user email addresses before report submission.
5. Allow users to search approved reports.
6. Keep newly submitted reports private until moderation.
7. Provide administrator moderation.
8. Prevent unauthorized users from modifying reports.
9. Provide a controlled contact and recovery workflow.
10. Allow recovered reports to be resolved.
11. Provide a responsive modern web interface.
12. Produce a deployable web application rather than only a static frontend demonstration.

## Project Scope

### Student Scope

Authenticated students can:

- register, log in, log out, and verify email;
- reset a forgotten password;
- manage their profile;
- create lost and found reports;
- view and filter their own reports;
- search approved campus reports;
- open report details;
- send contact requests to reporters of approved public reports;
- accept, decline, or manage relevant contact requests when they own the report; and
- resolve an approved report after recovery.

### Administrator Scope

An administrator with the Firebase Authentication custom claim `admin: true` can:

- access the admin dashboard;
- view report statistics and the moderation list;
- inspect complete report details and images;
- approve pending reports;
- reject reports with a reason;
- remove reports from public visibility;
- inspect moderation metadata and audit records; and
- review contact and recovery information associated with reports.

### System Scope

The system provides Firebase Authentication, Cloud Firestore, Firebase Security Rules, a responsive React UI, custom-claim admin authorization, a report lifecycle, private contact requests, local category image assets, and a production-oriented Firebase Storage path for uploaded images.

## Main Features

### Authentication Methods

CampusFinder supports:
- Email/password authentication
- Google authentication
- Email verification for email/password accounts
- Forgot password
- Protected routes
- Firebase Authentication custom claims for admin authorization

Google Sign-In is provided through Firebase Authentication using `signInWithPopup` and `GoogleAuthProvider`. Google-authenticated accounts are verified via Google and seamlessly access authenticated routes without requiring secondary email verification, while maintaining strict separation from custom-claim based admin authorization.

### Authentication

- Email/password registration with full name, email, password, and confirmation.
- Google Sign-In on both Login and Registration flows.
- Login and logout through Firebase Authentication.
- Email verification for email/password accounts after registration.
- Forgot-password email flow.
- Authentication state loading and token refresh.
- Public, authenticated, verified-user, and admin route guards.

### Lost and Found Reports

Verified users can create lost or found reports containing an item title/name, category, description, location, campus zone, relevant date, optional brand/color/additional information, contact preference, and image data. Reports record their owner, status, visibility, timestamps, and moderation metadata.

### Search and Discovery

The Find Items page loads reports that are both `approved` and `public`. It supports:

- text search across item and location information;
- lost/found type filtering;
- category filtering;
- campus-zone filtering; and
- newest/oldest sorting.

### Moderation

New reports are created as private and pending. They do not enter public discovery until an administrator approves them. Rejection requires a reason, and removal changes a report to restricted visibility. The admin interface records moderation actions in `adminActions`.

### Contact and Recovery

A signed-in user can send a message of at least ten characters about an approved public report, unless they own that report. The report owner can accept or decline a pending request; the requester can cancel their own request. The report owner can mark an approved report as resolved, which restricts its visibility.

### Dashboards

The student dashboard shows the user's lost and found reports, status filtering, category navigation, and contact requests. The admin dashboard shows counts for total, pending, approved, rejected, resolved, and removed reports and links to the moderation workspace.

### Home Experience

The home page presents MBU CampusFinder branding, lost-and-found calls to action, a campus-focused video hero, an interactive Three.js campus assistant, the PBL recognition section, mentor information, and the project team presentation area.

## Report Lifecycle

```text
Student creates report
	  |
	  v
     PENDING (private)
	  |
   Admin reviews
	/     \
     v       v
APPROVED   REJECTED
(public)  (restricted)
    |
    v
Contact / recovery request
    |
    v
 RESOLVED (restricted)

PENDING or APPROVED --admin removal--> REMOVED (restricted)
```

`PENDING` waits for review. `APPROVED` is publicly discoverable only when its visibility is `public`. `REJECTED`, `RESOLVED`, and `REMOVED` are restricted states. `REMOVED` is used when an administrator determines that an existing report should no longer remain available.

## Security Model

Firebase Security Rules are the backend authorization boundary. Frontend route guards improve the user experience, but Firestore and Storage rules enforce access independently.

### Authentication

Firebase Authentication manages registration, login, email verification, password reset, authenticated sessions, and logout. Firestore report creation and Storage uploads require an authenticated user whose ID token indicates a verified email address.

### Authorization

Admin access is controlled by the Firebase Authentication custom claim:

```json
{ "admin": true }
```

The application does not use the editable `users/{uid}.role` field as the administrator authorization boundary. Admin routes and moderation writes require the authenticated token claim.

### Ownership and Visibility

- A report can be created only by a verified user for their own UID.
- A student can edit only their own pending or approved report fields permitted by the rules.
- A student cannot approve, reject, remove, or change another user's report.
- Only the report owner can resolve an approved report.
- Public discovery requires `status == approved` and `visibility == public`.
- User profiles are readable by the owner or an administrator.
- Contact requests are readable by the requester, report owner, or an administrator.
- Students cannot approve their own reports.

### Image Rules

When demo mode is disabled, uploads must be images, must be no larger than 5 MB, must be performed by a verified user, and must be stored under that user's report path. The Storage rules also allow appropriate owner, admin, or public-approved reads.

See [firestore.rules](firestore.rules), [storage.rules](storage.rules), [ADMIN_CUSTOM_CLAIMS.md](ADMIN_CUSTOM_CLAIMS.md), and [SECURITY_TEST_MATRIX.md](SECURITY_TEST_MATRIX.md) for the repository's detailed rules and test cases.

## Technology Stack

### Frontend

- React 19
- JavaScript and JSX
- HTML
- CSS
- Vite
- React Router
- Three.js and React Three Fiber

### Backend and Cloud

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firestore Security Rules
- Storage Security Rules
- Firebase Admin SDK for the local admin-claim script only

### Development

- npm
- ESLint
- Git and GitHub
- VS Code
- Firebase CLI-compatible configuration files

### Deployment

The application produces a static Vite build suitable for Vercel. Vercel is the intended deployment target described by the project documentation, but this repository does not contain a Vercel configuration file or deployment record.

## System Architecture

```text
				 MBU CampusFinder
					    |
		     +----------------+----------------+
		     |                                 |
		React Frontend                      Firebase
		     |                                 |
	 +---------+----------+          +----------+----------+
	 |         |          |          |          |          |
   Auth UI    Reports    Route Guards  Auth    Firestore  Storage
	 |         |          |          |          |          |
	 +---------+----------+          +----------+----------+
		     |                                 |
	    Student / Admin              Rules and custom claims
```

The React layer renders pages and components, manages client authentication state, and calls Firebase services. Route guards control navigation based on authentication, email verification, and the admin claim. Firebase Authentication manages identity, Firestore stores profiles/reports/contact requests/audit actions, and Storage handles non-demo report images. Security Rules enforce the access model at the service boundary.

## Project Folder Structure

```text
.
├── public/                 Static public assets, including auth background media
├── scripts/                Server-side admin custom-claim utility
├── src/
│   ├── api/                Firebase initialization
│   ├── assets/             Team, achievement, and item image assets
│   ├── components/         Shared UI, auth, dashboard, layout, and report components
│   ├── config/             Runtime configuration such as demo mode
│   ├── context/            Authentication context and session actions
│   ├── guards/             Public, authenticated, verified, and admin route guards
│   ├── hooks/              Shared hook directory
│   ├── pages/              Application screens
│   ├── routes/             Route-related directory reserved by the project structure
│   ├── services/           Report, contact, and admin Firestore/Storage services
│   ├── styles/             Global, auth, landing, layout, variable, and responsive CSS
│   ├── utils/              Shared authentication utilities
│   ├── App.jsx             Route definitions and application shell
│   └── main.jsx            React entry point
├── firebase.json           Firestore, Storage, and Firebase project configuration
├── firestore.rules         Firestore authorization rules
├── firestore.indexes.json  Firestore index configuration
├── storage.rules            Storage authorization rules
├── .env.example             Safe environment variable names only
└── package.json             Project dependencies and npm scripts
```

## Pages and Routes

Routes are defined directly in [src/App.jsx](src/App.jsx). The route behavior is:

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Public CampusFinder home and project presentation | Public; signed-in users are redirected by `PublicRoute` |
| `/login` | Email/password login | Public; signed-in users are redirected |
| `/register` | Create an account | Public; signed-in users are redirected |
| `/forgot-password` | Request a password-reset email | Public; signed-in users are redirected |
| `/verify-email` | View verification status and resend verification | Authenticated user |
| `/dashboard` | View own reports and contact requests | Authenticated user |
| `/items` | Discover approved public reports | Authenticated user |
| `/reports/new` | Create a lost or found report | Verified authenticated user |
| `/reports/:id` | View report details, contact, manage owner actions | Public route component; Firestore visibility still controls data access |
| `/reports/:id/edit` | Edit an owned report | Authenticated user; ownership and rules apply |
| `/profile` | View and manage the user's profile | Authenticated user |
| `/admin` | View moderation statistics | Verified admin |
| `/admin/reports` | Review and filter reports | Verified admin |
| `/admin/reports/:id` | Inspect details, contact information, moderation, and audit timeline | Verified admin |
| `*` | Render the not-found page | Any unmatched route |

There is no literal `/not-found` route; the `NotFoundPage` component is rendered by the wildcard route.

## Firestore Data Model

### `users`

Stores the application profile created for a Firebase Authentication user. The profile includes the UID, full name, email, normal user role marker, and timestamps. The `role` field is not the admin authorization mechanism.

### `reports`

Stores lost and found reports. Important fields used by the application include:

```text
reportId, type, title, itemName, itemCategory
description, itemBrand, itemColor, itemLocation, campusZone
reportedByUid, imageUrls, lastSeenDate, foundDate
contactPreference, searchText
status, visibility, createdAt, updatedAt
approvedByUid, approvedAt, rejectionReason
resolvedByUid, resolvedAt, removedByUid, removedAt
additionalInfo
```

### `contactRequests`

Stores controlled recovery messages between a requester and the owner of an approved public report. It includes the report ID, requester UID, owner UID, message, status, optional note, and timestamps. Request statuses include `pending`, `accepted`, `declined`, and `cancelled`.

### `adminActions`

Stores moderation audit records. Current action types are `APPROVE_REPORT`, `REJECT_REPORT`, and `REMOVE_REPORT`, with the report ID, acting admin UID, note, and timestamp.

Relationships:

```text
User
  |
  +---- creates ----> Reports
				 |
				 +---- moderated by ----> Admin custom claim
				 |
				 +---- contact/recovery -> Contact Requests
```

No real user data, email addresses, UIDs, credentials, or tokens are included in this documentation.

## Firebase Authentication Workflow

```text
Register
   |
   v
Firebase Authentication account
   |
   v
Email verification
   |
   v
Login
   |
   v
Authenticated session
   |
   v
Protected application
```

Registration validates the name, email, password length, and confirmation, creates the Firebase user, creates the profile document, and sends a verification email. Login rejects unverified users. The `AuthContext` listens for authentication changes, refreshes the user's ID token, loads the profile, and reads the admin custom claim. Logout clears the authenticated state, and forgot-password sends a Firebase reset email.

## Administrator Workflow

```text
Admin login
	|
	v
Firebase Authentication
	|
	v
Custom claim check: admin == true
	|
	v
Admin dashboard
	|
	v
Reports management
	|
	v
Open full report
	|
	v
Review and confirm action
     / \
    v   v
Approve  Reject
    |
    v
Public discovery

Approved report --remove--> Restricted report
```

Approval makes a pending report public and records approval metadata. Rejection requires a reason and keeps the report restricted. Removal records the acting admin, time, reason, and audit action. The details page includes confirmation dialogs, reporter information for admins, contact/recovery requests, moderation metadata, and a moderation timeline.

Administrator setup is documented in [ADMIN_CUSTOM_CLAIMS.md](ADMIN_CUSTOM_CLAIMS.md). The included `scripts/set-admin-claim.js` uses the Firebase Admin SDK outside the browser and relies on Application Default Credentials.

## Image System

The current image implementation supports both a demo-friendly local path and a Firebase Storage upload path.

```text
Stored imageUrls
	 |
	 v
Category-local illustration
	 |
	 v
Global fallback illustration
```

There are predefined local SVG illustrations for the supported categories, including ID cards, wallets, keys, phones, laptops, chargers, books, backpacks, documents, and other item types. `getReportImageUrl` prioritizes a stored report URL, then selects the category illustration, and finally uses a global fallback. Image error handlers apply the same fallback behavior. Report cards and admin lists use lazy loading where implemented.

When `VITE_DEMO_MODE=true`, report creation uses the predefined category image and does not require a student upload. When demo mode is disabled, the form accepts an image file and the report service uploads it to Firebase Storage after the report document is created. The UI validates image type and a 5 MB maximum.

## Demo Mode

The runtime configuration supports:

```env
VITE_DEMO_MODE=true
```

Demo mode makes PBL demonstrations easier by using predefined local category illustrations instead of requiring production Firebase Storage uploads. It does not replace Firebase Authentication or Firestore configuration. The actual Firebase project environment must still be configured for account, report, and moderation workflows.

## User Experience and UI Design

The current interface has a dark, cinematic CampusFinder visual direction with MBU branding, editorial typography, responsive layouts, smooth scrolling, reveal-on-scroll sections, hover interactions, tactile buttons, and responsive mobile navigation. The home page includes the MBU Lost & Found identity, project recognition content, team presentation, and a Three.js campus assistant that responds to pointer interaction and respects reduced-motion behavior in its animation logic.

The login and registration pages use a fullscreen background video with `autoplay`, `loop`, `muted`, `playsInline`, and `object-fit: cover`. A dark overlay keeps the foreground authentication card readable and the video is marked non-interactive so it does not block form controls. A local `/auth-bg.mp4` source is attempted first, with a remote source fallback in the page implementation.

MBU branding appears in the landing navigation, CampusFinder identity, MBU Lost & Found wording, footer/layout areas, PBL recognition section, mentor section, and project team presentation.

## Environment Variables

The repository provides `.env.example` with names only:

```env
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_DEMO_MODE
```

Firebase configuration values must be supplied through local environment configuration or the deployment provider's environment settings. Never commit private credentials, service-account keys, `.env.local`, passwords, tokens, or secret values.

## Local Development

Prerequisites are Node.js, npm, and a Firebase project configured for Authentication, Firestore, and Storage.

```bash

cd <project-directory>
npm install
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env.local
```

After adding Firebase project settings to `.env.local`, restart the Vite server. The development server normally prints a local URL such as `http://localhost:5173`.

### Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create the production build in dist/
npm run lint      # Run ESLint
npm run set-admin # Assign admin: true; pass a UID or email after --
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password Authentication in Firebase Console (Authentication → Sign-in method → Email/Password → Enable).
3. Enable Google Authentication in Firebase Console (Authentication → Sign-in method → Google → Enable → Save).
4. Add authorized domains in Firebase Console (Authentication → Settings → Authorized domains): include `localhost` for development and `mbu-campus-finder.vercel.app` for production deployment.
5. Create a Cloud Firestore database.
6. Create or enable Firebase Storage if production image uploads are required.
7. Add the Firebase web configuration through local environment variables (`.env.local`).
8. Deploy `firestore.rules`, `storage.rules`, and the Firestore indexes when using the Firebase CLI.
9. Configure the administrator custom claim using the documented server-side script.

The repository targets the Firestore database location configured in `firebase.json` (`asia-south2`). Firebase credentials are intentionally absent from this README.

Example rule deployment command:

```bash
firebase login
firebase use <firebase-project-id>
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Deployment

The production flow is:

```text
GitHub repository
	  |
	  v
	Vercel
	  |
	  v
  npm run build
	  |
	  v
CampusFinder web application
```

Build locally with `npm run build`. For Vercel, connect the GitHub repository, use the Vite build settings, configure the `VITE_FIREBASE_*` and `VITE_DEMO_MODE` environment variables in the Vercel project, and ensure the deployment serves `index.html` for client-side React Router routes. This repository does not contain a Vercel project file, so the deployment itself must be verified in the hosting dashboard.

## Testing and Quality Assurance

The following table separates checks supported by repository evidence from checks that require a configured Firebase project and test accounts.

| Area | Validation | Status / evidence |
| --- | --- | --- |
| Registration | User can create an account | Implemented in `AuthContext`; live verification requires Firebase credentials |
| Login | Valid credentials authenticate | Implemented in `AuthContext`; live verification requires Firebase credentials |
| Email verification | Verification email and verified-user guard | Implemented; live email verification requires Firebase |
| Forgot password | Password reset workflow | Implemented; live verification requires Firebase |
| Protected routes | Unauthenticated users redirect to login | Implemented by route guards |
| Report creation | Verified user can submit a lost/found report | Implemented; live verification requires Firestore |
| Pending state | New reports are private and pending | Implemented in report creation and Firestore rules |
| Public discovery | Only approved/public reports are queried | Implemented in discovery query and rules |
| Ownership | User-owned report mutation restrictions | Implemented in Firestore rules |
| Self-approval | Owner cannot approve their own report | Implemented by admin-only moderation rules |
| Admin authorization | Custom claim protects admin routes and writes | Implemented; live verification requires a claim-bearing test account |
| Moderation | Approve, reject, remove, and audit records | Implemented in admin services and UI |
| Contact/recovery | Contact request lifecycle and resolution | Implemented; live verification requires Firebase data |
| Images | Category fallback and optional Storage upload | Implemented; live Storage testing requires Firebase |
| Responsive UI | Desktop, tablet, and mobile styling | Implemented in responsive styles; browser matrix not recorded here |
| Lint | ESLint completes | Run `npm run lint` in the configured project environment |
| Build | Production bundle completes | Verified with `npm.cmd run build --silent` during documentation update |

The dedicated [SECURITY_TEST_MATRIX.md](SECURITY_TEST_MATRIX.md) lists rule-level scenarios for User A, User B, and an admin. It states that the live matrix has not been executed without dedicated test credentials; UI checks alone are not sufficient for Firebase authorization validation.

## Security Testing Focus

Important validations for a configured test project include:

- unauthenticated access to protected routes;
- unverified-user access to report creation and image uploads;
- admin route protection and custom-claim enforcement;
- Firestore report ownership restrictions;
- public-read restrictions for pending, rejected, resolved, and removed reports;
- prevention of owner self-approval;
- user profile access restrictions;
- contact request requester/owner permissions;
- authenticated discovery query behavior; and
- deployment of Firestore and Storage Security Rules.

## Git and Version Control

The repository currently contains the `master` branch and one initial commit. No `develop` branch or feature branches are present in the inspected local history, so the following is a recommended collaboration workflow rather than a claim about existing branch history:

```text
Feature branch
	|
	v
Development and review
	|
	v
Lint, build, and application testing
	|
	v
Merge into the team's integration branch
	|
	v
Final verification and deployment
```

Keep environment files and credentials out of Git history. Changes to authentication, report permissions, moderation, or data fields should include corresponding documentation and security-test updates.

## Limitations and Future Enhancements

The following are future enhancements, not claims about the current implementation:

- production-grade Firebase Storage image workflows and media management;
- automated item matching and improved duplicate-report detection;
- push or email notifications for contact-request changes;
- campus map and more precise location mapping;
- analytics dashboards with more granular moderation metrics;
- Progressive Web App support;
- advanced search and filter options;
- QR-based item identification; and
- a dedicated mobile application.

## Development Activities / PBL Journey

### Phase 1 — Problem Identification

- Identified the campus lost-and-found problem.
- Studied informal reporting methods.
- Defined target users and the core use case.

### Phase 2 — Requirement Analysis

- Defined student and administrator workflows.
- Defined report states, privacy expectations, and moderation requirements.

### Phase 3 — System Design

- Selected React and Vite for the frontend.
- Planned Firebase Authentication, Firestore, Storage, Security Rules, and protected routes.
- Designed report, profile, contact-request, and audit-action data structures.

### Phase 4 — Frontend Development

- Created the React application structure and route shell.
- Implemented pages, shared components, forms, responsive styles, and CampusFinder branding.

### Phase 5 — Firebase Integration

- Integrated Firebase Authentication and email verification.
- Integrated Firestore operations and Storage upload handling.
- Added custom-claim administration and Security Rules.

### Phase 6 — Report System

- Built lost/found report creation and editing.
- Added categories, campus zones, statuses, ownership, search, discovery, and dashboards.

### Phase 7 — Security

- Added authentication and verification guards.
- Restricted reports, profiles, contact requests, moderation, and image uploads through Security Rules.

### Phase 8 — Contact and Recovery

- Added contact-request creation and status handling.
- Added owner resolution of approved recovered reports.

### Phase 9 — UI/UX Refinement

- Added responsive layouts, typography, motion, image fallbacks, MBU branding, landing-page presentation, and cinematic authentication backgrounds.

### Phase 10 — Testing

- Added a Security Rules test matrix and performed build verification.
- Lint, browser, responsive, and live Firebase testing should be run with the appropriate project configuration and test accounts.

### Phase 11 — Deployment Preparation

- Added production build configuration and Firebase deployment files.
- Prepared the Vercel-compatible static build and environment-variable workflow.

## PBL Learning Outcomes

### Technical Learning

The project provided experience with React, component architecture, routing, Firebase Authentication, Firestore, Storage, Security Rules, responsive CSS, Git/GitHub, deployment preparation, debugging, and testing.

### Software Engineering Learning

The team practiced requirement analysis, system design, data modeling, access control, feature integration, version control, documentation, validation, and production-build preparation.

### Team Learning

The project required task division, collaborative debugging, communication, documentation, presentation, and incorporating mentor/faculty feedback.

## Project Team

The MBU CampusFinder project was developed collaboratively by a five-member team, with each member responsible for a specific functional area of the system. These responsibilities describe PBL contribution areas and do not claim that one member personally authored every related line of code.

### 1. Balaji Kiran Santhosh — UI and Frontend

- Designed and developed the user interface.
- Built React pages and reusable UI components.
- Implemented responsive layouts for desktop and mobile.
- Developed navigation and page structure.
- Added animations, transitions, and interactive effects.
- Integrated CampusFinder branding and visual design.
- Worked on overall frontend integration and user experience.

### 2. Satya Sai — Authentication

- Implemented Firebase Authentication.
- Developed student registration and login functionality.
- Implemented logout functionality.
- Integrated email verification.
- Implemented forgot-password and password-reset functionality.
- Managed authentication state.
- Implemented protected routes and authenticated access.

### 3. Prashanth — Lost and Found Reporting

- Developed the lost-item reporting workflow.
- Developed the found-item reporting workflow.
- Implemented report forms and validation.
- Added item categories and item details.
- Integrated report creation with Cloud Firestore.
- Implemented report ownership and status handling.
- Supported the complete report submission workflow.

### 4. Chandra Shakher — Search and Student Dashboard

- Developed item search and discovery functionality.
- Implemented browsing of approved lost and found reports.
- Worked on filtering and item discovery.
- Developed the student dashboard.
- Implemented display of the student's submitted reports.
- Added report-status information for students.
- Supported the student-side contact and recovery workflow.

### 5. Sravan — Admin Panel and Moderation

- Developed the administrator dashboard.
- Implemented pending-report review functionality.
- Developed report approval and rejection workflows.
- Implemented report removal and moderation functionality.
- Developed the admin report-details interface.
- Supported moderation and audit actions.
- Worked on administrator access control and moderation security.

### Team Collaboration

Although responsibilities were divided by functional area, all team members contributed to the development, testing, debugging, integration, and final refinement of MBU CampusFinder. The team collaborated through Git and GitHub and integrated individual modules into a single working campus lost-and-found platform.

## Team Contribution Table

| Member | Role | Main contribution areas |
| --- | --- | --- |
| Balaji Kiran Santhosh | UI and Frontend | React pages, reusable components, responsive design, navigation, branding |
| Satya Sai | Authentication | Firebase Auth, registration, login, verification, password reset, protected routes |
| Prashanth | Lost and Found Reporting | Report forms, validation, categories, Firestore reports, ownership, status handling |
| Chandra Shakher | Search and Student Dashboard | Search, filtering, discovery, student reports, status display, recovery workflow |
| Sravan | Admin Panel and Moderation | Admin dashboard, report review, moderation actions, audit, access control |

> Responsibilities represent the team's PBL contribution areas and were carried out collaboratively where required.

## PBL Mentor

**Basi Reddy M**  
**Assistant Professor · PBL Mentor**  
**Mohan Babu University**

> With the guidance and encouragement of Basi Reddy M, our team transformed an idea into a practical campus solution. We sincerely thank him for his valuable guidance, support, and motivation throughout this project.

## Project Outcome

CampusFinder demonstrates how a real campus problem can be converted into a practical software solution using React, Firebase Authentication, Cloud Firestore, Security Rules, moderation, responsive UI, and structured recovery workflows. The project is designed around the needs of the MBU campus community and includes backend authorization and data workflows rather than functioning only as a frontend prototype.

## Developed By

**MBU CampusFinder PBL Team**

- Satya Sai
- Prashanth
- Balaji Kiran Santhosh
- Sravan
- Chandra Shakher

### PBL Mentor

**Basi Reddy M**  
Assistant Professor · PBL Mentor  
Mohan Babu University

## License

This project is maintained for the MBU CampusFinder PBL project. No open-source license has been specified in the repository yet.
