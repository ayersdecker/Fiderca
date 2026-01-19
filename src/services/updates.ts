import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Update } from '../types/circles';

// Helper to convert Firestore timestamps to Date
function timestampToDate(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp as string | number);
}

// ==================== UPDATES ====================

export async function createUpdate(
  circleId: string,
  authorId: string,
  text: string,
  imageUrl?: string
): Promise<string> {
  const updatesRef = collection(db, `circles/${circleId}/updates`);
  
  const updateData = {
    authorId,
    text,
    ...(imageUrl && { imageUrl }),
    createdAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(updatesRef, updateData);
  return docRef.id;
}

export async function getUpdates(circleId: string, limitCount: number = 50): Promise<Update[]> {
  const updatesRef = collection(db, `circles/${circleId}/updates`);
  const q = query(updatesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  const snapshot = await getDocs(q);
  const updates: Update[] = [];
  
  for (const updateDoc of snapshot.docs) {
    const data = updateDoc.data();
    
    // Fetch author details
    const userRef = doc(db, 'users', data.authorId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;
    
    updates.push({
      id: updateDoc.id,
      authorId: data.authorId,
      text: data.text,
      imageUrl: data.imageUrl,
      createdAt: timestampToDate(data.createdAt),
      authorName: userData?.displayName || userData?.name || 'Unknown',
      authorPhotoURL: userData?.photoURL || userData?.picture || '',
    });
  }
  
  return updates;
}

export function subscribeToUpdates(
  circleId: string,
  callback: (updates: Update[]) => void,
  limitCount: number = 50
): () => void {
  const updatesRef = collection(db, `circles/${circleId}/updates`);
  const q = query(updatesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  
  return onSnapshot(q, async (snapshot) => {
    const updates: Update[] = [];
    
    for (const updateDoc of snapshot.docs) {
      const data = updateDoc.data();
      
      // Fetch author details
      const userRef = doc(db, 'users', data.authorId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      
      updates.push({
        id: updateDoc.id,
        authorId: data.authorId,
        text: data.text,
        imageUrl: data.imageUrl,
        createdAt: timestampToDate(data.createdAt),
        authorName: userData?.displayName || userData?.name || 'Unknown',
        authorPhotoURL: userData?.photoURL || userData?.picture || '',
      });
    }
    
    callback(updates);
  });
}

export async function deleteUpdate(circleId: string, updateId: string): Promise<void> {
  const updateRef = doc(db, `circles/${circleId}/updates/${updateId}`);
  await deleteDoc(updateRef);
}
