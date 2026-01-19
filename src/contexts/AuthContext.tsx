import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { initializeUserProfile } from '../services/users';

export interface User {
  email: string;
  name: string;
  picture: string;
  sub: string; // Firebase uid
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Create user object from Firebase user
        const userData: User = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          picture: firebaseUser.photoURL || '',
          sub: firebaseUser.uid, // Use Firebase uid as sub
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Initialize user profile in Firestore
        if (firebaseUser.email && firebaseUser.displayName) {
          initializeUserProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.photoURL || ''
          ).catch(console.error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        login,
        logout,
        isAuthenticated: !!firebaseUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
