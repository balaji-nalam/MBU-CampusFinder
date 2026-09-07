# MBU CampusFinder

## Software Specification

**Project:** MBU CampusFinder
**Title:** MBU CampusFinder: A Campus Lost and Found Management System
**Version:** 1.0
**Status:** Development Specification

---

## 1. Project Vision

MBU CampusFinder is a secure, modern, and easy-to-use web application for managing lost and found items within the MBU campus.

The goal is to replace scattered communication through WhatsApp groups, class groups, friends, and word-of-mouth with one centralized platform.

Students should be able to report lost or found items, discover matching items, and recover their belongings through the platform.

The application must be a **real deployable application**, not a static HTML demonstration.

---

## 2. Core User Flow

The primary flow is:

```text
Student
   ↓
Create Account
   ↓
Verify Email
   ↓
Login
   ↓
Report Lost / Report Found
   ↓
Admin Review
   ↓
Approved
   ↓
Visible to Campus Users
   ↓
Student Finds Matching Item
   ↓
Contact Reporter
   ↓
Item Recovered
   ↓
Mark as Resolved
```

---

## 3. User Roles

The system has two primary roles.

### 3.1 Student

A student can:

* Register using email and password.
* Verify their email.
* Login and logout.
* Reset their password.
* Manage their profile.
* Report lost items.
* Report found items.
* Upload item images.
* Search for items.
* Filter items.
* View item details.
* Contact a reporter.
* View their own reports.
* Edit their own active reports.
* Delete their own reports where allowed.
* Mark recovered items as resolved.

### 3.2 Administrator

An administrator can:

* Login securely.
* View pending reports.
* View report details and images.
* Approve reports.
* Reject reports.
* Remove inappropriate reports.
* Manage reported content.
* View system statistics.

Normal students must never be able to access administrator functionality.

---

# 4. Authentication

Authentication must use **Firebase Authentication**.

Do NOT create a custom password-storage system.

## Required functionality

### Registration

Fields:

* Full Name
* Email
* Password
* Confirm Password

### Email Verification

After registration:

```text
Register
   ↓
Verification Email
   ↓
User Opens Email
   ↓
Verify Account
   ↓
Access CampusFinder
```

Unverified users must not be allowed to create Lost/Found reports.

### Login

Users login using their registered email and password.

### Forgot Password

Users can request a password-reset email.

### Logout

Users can securely log out.

### Authentication Security

Passwords must be handled only by Firebase Authentication.

Never store passwords in Firestore.

---

# 5. Campus Email Restriction

The application should support restricting registration to an official MBU student email domain if one is available.

The domain must be configurable.

Do not assume or hard-code the MBU email domain until it has been confirmed.

If no official domain is available, normal email verification should be used.

---

# 6. Lost Item Reporting

A verified student can submit a Lost Item report.

Required information:

* Item Name
* Category
* Description
* Last Seen Location
* Date Lost
* Image
* Additional identifying information

Suggested categories:

* ID Card
* Wallet
* Keys
* Electronics
* Books
* Bags
* Clothing
* Documents
* Accessories
* Other

After submission:

```text
New Report
    ↓
PENDING
```

The report must not become publicly visible until an administrator approves it.

---

# 7. Found Item Reporting

A verified student can submit a Found Item report.

Required information:

* Item Name
* Category
* Description
* Found Location
* Date Found
* Image
* Additional information

After submission:

```text
New Report
    ↓
PENDING
```

The report becomes publicly visible only after administrator approval.

---

# 8. Report Status

Reports must support these states:

```text
PENDING
   ↓
APPROVED
   ↓
RESOLVED
```

Alternative states:

```text
PENDING → REJECTED
APPROVED → REMOVED
```

### Status definitions

**PENDING**

* Submitted by a student.
* Waiting for admin review.
* Not publicly visible.

**APPROVED**

* Approved by admin.
* Publicly visible.

**REJECTED**

* Rejected by admin.
* Not publicly visible.

**RESOLVED**

* Item has been recovered/returned.
* No longer considered an active report.

