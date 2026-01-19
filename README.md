# Fiderca
Network with Purpose

A trust-based social platform prototype centered on intentional connections and meaningful relationships.

## Features

- **Trust-Based Connections**: Organize relationships by trust levels (Core, Close, Trusted, Known)
- **Permissioned Vaults**: Share information selectively with temporary, revocable access
- **Calendar Planning**: Coordinate with trusted connections
- **Search by Need**: Find connections based on actual needs, not popularity

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- Google OAuth 2.0 (@react-oauth/google)
- Firebase (Firestore for database storage)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized JavaScript origins (e.g., `http://localhost:5173`)
   - Copy the Client ID

3. **Configure Firebase Database** 🔥
   
   **Quick Setup (Recommended):**
   ```bash
   npm run firebase:setup
   ```
   
   **Manual Setup:**
   - See [FIREBASE_DATABASE_SETUP.md](FIREBASE_DATABASE_SETUP.md) for detailed instructions
   - Quick reference: [FIREBASE_QUICK_REFERENCE.md](FIREBASE_QUICK_REFERENCE.md)

4. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Google OAuth Client ID
   - Add your Firebase configuration values from Firebase Console
   - See `.env.example` for required variables

5. **Start development server**
   ```bash
   npm run dev
   ```

The app uses Google OAuth for authentication and Firebase Firestore for data persistence. All routes except `/login` are protected and require authentication.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Design Principles

- Calm, minimal, serious aesthetic
- No infinite scroll
- No gamification
- Clear intent before actions
- Relationship-based trust roles
- Temporary and revocable permissions
