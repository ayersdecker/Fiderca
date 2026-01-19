#!/bin/bash

# Firebase Setup Validation Script
# Checks if all required Firebase configuration is in place

echo "🔍 Validating Firebase Setup..."
echo ""

ERRORS=0
WARNINGS=0

# Check if firebase.json exists
if [ -f "firebase.json" ]; then
    echo "✅ firebase.json found"
else
    echo "❌ firebase.json missing"
    ERRORS=$((ERRORS + 1))
fi

# Check if firestore.rules exists
if [ -f "firestore.rules" ]; then
    echo "✅ firestore.rules found"
else
    echo "❌ firestore.rules missing"
    ERRORS=$((ERRORS + 1))
fi

# Check if firestore.indexes.json exists
if [ -f "firestore.indexes.json" ]; then
    echo "✅ firestore.indexes.json found"
else
    echo "❌ firestore.indexes.json missing"
    ERRORS=$((ERRORS + 1))
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check for required Firebase environment variables
    REQUIRED_VARS=(
        "VITE_FIREBASE_API_KEY"
        "VITE_FIREBASE_AUTH_DOMAIN"
        "VITE_FIREBASE_PROJECT_ID"
        "VITE_FIREBASE_STORAGE_BUCKET"
        "VITE_FIREBASE_MESSAGING_SENDER_ID"
        "VITE_FIREBASE_APP_ID"
    )
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$VAR=" .env; then
            VALUE=$(grep "^$VAR=" .env | cut -d '=' -f2)
            if [ -z "$VALUE" ] || [[ "$VALUE" == *"your-"* ]]; then
                echo "⚠️  $VAR is not configured (still has placeholder value)"
                WARNINGS=$((WARNINGS + 1))
            else
                echo "✅ $VAR is configured"
            fi
        else
            echo "❌ $VAR is missing from .env"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo "❌ .env file missing (copy from .env.example)"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check if Firebase CLI is installed
if command -v firebase &> /dev/null; then
    echo "✅ Firebase CLI is installed"
    FIREBASE_VERSION=$(firebase --version)
    echo "   Version: $FIREBASE_VERSION"
else
    echo "⚠️  Firebase CLI is not installed"
    echo "   Install with: npm install -g firebase-tools"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if .firebaserc exists (indicates Firebase project is initialized)
if [ -f ".firebaserc" ]; then
    echo "✅ Firebase project initialized"
    PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d '"' -f4)
    echo "   Project: $PROJECT_ID"
else
    echo "⚠️  Firebase project not initialized"
    echo "   Run: npm run firebase:setup"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✨ Perfect! Your Firebase setup is complete!"
    echo ""
    echo "Next steps:"
    echo "1. If not already done: npm run firebase:setup"
    echo "2. Start your app: npm run dev"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Setup is mostly complete with $WARNINGS warning(s)"
    echo ""
    echo "Review warnings above and complete the setup"
else
    echo "❌ Setup incomplete with $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    echo "Please fix the errors above before proceeding"
    echo ""
    echo "📖 See FIREBASE_DATABASE_SETUP.md for detailed instructions"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