**REMOVED**

* Removed by administrator.

---

# 9. Public Item Discovery

Approved reports must be visible to authenticated users.

Each item should appear as a clean card containing:

* Item image
* Item name
* Lost/Found indicator
* Category
* Location
* Date
* Status
* View Details button

Example:

```text
+-----------------------------+
|                             |
|          ITEM IMAGE         |
|                             |
+-----------------------------+
| Black Wallet                |
| 🔴 LOST                     |
|                             |
| Category: Wallet            |
| Location: Library           |
| Date: 28 Aug 2026           |
|                             |
|      View Details →         |
+-----------------------------+
```

---

# 10. Search

Users must be able to search approved reports.

Search should support keywords related to:

* Item name
* Description
* Location
* Category

Search results should update without unnecessary page reloads.

---

# 11. Filters

Users should be able to filter reports by:

* Lost / Found
* Category
* Location
* Date

Filters should work together.

Example:

```text
Search: [ ID Card ]

Type:
[ All | Lost | Found ]

Category:
[ All Categories ]

Location:
[ All Locations ]

Date:
[ Any Date ]
```

---

# 12. Item Details

Each approved report must have a dedicated details view.

Display:

* Large item image
* Item name
* Lost/Found type
* Category
* Description
* Location
* Date
* Current status
* Relevant reporter information

Do not expose unnecessary private information.

---

# 13. Contact Reporter

Personal contact information should not be unnecessarily exposed publicly.

Preferred flow:

```text
View Item
    ↓
Contact Reporter
    ↓
Contact Request
    ↓
Reporter receives request
```

The implementation should protect personal information as much as reasonably possible.

Do not publicly display phone numbers or private email addresses unless explicitly required by the final design.

---

# 14. User Dashboard

Every authenticated student should have a dashboard.

The dashboard should show:

```text
My Dashboard

Total Reports
Active Reports
Pending Reports
Resolved Reports
```

Sections:

### My Lost Items

Show reports created by the current user.

### My Found Items

Show reports created by the current user.

### Available Actions

* View
* Edit
* Delete where allowed
* Mark as Resolved

Users must only be able to manage their own reports.

---

# 15. Admin Dashboard

The admin dashboard should provide:

### Statistics

* Total Users
* Total Reports
* Pending Reports
* Approved Reports
* Resolved Reports
* Rejected Reports

### Pending Reports

Admin actions:

* View
* Approve
* Reject

### Approved Reports

Admin actions:

* View
* Remove if necessary

The admin interface should be separate from the normal student dashboard.

---

# 16. Database

Use **Firebase Firestore**.

## Users

Collection:

```text
users/{uid}
```

Suggested fields:

```text
uid
fullName
email
role
createdAt
updatedAt
```

Possible roles:

```text
user
admin
```

Users must not be able to change their own role to `admin`.

---

## Reports

Collection:

```text
reports/{reportId}
```

Suggested fields:

```text
id
userId
type
itemName
category
description
location
date
imageUrl
status
createdAt
updatedAt
```

Possible `type` values:

```text
lost
found
```

Possible `status` values:

```text
pending
approved
rejected
resolved
removed
```

---

## Contact Requests

Collection:

```text
contactRequests/{requestId}
```

Suggested fields:

```text
id
reportId
requesterId
ownerId
message
status
createdAt
```

---

# 17. Image Storage

Use **Firebase Storage** for item images.

Requirements:

* Accept common image formats.
* Validate file type.
* Validate file size.
* Upload securely.
* Store the resulting image URL/reference in Firestore.

Images should not be stored directly as large binary data inside Firestore documents.

---

# 18. Security

Firebase Security Rules are mandatory.

### Users

A user can:

* Read appropriate profile information.
* Update their own profile.

A user cannot:

* Modify another user's profile.
* Change their own role.
* Assign themselves admin privileges.

### Reports

A verified user can:

* Create their own report.
* Update their own report where permitted.
* Delete their own report where permitted.

A user cannot:

* Modify another user's report.
* Approve a report.
* Reject a report.
* Change another user's report status.

