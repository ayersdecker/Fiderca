# Firebase Authentication Setup - IMPORTANT!

## 🔐 Enable Google Sign-In in Firebase Console

Your app now uses Firebase Authentication instead of standalone Google OAuth. You need to enable Google as a sign-in provider:

### Steps:

1. **Go to Firebase Console Authentication page**:
   https://console.firebase.google.com/project/fiderca-46ae8/authentication/providers

2. **Click "Get Started"** (if this is your first time in Authentication)

3. **Click "Google"** in the sign-in providers list

4. **Toggle "Enable"** to ON

5. **Select a support email** (your email from the dropdown)

6. **Click "Save"**

### That's it!

Once enabled, your app will be able to authenticate users with Google through Firebase Authentication, and the Firestore security rules will work correctly.

## Why This Change?

Your app was previously using `@react-oauth/google` which provides a JWT token but doesn't authenticate with Firebase. Firestore security rules need `request.auth.uid` which only exists when using Firebase Authentication.

Now:
- ✅ Users sign in through Firebase Auth with Google provider
- ✅ Firebase provides the `auth.uid` that Firestore rules require
- ✅ Firestore permissions work correctly
- ✅ Real-time sync is properly secured

## Test It

After enabling Google sign-in:

1. Start your app: `npm run dev`
2. Click "Sign in with Google"
3. Authorize with your Google account
4. You should be logged in and able to create connections/vaults
5. Check Firestore Console - data should save correctly!

## Removed Dependencies

You can optionally remove the old Google OAuth package (no longer needed):

```bash
npm uninstall @react-oauth/google
```

And remove `VITE_GOOGLE_CLIENT_ID` from your `.env` file (no longer used).
