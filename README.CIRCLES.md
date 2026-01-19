# Fiderca - Circles-First Social App

A private, circle-based social platform for small groups. Connect through family, co-parents, friends, teams, and support networks.

## 🎯 Features

### Core Features (MVP)
- **Circles**: Create private groups for family, co-parents, friends, teams, or support
- **Updates Feed**: Share text updates with your circle members
- **Tasks**: Create and track tasks within circles, assign to members
- **Files**: Upload and share files securely within circles
- **Invites**: Invite members by email to join your circles

### Authentication
- Email/password sign up and sign in
- Google OAuth integration
- User profiles with display name and photo

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Backend**: Firebase
  - Authentication (Email/Password + Google OAuth)
  - Firestore Database
  - Cloud Storage (for file uploads)
- **Hosting**: GitHub Pages

## 📋 Prerequisites

- Node.js 18+ and npm
- A Firebase project
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/Fiderca.git
cd Fiderca
npm install
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

#### Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (configure OAuth consent screen)

#### Enable Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode** (we'll deploy rules later)
4. Choose a location close to your users

#### Enable Cloud Storage
1. Go to **Storage**
2. Click "Get started"
3. Start in **production mode**
4. Use default location

#### Get Firebase Config
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps"
3. Click web icon (`</>`) to add a web app
4. Register app with nickname (e.g., "Fiderca Web")
5. Copy the `firebaseConfig` object

### 3. Environment Variables

Create `.env` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Deploy Firestore Security Rules

**Important**: Deploy the security rules before using the app!

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Select:
# - Firestore
# - Storage
# Choose your Firebase project
# Accept default file names

# Copy the new rules
cp firestore.circles.rules firestore.rules

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

**Storage Rules** (edit `storage.rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /circles/{circleId}/files/{fileName} {
      // Only authenticated circle members can upload
      allow write: if request.auth != null;
      // Only authenticated users can read (checked by Firestore rules)
      allow read: if request.auth != null;
    }
  }
}
```

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173/Fiderca/`

## 📖 Usage Guide

### Creating Your First Circle

1. **Sign up** with email/password or Google
2. Go to **Circles** in the navigation
3. Click **"+ New Circle"**
4. Enter a name and select a type (Family, Co-parents, Friends, Team, Support)
5. Click **"Create Circle"**

### Inviting Members

1. Open a circle
2. Go to the **Members** tab
3. Enter an email address in the invite form
4. Click **"Send Invite"**

### Accepting Invites

1. Go to **Invites** in the navigation
2. You'll see pending invites
3. Click **"Accept"** to join a circle

### Sharing Updates

1. Open a circle
2. Stay on the **Updates** tab
3. Write your update in the text area
4. Click **"Post Update"**

### Managing Tasks

1. Open a circle
2. Go to the **Tasks** tab
3. Enter a task title and click **"Add Task"**
4. Check/uncheck tasks to mark them done
5. Delete tasks you no longer need

### Uploading Files

1. Open a circle
2. Go to the **Files** tab
3. Click **"Choose file"** and select a file
4. File uploads automatically
5. Click file names to download

## 🔐 Security & Privacy

- All circle data is private - only members can access
- Each user can only modify their own content (updates, tasks they created)
- Admins can manage circle membership
- Files are stored securely in Firebase Storage
- Security rules enforce access control at the database level

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
│   └── Layout.tsx  # Main app layout with navigation
├── config/         # Firebase configuration
│   └── firebase.ts
├── contexts/       # React contexts for global state
│   ├── AuthContext.tsx       # Authentication state
│   └── UserDataContext.tsx   # Legacy (can be removed)
├── pages/          # Page components (routes)
│   ├── CirclesList.tsx    # List of user's circles
│   ├── CircleDetail.tsx   # Circle with tabs (Updates/Tasks/Files/Members)
│   ├── Invites.tsx        # Pending circle invites
│   ├── Home.tsx           # Landing page
│   └── Login.tsx          # Auth page
├── services/       # Firebase service layers
│   ├── circles.ts         # Circle CRUD operations
│   ├── updates.ts         # Updates CRUD
│   ├── tasks.ts           # Tasks CRUD
│   ├── files.ts           # File upload/download
│   ├── invites.ts         # Invite management
│   └── users.ts           # User profile operations
├── types/          # TypeScript type definitions
│   └── circles.ts         # All types for Circles app
└── App.tsx         # Main app with routing
```

## 🗄️ Data Model

### Firestore Collections

```
/circles/{circleId}
  - name: string
  - type: 'Family' | 'Co-parents' | 'Friends' | 'Team' | 'Support'
  - createdBy: string (userId)
  - createdAt: timestamp

  /members/{userId}
    - role: 'admin' | 'member'
    - joinedAt: timestamp

  /updates/{updateId}
    - authorId: string
    - text: string
    - imageUrl?: string
    - createdAt: timestamp

  /tasks/{taskId}
    - title: string
    - status: 'open' | 'done'
    - createdBy: string
    - assignedTo?: string
    - dueDate?: timestamp
    - createdAt: timestamp

  /files/{fileId}
    - uploaderId: string
    - filename: string
    - storagePath: string
    - downloadUrl: string
    - createdAt: timestamp

  /invites/{inviteId}
    - email: string
    - invitedBy: string
    - status: 'pending' | 'accepted'
    - createdAt: timestamp

/users/{userId}
  - displayName: string
  - email: string
  - photoURL?: string
  - createdAt: timestamp
```

## 🚢 Deployment

### Deploy to GitHub Pages

1. **Update `vite.config.ts`**:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/Fiderca/', // Your repo name
})
```

2. **Build**:
```bash
npm run build
```

3. **Deploy** (using gh-pages):
```bash
npm install -g gh-pages
gh-pages -d dist
```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Save

5. **Update Firebase Auth Domain**:
   - Go to Firebase Console → Authentication → Settings
   - Add your GitHub Pages domain to authorized domains
   - Example: `yourusername.github.io`

## 🧪 Testing

### Test with Multiple Accounts

1. Sign up with one email/Google account
2. Create a circle
3. Invite another email address
4. Sign out and sign in with the invited email
5. Accept the invite in the Invites page
6. Test creating updates, tasks, and uploading files

## 🐛 Troubleshooting

### "Permission denied" errors
- Make sure you deployed the Firestore security rules
- Check that you're logged in
- Verify you're a member of the circle you're trying to access

### Files not uploading
- Check Firebase Storage is enabled
- Verify storage rules are deployed
- Check browser console for errors

### Invites not working
- Ensure the invited email is spelled correctly
- Check Firestore rules allow reading invites by email
- Verify Firebase Auth is properly configured

## 📝 Development Notes

### Legacy Features
The app still has legacy routes (Connections, Vaults, Calendar) from the previous version. These can be removed in future updates.

### Future Enhancements (Not in MVP)
- Comments on updates
- Reactions/likes
- Image uploads for updates
- Task due date notifications
- Direct messages between circle members
- Multiple circle admins
- Circle settings and customization

## 📄 License

MIT License - see LICENSE file

## 🤝 Contributing

This is currently a private project. For questions or issues, please contact the maintainer.

---

Built with ❤️ using React, TypeScript, and Firebase
