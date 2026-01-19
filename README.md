# Fiderca - Circles-First Social App

> **🎯 Recent Pivot**: Fiderca has been reimagined as a **Circles-first social app** for small private groups. See [README.CIRCLES.md](README.CIRCLES.md) for comprehensive documentation.

A private, circle-based social platform for small groups. Connect through family, co-parents, friends, teams, and support networks.

## ✨ Quick Links

- **[Full Documentation](README.CIRCLES.md)** - Complete setup guide for the new Circles app
- **[Firebase Setup](FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[Security Rules](firestore.circles.rules)** - Firestore security rules for Circles

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/Fiderca.git
cd Fiderca
npm install

# Set up Firebase environment variables (see README.CIRCLES.md)
# Create .env with your Firebase config

# Deploy security rules (IMPORTANT!)
firebase deploy --only firestore:rules
firebase deploy --only storage

# Run locally
npm run dev
```

Visit `http://localhost:5173/Fiderca/`

## 🎯 Core Features

- **Circles**: Create private groups (Family, Co-parents, Friends, Team, Support)
- **Updates**: Share text updates with circle members
- **Tasks**: Create and track tasks within circles
- **Files**: Upload and share files securely
- **Invites**: Email-based circle invitations

## 🛠 Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Router 7
- Firebase (Auth + Firestore + Storage)
- GitHub Pages deployment

## 📖 Documentation

For complete setup instructions, data model details, security configuration, and deployment guide, see **[README.CIRCLES.md](README.CIRCLES.md)**.

## 📝 Development Notes

This project recently pivoted from a trust-based networking platform to a Circles-first social app. Some legacy features (Connections, Vaults, Calendar) remain in the codebase for transition purposes.

## 📄 License

MIT License - see LICENSE file

---

Built with ❤️ using React, TypeScript, and Firebase
