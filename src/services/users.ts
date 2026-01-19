import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  picture: string;
  createdAt: Date;
}

// Initialize or update user profile
export async function initializeUserProfile(
  userId: string,
  email: string,
  name: string,
  picture: string
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user profile
    await setDoc(userRef, {
      userId,
      email,
      name,
      picture,
      createdAt: new Date(),
    });
  } else {
    // Update existing profile (in case name/picture changed)
    await setDoc(userRef, {
      userId,
      email,
      name,
      picture,
      createdAt: userSnap.data().createdAt,
    });
  }
}

// Search users by email
export async function searchUsersByEmail(searchEmail: string): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('email', '>=', searchEmail),
    where('email', '<=', searchEmail + '\uf8ff'),
    limit(10)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId: data.userId,
      email: data.email,
      name: data.name,
      picture: data.picture,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    userId: data.userId,
    email: data.email,
    name: data.name,
    picture: data.picture,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
}
