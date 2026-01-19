# Complete Firebase Database Setup Guide

This guide provides a complete walkthrough for setting up Firebase Firestore database for Fiderca.

## Quick Start (Automated)

Run the automated setup script:

```bash
./scripts/setup-firebase.sh
```

This script will:
- Check/install Firebase CLI
- Help you create or select a Firebase project
- Deploy security rules
- Deploy database indexes

Then follow the on-screen instructions to update your `.env` file.

## Manual Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `Fiderca` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended for production)
5. Click **"Create project"**
6. Wait for project creation to complete

### 2. Enable Firestore Database

1. In Firebase Console, navigate to **Build** → **Firestore Database**
2. Click **"Create database"**
3. **Start in production mode** (we'll deploy custom rules)
4. Choose a location closest to your users:
   - `us-central1` (Iowa) - US users
   - `us-east1` (South Carolina) - US East Coast
   - `europe-west1` (Belgium) - European users
   - `asia-northeast1` (Tokyo) - Asian users
5. Click **"Enable"**

### 3. Register Web App

1. In Firebase Console, go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** section
3. Click the web icon `</>` to add a web app
4. Register app:
   - App nickname: `Fiderca Web`
   - ❌ Do NOT check "Firebase Hosting" (unless you plan to use it)
5. Click **"Register app"**
6. **Copy the configuration object** - you'll need these values

### 4. Configure Environment Variables

1. Copy your Firebase configuration values from step 3
2. Update your `.env` file in the project root:

```env
# Google OAuth (keep your existing value)
VITE_GOOGLE_CLIENT_ID=your-existing-google-client-id

# Firebase Configuration (add these)
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 5. Deploy Security Rules

Option A - Using Firebase CLI (Recommended):

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy the security rules
firebase deploy --only firestore:rules
```

Option B - Manual deployment:

1. Go to Firebase Console → **Firestore Database** → **Rules** tab
2. Copy the contents of `firestore.rules` file
3. Paste into the rules editor
4. Click **"Publish"**

### 6. Deploy Indexes (Optional but Recommended)

```bash
# Deploy Firestore indexes for better query performance
firebase deploy --only firestore:indexes
```

Or manually in Firebase Console → **Firestore Database** → **Indexes** tab.

### 7. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser (typically `http://localhost:5173`)

3. Log in with Google OAuth

4. Try creating a connection or vault

5. Verify data in Firebase Console:
   - Go to **Firestore Database** → **Data** tab
   - You should see a `userData` collection
   - Click on your user document (ID matches your Google OAuth `uid`)
   - Verify your connections, vaults, etc. are stored

## Database Structure

Fiderca uses a simple, user-centric data structure:

```
📁 userData (collection)
  └── 📄 {userId} (document)
      ├── connections: Array<Connection>
      ├── vaults: Array<Vault>
      ├── calendarEvents: Array<CalendarEvent>
      └── needs: Array<Need>
```

### Data Models

#### Connection
```typescript
{
  id: string;
  name: string;
  trustLevel: 'core' | 'close' | 'trusted' | 'known';
  connectedAt: Timestamp;
  notes?: string;
}
```

#### Vault
```typescript
{
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
  sharedWith: Array<{
    connectionId: string;
    grantedAt: Timestamp;
    expiresAt?: Timestamp;
    canRevoke: boolean;
  }>;
}
```

#### CalendarEvent
```typescript
{
  id: string;
  title: string;
  date: Timestamp;
  sharedWith: string[]; // connection IDs
  needsBased?: boolean;
}
```

#### Need
```typescript
{
  id: string;
  category: string;
  description: string;
  postedBy: string;
  postedAt: Timestamp;
  trustLevelRequired: 'core' | 'close' | 'trusted' | 'known';
}
```

## Security Rules Explanation

The deployed security rules (`firestore.rules`) ensure:

1. **Authentication Required**: Users must be logged in to access any data
2. **User Isolation**: Users can only read/write their own data (`userId` matches `auth.uid`)
3. **Data Validation**: Documents must have required fields (connections, vaults, etc.)
4. **No Cross-User Access**: Users cannot access other users' data

Example rule:
```javascript
match /userData/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Firestore SDK Usage

Your app already has the necessary Firestore integration in `src/services/firestore.ts`:

### Available Functions

- `subscribeToUserData(userId, callback)` - Real-time sync of user data
- `initializeUserData(userId)` - Create initial user document
- `addConnection(userId, connection)` - Add new connection
- `updateConnection(userId, connectionId, updates)` - Update connection
- `deleteConnection(userId, connectionId)` - Remove connection
- `addVault(userId, vault)` - Create new vault
- `updateVault(userId, vaultId, updates)` - Update vault
- `deleteVault(userId, vaultId)` - Delete vault
- `shareVault(userId, vaultId, access)` - Share vault with connection
- `revokeVaultAccess(userId, vaultId, connectionId)` - Revoke vault access
- And more for calendar events and needs...

## Troubleshooting

### "Missing or insufficient permissions" Error

**Cause**: Security rules are blocking the request.

**Solutions**:
1. Verify security rules are deployed correctly
2. Check that user is authenticated (logged in)
3. Ensure `userId` in the path matches `request.auth.uid`
4. Check browser console for detailed error messages

### Firebase Configuration Not Found

**Cause**: Environment variables not set correctly.

**Solutions**:
1. Verify `.env` file exists in project root
2. Ensure all `VITE_FIREBASE_*` variables are set
3. Restart dev server after changing `.env`
4. Check that values don't have quotes or extra spaces

### Data Not Syncing

**Cause**: Firestore connection issues or rules blocking writes.

**Solutions**:
1. Check browser network tab for Firebase requests
2. Verify internet connection
3. Check Firebase Console → **Firestore Database** → **Usage** tab
4. Look for errors in browser console
5. Ensure user document exists (call `initializeUserData` on first login)

### "Firebase: Error (auth/invalid-api-key)"

**Cause**: Incorrect API key in `.env` file.

**Solutions**:
1. Double-check `VITE_FIREBASE_API_KEY` in `.env`
2. Get correct value from Firebase Console → Project Settings
3. Ensure no extra spaces or quotes around the value

## Performance Tips

1. **Use Real-time Listeners Sparingly**: The app uses `subscribeToUserData()` which is efficient for real-time updates. Don't create multiple listeners.

2. **Batch Operations**: When making multiple changes, consider batching them:
   ```typescript
   const batch = writeBatch(db);
   // Add multiple operations
   await batch.commit();
   ```

3. **Offline Persistence**: Firestore automatically caches data. Enable offline persistence in `firebase.ts` if needed:
   ```typescript
   enableIndexedDbPersistence(db);
   ```

4. **Indexes**: The included `firestore.indexes.json` defines necessary composite indexes for efficient queries.

## Production Checklist

Before deploying to production:

- [ ] Security rules deployed and tested
- [ ] Indexes deployed
- [ ] Environment variables configured for production
- [ ] Firebase project has appropriate billing plan
- [ ] Backup strategy in place
- [ ] Monitoring enabled in Firebase Console
- [ ] Rate limiting considered for security
- [ ] User data migration plan (if upgrading from another system)

## Cost Management

Firestore pricing is based on:
- Document reads, writes, deletes
- Data storage
- Network bandwidth

**Free tier limits** (Spark plan):
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

For production, consider upgrading to Blaze (pay-as-you-go) plan.

## Support

- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Pricing](https://firebase.google.com/pricing)
- [Firebase Status](https://status.firebase.google.com/)

## Next Steps

After completing the database setup:

1. ✅ Test authentication with Google OAuth
2. ✅ Create test connections and vaults
3. ✅ Verify real-time sync works
4. 📱 Consider mobile app setup (React Native with same Firebase project)
5. 🔔 Add push notifications (Firebase Cloud Messaging)
6. 📊 Enable Analytics for usage insights
7. 🚀 Deploy to production hosting

---

**Need help?** Check the browser console for errors or open an issue in the project repository.
