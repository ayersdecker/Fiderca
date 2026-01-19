import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CircleInvite, InviteStatus } from '../types/circles';

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

// ==================== INVITES ====================

export async function createInvite(
  circleId: string,
  email: string,
  invitedBy: string
): Promise<string> {
  const invitesRef = collection(db, `circles/${circleId}/invites`);
  
  // Check if invite already exists
  const existingQuery = query(
    invitesRef,
    where('email', '==', email.toLowerCase()),
    where('status', '==', 'pending')
  );
  const existingSnap = await getDocs(existingQuery);
  
  if (!existingSnap.empty) {
    throw new Error('An invite has already been sent to this email');
  }
  
  const inviteData = {
    email: email.toLowerCase(),
    invitedBy,
    createdAt: Timestamp.now(),
    status: 'pending' as InviteStatus,
  };
  
  const docRef = await addDoc(invitesRef, inviteData);
  return docRef.id;
}

export async function getUserInvites(userEmail: string): Promise<Array<CircleInvite & { circleId: string }>> {
  // Get all circles
  const circlesRef = collection(db, 'circles');
  const circlesSnapshot = await getDocs(circlesRef);
  
  const invites: Array<CircleInvite & { circleId: string }> = [];
  
  // Check invites for each circle
  for (const circleDoc of circlesSnapshot.docs) {
    const invitesRef = collection(db, `circles/${circleDoc.id}/invites`);
    const q = query(
      invitesRef,
      where('email', '==', userEmail.toLowerCase()),
      where('status', '==', 'pending')
    );
    
    const invitesSnapshot = await getDocs(q);
    
    for (const inviteDoc of invitesSnapshot.docs) {
      const data = inviteDoc.data();
      
      // Fetch inviter details
      const userRef = doc(db, 'users', data.invitedBy);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      
      // Get circle name
      const circleData = circleDoc.data();
      
      invites.push({
        id: inviteDoc.id,
        email: data.email,
        invitedBy: data.invitedBy,
        createdAt: timestampToDate(data.createdAt),
        status: data.status as InviteStatus,
        invitedByName: userData?.displayName || userData?.name || 'Someone',
        circleName: circleData.name,
        circleId: circleDoc.id,
      });
    }
  }
  
  return invites.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function subscribeToUserInvites(
  userEmail: string,
  callback: (invites: Array<CircleInvite & { circleId: string }>) => void
): () => void {
  // Simplified polling approach
  const fetchInvites = async () => {
    const invites = await getUserInvites(userEmail);
    callback(invites);
  };
  
  fetchInvites();
  const interval = setInterval(fetchInvites, 10000); // Poll every 10 seconds
  
  return () => clearInterval(interval);
}

export async function acceptInvite(
  circleId: string,
  inviteId: string,
  userId: string
): Promise<void> {
  // Mark invite as accepted
  const inviteRef = doc(db, `circles/${circleId}/invites/${inviteId}`);
  await updateDoc(inviteRef, {
    status: 'accepted',
  });
  
  // Add user as member
  const memberRef = doc(db, `circles/${circleId}/members/${userId}`);
  await updateDoc(memberRef, {
    role: 'member',
    joinedAt: Timestamp.now(),
  }).catch(async () => {
    // If member doesn't exist, create it
    const { setDoc } = await import('firebase/firestore');
    await setDoc(memberRef, {
      role: 'member',
      joinedAt: Timestamp.now(),
    });
  });
}

export async function rejectInvite(circleId: string, inviteId: string): Promise<void> {
  const inviteRef = doc(db, `circles/${circleId}/invites/${inviteId}`);
  await deleteDoc(inviteRef);
}

export async function getCircleInvites(circleId: string): Promise<CircleInvite[]> {
  const invitesRef = collection(db, `circles/${circleId}/invites`);
  const q = query(invitesRef, where('status', '==', 'pending'));
  
  const snapshot = await getDocs(q);
  const invites: CircleInvite[] = [];
  
  for (const inviteDoc of snapshot.docs) {
    const data = inviteDoc.data();
    
    // Fetch inviter details
    const userRef = doc(db, 'users', data.invitedBy);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;
    
    invites.push({
      id: inviteDoc.id,
      email: data.email,
      invitedBy: data.invitedBy,
      createdAt: timestampToDate(data.createdAt),
      status: data.status as InviteStatus,
      invitedByName: userData?.displayName || userData?.name || 'Unknown',
    });
  }
  
  return invites;
}
