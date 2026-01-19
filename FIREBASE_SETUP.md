# Firebase Setup Guide

This guide walks you through setting up Firebase for the Fiderca app.

## Prerequisites

- A Google account
- The Fiderca project cloned locally

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or "Create a project")
3. Enter project name (e.g., "Fiderca")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Web App to Firebase

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Register app with a nickname (e.g., "Fiderca Web")
3. Do NOT check "Firebase Hosting" (unless you plan to use it)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need these values)

## Step 3: Enable Firestore Database

1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose a location (e.g., `us-central1`)
4. Start in **production mode** (we'll add security rules next)
5. Click "Create"

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow users to read/write their own data
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

**Important**: These rules ensure users can only access their own data. The `userId` in the database must match the user's Google OAuth `sub` (subject) claim.

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env` in your project root
2. Fill in the values from your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Log in with Google OAuth
3. Try adding a connection or vault
4. Check Firebase Console > Firestore Database to see your data

## Firestore Data Structure

The app stores all user data in a single document per user:

```
userData (collection)
  └── {userId} (document)
      ├── connections: Array<Connection>
      ├── vaults: Array<Vault>
      ├── calendarEvents: Array<CalendarEvent>
      └── needs: Array<Need>
```

Each user's data is isolated and protected by security rules.

## Troubleshooting

### "Missing or insufficient permissions"
- Check that your Firestore security rules are properly configured
- Verify the user is logged in and authenticated
- Check browser console for auth errors

### Data not syncing
- Check browser console for Firebase errors
- Verify your `.env` file has correct Firebase config values
- Make sure Firebase config is not wrapped in quotes in `.env`

### CORS errors
- Verify your domain is authorized in Firebase Console
- Go to Project Settings > Authorized domains
- Add `localhost` for development

## Cost Considerations

Firebase Free Tier (Spark Plan) includes:
- 50,000 document reads per day
- 20,000 document writes per day
- 20,000 document deletes per day
- 1 GB stored data

This should be sufficient for development and small-scale usage. Monitor usage in Firebase Console > Usage and billing.

## Next Steps

- Consider enabling Firebase Authentication to replace the current Google OAuth implementation
- Set up Firebase indexes if you add complex queries
- Configure backup strategies for production use
- Monitor Firebase Console for usage patterns and errors
