# Quick Firebase Setup

## 1. Create Firebase Project
Visit: https://console.firebase.google.com/
- Click "Add project"
- Name it (e.g., "Fiderca")
- Create

## 2. Add Web App
- Click web icon `</>`
- Register app
- Copy config values

## 3. Enable Firestore
- Build → Firestore Database
- Create database
- Choose location
- Start in production mode

## 4. Add Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Configure .env
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 6. Test
```bash
npm run dev
```
Login and try adding data. Check Firestore Console to verify.

---

For detailed instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
