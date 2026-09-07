# Security Test Matrix

This matrix defines the required Firebase Security Rules tests for the current report lifecycle. It does not create test users or modify Firebase data.

## Test actors

- User A: owns Report A
- User B: owns Report B
- Admin: authenticated user with the Firebase custom claim `admin: true`

## Expected results

| Actor | Operation | Expected result |
|---|---|---|
| User A | Edit permitted fields on Report A while pending or approved | Allow |
| User A | Change Report A status to approved | Deny |
| User A | Change Report A visibility to public | Deny |
| User A | Change approvedByUid, approvedAt, rejectionReason, removedByUid, or removedAt | Deny |
| User A | Update Report B | Deny |
| User A | Resolve approved Report A with resolved metadata and restricted visibility | Allow |
| User A | Resolve pending, rejected, resolved, or removed Report A | Deny |
| User B | Update Report A | Deny |
| Admin | Approve pending Report A with moderation metadata | Allow |
| Admin | Reject pending or approved Report A with a reason | Allow |
| Admin | Remove pending, approved, or rejected Report A | Allow |
| Signed-in user | Read an approved and public report | Allow |
| Signed-in user | Read a pending, rejected, resolved, or removed report owned by another user | Deny |
| Signed-in user | Read another user's complete profile document | Deny |
| Signed-in user | Read their own profile document | Allow |
| Verified owner | Upload an image under their existing report path, at most 5 MB | Allow |
| Verified owner | Upload a non-image or an image larger than 5 MB | Deny |
| Verified user | Upload under another user's report path | Deny |
| Unverified user | Upload any report image | Deny |

## Current execution status

The matrix has not been executed against the live project because no dedicated User A, User B, or admin test credentials were provided. The rules are the enforcement authority; UI-only tests are insufficient for these cases.