### Admin

Only administrators can:

* Approve reports.
* Reject reports.
* Remove reports.
* Perform moderation operations.

---

# 19. Technology Stack

## Frontend

* React.js
* JavaScript
* HTML5
* CSS3

## Backend Services

* Firebase Authentication
* Firebase Firestore
* Firebase Storage

## Development

* Git
* GitHub
* VS Code

## Deployment

* Vercel

The application should be designed as a production-deployable web application.

---

# 20. Frontend Architecture

Use reusable React components.

Suggested structure:

```text
src/
│
├── components/
│   ├── Navbar
│   ├── Footer
│   ├── ItemCard
│   ├── SearchBar
│   ├── FilterPanel
│   ├── ReportForm
│   ├── StatusBadge
│   ├── LoadingSpinner
│   └── ProtectedRoute
│
├── pages/
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── VerifyEmail
│   ├── ForgotPassword
│   ├── LostItems
│   ├── FoundItems
│   ├── ItemDetails
│   ├── Dashboard
│   └── AdminDashboard
│
├── services/
│   ├── firebase
│   ├── auth
│   ├── reports
│   └── storage
│
├── hooks/
│
├── utils/
│
├── App.jsx
└── main.jsx
```

The implementation agent may adjust this structure if there is a clear technical reason.

---

# 21. Routes

Suggested application routes:

```text
/
 /login
 /register
 /verify-email
 /forgot-password

 /lost
 /found
 /items
 /items/:id

 /dashboard
 /my-reports

 /admin
 /admin/reports
 /admin/users
```

Authentication-protected routes must be protected.

Admin routes must have separate role-based protection.

---

# 22. UI/UX

The UI should be:

* Modern
* Clean
* Minimal
* Professional
* Student-friendly
* Responsive
* Accessible

The visual design should communicate:

**Campus + Trust + Discovery + Simplicity**

Use:

* Clean cards
* Consistent spacing
* Clear Lost/Found badges
* Clear status badges
* Simple navigation
* Strong primary actions
* Responsive forms
* Mobile-friendly layouts

Avoid excessive animations and unnecessary visual complexity.

---

# 23. Responsive Design

The application must work on:

* Mobile
* Tablet
* Laptop
* Desktop

Minimum target:

```text
320px+
```

The interface must remain usable on small mobile screens.

---

# 24. Error Handling

All important operations must have user-friendly error handling.

Examples:

```text
Invalid email address.
Incorrect password.
Please verify your email first.
Item name is required.
Please select a category.
Image size is too large.
Unable to submit report.
Something went wrong. Please try again.
```

Do not expose raw internal errors unnecessarily.

---

# 25. Loading States

Loading indicators are required for:

* Login
* Registration
* Email verification
* Report submission
* Image upload
* Database operations
* Search/loading reports
* Admin actions

Prevent duplicate submissions while an operation is in progress.

---

# 26. Empty States

Provide useful empty states.

Examples:

```text
No lost items found.

Try changing your search or filters.
```

```text
You haven't submitted any reports yet.
```

---

# 27. Real-Time Data

Where appropriate, use Firestore real-time listeners.

When an approved report or status changes, users should see the updated information without requiring unnecessary manual refreshes.

---

# 28. Privacy

The application must follow a privacy-conscious design.

Do not expose:

* Passwords
* Authentication tokens
* Firebase Admin credentials
* Private database credentials
* Unnecessary personal information

Users should not be required to publicly expose their phone number or personal email.

---

# 29. Environment Variables

Firebase configuration should be configured through environment variables where appropriate.

Example:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Never place Firebase Admin/service-account private credentials in frontend code.

Never commit secrets to GitHub.

---

# 30. Team Structure

The project has five members.

### Member 1 — UI / Frontend

Responsible for:

* Home page
* Navbar
* Footer
* Reusable components
* Responsive design
* Visual consistency

### Member 2 — Authentication

Responsible for:

* Registration
* Login
* Logout
* Email verification
* Password reset
* Authentication state
* Protected routes

### Member 3 — Lost & Found

