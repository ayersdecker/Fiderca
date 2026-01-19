# Firebase Database - Quick Reference

## 🚀 Quick Setup

1. **Run automated setup**:
   ```bash
   npm run firebase:setup
   ```

2. **Get Firebase config** from [Console](https://console.firebase.google.com/)

3. **Update `.env`** with your Firebase credentials

4. **Start development**:
   ```bash
   npm run dev
   ```

## 📝 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run firebase:setup` | Complete Firebase setup (automated) |
| `npm run firebase:deploy` | Deploy rules and indexes |
| `npm run firebase:rules` | Deploy security rules only |
| `npm run firebase:indexes` | Deploy database indexes only |

## 🔐 Environment Variables

Required in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 📚 Database Structure

```
userData/{userId}
  ├── connections: Connection[]
  ├── vaults: Vault[]
  ├── calendarEvents: CalendarEvent[]
  └── needs: Need[]
```

## 🔧 Common Operations

### Import Firestore Service
```typescript
import {
  addConnection,
  updateConnection,
  deleteConnection,
  addVault,
  shareVault,
  subscribeToUserData
} from '@/services/firestore';
```

### Subscribe to User Data (Real-time)
```typescript
const unsubscribe = subscribeToUserData(userId, (data) => {
  console.log('User data updated:', data);
});

// Cleanup
unsubscribe();
```

### Add Connection
```typescript
await addConnection(userId, {
  name: 'John Doe',
  trustLevel: 'trusted',
  notes: 'Met at conference'
});
```

### Create Vault
```typescript
await addVault(userId, {
  name: 'Personal Photos',
  description: 'Family vacation photos 2025'
});
```

### Share Vault
```typescript
await shareVault(userId, vaultId, {
  connectionId: 'connection-123',
  canRevoke: true,
  expiresAt: new Date('2026-12-31')
});
```

## 🛡️ Security Rules

- ✅ Users can only access their own data
- ✅ Authentication required for all operations
- ✅ userId must match authenticated user's uid
- ✅ Document structure validation enforced

## 🐛 Troubleshooting

### Permission Denied
- Check Firebase security rules are deployed
- Verify user is authenticated
- Ensure userId matches auth.uid

### Environment Variables Not Loading
- Restart dev server after `.env` changes
- Check variable names start with `VITE_`
- Verify no quotes around values

### Firebase Not Initialized
- Check all required env vars are set
- Verify Firebase config in console
- Look for errors in browser console

## 📖 Full Documentation

For complete setup instructions, see [FIREBASE_DATABASE_SETUP.md](FIREBASE_DATABASE_SETUP.md)

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Pricing Calculator](https://firebase.google.com/pricing)
