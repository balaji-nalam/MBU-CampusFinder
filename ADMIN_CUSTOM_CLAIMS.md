# Firebase Admin Custom Claim Setup

This project uses Firebase Authentication custom claims as the real admin authorization boundary. Do not try to assign admin access from browser code or by editing a `users/{uid}` profile field.

## Required claim

```json
{ "admin": true }
```

## Secure server-side process

The repository includes `scripts/set-admin-claim.js`. It uses the Firebase Admin SDK only from Node.js and relies on Application Default Credentials. It does not contain a service-account key and must never be imported by the React app.

1. Install dependencies in the project directory:

```bash
npm install
```

2. Authenticate Application Default Credentials in a secure server or administrator workstation. For example, with Google Cloud CLI:

```bash
gcloud auth application-default login
```

The credential must belong to an identity allowed to manage Firebase Authentication users in `mbu-campusfinder`. Do not commit credential files, put them in `.env.local`, or paste private keys into this repository.

3. Optionally set the project explicitly without exposing credentials:

```bash
set FIREBASE_PROJECT_ID=mbu-campusfinder
```

On PowerShell, use `$env:FIREBASE_PROJECT_ID = 'mbu-campusfinder'`.

4. Run the procedure with either the Firebase Authentication user UID or the account email:

```bash
npm run set-admin -- <firebase-auth-uid-or-email>
```

For the current administrator account:

```bash
npm run set-admin -- nalambalaji2006@gmail.com
```

The script resolves an email with Firebase Admin SDK, reads the user, and preserves existing custom claims while adding `{ "admin": true }`. It prints only the resolved UID and project ID, never credential values.

5. Have the administrator sign out and sign back in. Firebase then issues an ID token containing the claim. The existing `AuthContext` reads that token with `getIdTokenResult(true)`, `AdminRoute` uses `isAdmin`, and Firestore Rules authorize `request.auth.token.admin == true`.

## Important rules

- Frontend code must not write admin claims.
- Do not trust `users/{uid}.role` for backend authorization.
- Do not expose any admin credential inside the web app.
- Do not set `GOOGLE_APPLICATION_CREDENTIALS` to a committed file or store a service-account private key in this project.
- The Firestore Security Rules must check `request.auth.token.admin == true`.