Responsible for:

* Lost report form
* Found report form
* Image upload
* Firestore integration
* Form validation

### Member 4 — Search & User Dashboard

Responsible for:

* Search
* Filters
* Item details
* User dashboard
* Edit/delete
* Mark as resolved

### Member 5 — Admin

Responsible for:

* Admin dashboard
* Pending reports
* Approve/reject
* Remove reports
* Statistics
* Moderation

All members must use GitHub for collaboration.

---

# 31. Git Workflow

Recommended branches:

```text
main
develop

feature/auth
feature/lost-found
feature/search-dashboard
feature/admin
feature/ui
```

Rules:

1. Do not directly develop experimental features on `main`.
2. Use feature branches.
3. Use meaningful commit messages.
4. Test before merging.
5. Keep `main` stable.

Example commit messages:

```text
feat: add Firebase authentication
feat: add email verification
feat: add lost item form
feat: add found item form
feat: add item search
feat: add admin approval
feat: add user dashboard
fix: validate report form
style: improve responsive layout
```

---

# 32. MVP Requirements

The first production-ready version MUST contain:

* Real email registration.
* Email verification.
* Login/logout.
* Password reset.
* Lost item reporting.
* Found item reporting.
* Image upload.
* Shared Firestore database.
* Public approved-item listing.
* Search.
* Filtering.
* Item details.
* User dashboard.
* Admin dashboard.
* Admin approval/rejection.
* Mark as resolved.
* Firebase security rules.
* Responsive design.
* Production deployment.

Do not prioritize secondary features until all MVP requirements work.

---

# 33. Future Features

The following are optional and must not delay the MVP:

* Email notifications.
* Push notifications.
* PWA support.
* QR codes.
* Advanced analytics.
* College ID integration.
* AI-based item matching.
* Similar-item recommendations.
* Native mobile application.
* Advanced moderation.

---

# 34. Development Principles

The implementation agent MUST follow these principles:

1. Build incrementally.
2. Keep the architecture simple.
3. Prefer maintainable solutions.
4. Avoid unnecessary dependencies.
5. Use real Firebase Authentication.
6. Use real Firestore data.
7. Use real Firebase Storage for images.
8. Never use fake authentication in the final application.
9. Never use mock data as a replacement for the real backend.
10. Never store passwords manually.
11. Never expose secrets.
12. Implement Firebase Security Rules.
13. Validate user input.
14. Handle loading and error states.
15. Make the application responsive.
16. Use reusable components.
17. Test each feature before considering it complete.
18. Do not mark a feature as complete without verifying its actual behavior.
19. Do not introduce unnecessary advanced technologies.
20. Prioritize a working product over excessive features.

---

# 35. Definition of Done

The project is considered complete only when:

* The application runs locally.
* Registration works.
* Email verification works.
* Login works.
* Password reset works.
* Lost reports work.
* Found reports work.
* Images upload successfully.
* Firestore stores reports correctly.
* Approved reports are visible to other users.
* Search works.
* Filters work.
* User dashboard works.
* Admin approval works.
* Admin rejection works.
* Resolve functionality works.
* Security rules prevent unauthorized actions.
* Mobile layout works.
* Production deployment works.
* The live application can be accessed from a public URL.
* Multiple accounts have been tested.
* No critical console errors remain.

---

# 36. Final Product Requirement

The final application must feel like a **real campus service**, not a simple classroom CRUD project.

The essential experience is:

```text
        MBU CampusFinder
                |
       +--------+--------+
       |                 |
       v                 v
   Lost Item         Found Item
       |                 |
       +--------+--------+
                |
                v
          Admin Review
                |
         +------+------+
         |             |
      Reject         Approve
                       |
                       v
                Public Listing
                       |
                       v
                  Search/Find
                       |
                       v
                 Contact User
                       |
                       v
                 Item Recovered
                       |
                       v
                    RESOLVED
```

**Primary objective:**

> Build a secure, responsive, production-ready campus Lost and Found platform where verified MBU students can report, discover, and recover lost belongings through a centralized system.
