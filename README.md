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

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Google OAuth**
   - Copy `.env.example` to `.env`
   - Add your Google OAuth Client ID to the `.env` file:
     ```
     VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The app uses Google OAuth for authentication. All routes except `/login` are protected and require authentication.

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
