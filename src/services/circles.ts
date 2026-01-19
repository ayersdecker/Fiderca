import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Circle, CircleType, CircleMember, MemberRole } from '../types/circles';

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

// ==================== CIRCLES ====================

export async function createCircle(
  name: string,
  type: CircleType,
  createdBy: string
): Promise<string> {
  const circlesRef = collection(db, 'circles');
  
  const circleData = {
    name,
    type,
    createdAt: Timestamp.now(),
    createdBy,
  };
  
  // Use transaction to create circle and add creator as admin member
  const circleId = await runTransaction(db, async (transaction) => {
    // Create the circle
    const circleRef = doc(circlesRef);
    transaction.set(circleRef, circleData);
    
    // Add creator as admin member
    const memberRef = doc(db, `circles/${circleRef.id}/members/${createdBy}`);
    transaction.set(memberRef, {
      role: 'admin',
      joinedAt: Timestamp.now(),
    });
    
    return circleRef.id;
  });
  
  return circleId;
}

export async function getCircle(circleId: string): Promise<Circle | null> {
  const circleRef = doc(db, 'circles', circleId);
  const circleSnap = await getDoc(circleRef);
  
  if (!circleSnap.exists()) {
    return null;
  }
  
  const data = circleSnap.data();
  return {
    id: circleSnap.id,
    name: data.name,
    type: data.type,
    createdAt: timestampToDate(data.createdAt),
    createdBy: data.createdBy,
  };
}

export async function getUserCircles(userId: string): Promise<Circle[]> {
  console.log('getUserCircles called with userId:', userId);
  console.log('Current auth user:', auth.currentUser?.uid);
  
  // Use collectionGroup to find all member documents for this user
  const membersQuery = query(collectionGroup(db, 'members'));
  
  console.log('Executing collectionGroup query for members...');
  
  const circles: Circle[] = [];
  const membersSnapshot = await getDocs(membersQuery);
  
  console.log('Found', membersSnapshot.size, 'total member documents');
  
  // For each member document, check if it's for our user
  for (const memberDoc of membersSnapshot.docs) {
    console.log('Checking member doc:', memberDoc.id, 'in circle:', memberDoc.ref.parent.parent?.id);
    // memberDoc.id is the userId in the members subcollection
    if (memberDoc.id !== userId) continue;
    
    // Get the parent circle ID
    const circleId = memberDoc.ref.parent.parent?.id;
    if (!circleId) continue;
    
    const circleRef = doc(db, 'circles', circleId);
    const circleSnap = await getDoc(circleRef);
    
    if (circleSnap.exists()) {
      const data = circleSnap.data();
      circles.push({
        id: circleSnap.id,
        name: data.name,
        type: data.type,
        createdAt: timestampToDate(data.createdAt),
        createdBy: data.createdBy,
      });
    }
  }
  
  console.log('Returning', circles.length, 'circles');
  return circles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function subscribeToUserCircles(
  userId: string,
  callback: (circles: Circle[]) => void
): () => void {
  // This is a simplified version - in production, you'd want a better query
  // For now, we'll poll the user's circles
  const fetchCircles = async () => {
    const circles = await getUserCircles(userId);
    callback(circles);
  };
  
  fetchCircles();
  const interval = setInterval(fetchCircles, 5000); // Poll every 5 seconds
  
  return () => clearInterval(interval);
}

export async function updateCircle(
  circleId: string,
  updates: Partial<Pick<Circle, 'name' | 'type'>>
): Promise<void> {
  const circleRef = doc(db, 'circles', circleId);
  await updateDoc(circleRef, updates);
}

export async function deleteCircle(circleId: string): Promise<void> {
  const circleRef = doc(db, 'circles', circleId);
  await deleteDoc(circleRef);
  // Note: Subcollections (members, updates, tasks, files) are not automatically deleted
  // In production, you'd want a Cloud Function to handle this
}

// ==================== MEMBERS ====================

export async function getCircleMembers(circleId: string): Promise<CircleMember[]> {
  const membersRef = collection(db, `circles/${circleId}/members`);
  const membersSnapshot = await getDocs(membersRef);
  
  const members: CircleMember[] = [];
  for (const memberDoc of membersSnapshot.docs) {
    const data = memberDoc.data();
    
    // Fetch user details from users collection
    const userRef = doc(db, 'users', memberDoc.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;
    
    members.push({
      uid: memberDoc.id,
      role: data.role as MemberRole,
      joinedAt: timestampToDate(data.joinedAt),
      displayName: userData?.displayName || userData?.name || 'Unknown',
      photoURL: userData?.photoURL || userData?.picture || '',
      email: userData?.email || '',
    });
  }
  
  return members.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
}

export async function addMember(
  circleId: string,
  userId: string,
  role: MemberRole = 'member'
): Promise<void> {
  const memberRef = doc(db, `circles/${circleId}/members/${userId}`);
  await setDoc(memberRef, {
    role,
    joinedAt: Timestamp.now(),
  });
}

export async function updateMemberRole(
  circleId: string,
  userId: string,
  role: MemberRole
): Promise<void> {
  const memberRef = doc(db, `circles/${circleId}/members/${userId}`);
  await updateDoc(memberRef, { role });
}

export async function removeMember(circleId: string, userId: string): Promise<void> {
  const memberRef = doc(db, `circles/${circleId}/members/${userId}`);
  await deleteDoc(memberRef);
}

export async function isCircleMember(circleId: string, userId: string): Promise<boolean> {
  const memberRef = doc(db, `circles/${circleId}/members/${userId}`);
  const memberSnap = await getDoc(memberRef);
  return memberSnap.exists();
}

export async function getCircleMemberRole(circleId: string, userId: string): Promise<MemberRole | null> {
  const memberRef = doc(db, `circles/${circleId}/members/${userId}`);
  const memberSnap = await getDoc(memberRef);
  
  if (!memberSnap.exists()) {
    return null;
  }
  
  return memberSnap.data().role as MemberRole;
}
