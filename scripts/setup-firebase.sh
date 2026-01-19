#!/bin/bash

# Firebase Database Setup Script
# This script helps you set up your Firebase project with the necessary configuration

set -e

echo "🔥 Firebase Database Setup for Fiderca"
echo "======================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI is installed"
echo ""

# Login to Firebase
echo "🔐 Please login to Firebase..."
firebase login

echo ""
echo "📋 Available Firebase projects:"
firebase projects:list

echo ""
read -p "Enter your Firebase project ID (or press Enter to create a new one): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo ""
    read -p "Enter a name for your new Firebase project: " PROJECT_NAME
    echo "Creating new Firebase project: $PROJECT_NAME"
    firebase projects:create "$PROJECT_NAME"
    PROJECT_ID="$PROJECT_NAME"
fi

echo ""
echo "🔧 Initializing Firebase in this project..."
firebase use "$PROJECT_ID"

# Initialize Firebase if not already initialized
if [ ! -f ".firebaserc" ]; then
    firebase init firestore --project "$PROJECT_ID"
else
    echo "✅ Firebase already initialized"
fi

# Deploy Firestore rules
echo ""
echo "📜 Deploying Firestore security rules..."
firebase deploy --only firestore:rules --project "$PROJECT_ID"

# Deploy Firestore indexes
echo ""
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project "$PROJECT_ID"

echo ""
echo "✅ Firebase setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get your Firebase config from: https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo "2. Scroll to 'Your apps' section and click the web app icon (</>)"
echo "3. If no web app exists, create one"
echo "4. Copy the configuration values"
echo "5. Update your .env file with these values:"
echo ""
echo "   VITE_FIREBASE_API_KEY=..."
echo "   VITE_FIREBASE_AUTH_DOMAIN=..."
echo "   VITE_FIREBASE_PROJECT_ID=..."
echo "   VITE_FIREBASE_STORAGE_BUCKET=..."
echo "   VITE_FIREBASE_MESSAGING_SENDER_ID=..."
echo "   VITE_FIREBASE_APP_ID=..."
echo ""
echo "6. Run 'npm run dev' to start your application"
echo ""
