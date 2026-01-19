import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type ConnectionRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserPicture: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  status: ConnectionRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Send a connection request
export async function sendConnectionRequest(
  fromUserId: string,
  fromUserName: string,
  fromUserEmail: string,
  fromUserPicture: string,
  toUserId: string,
  toUserName: string,
  toUserEmail: string,
  toUserPicture: string
): Promise<string> {
  const requestsRef = collection(db, 'connectionRequests');
  
  const docRef = await addDoc(requestsRef, {
    fromUserId,
    fromUserName,
    fromUserEmail,
    fromUserPicture,
    toUserId,
    toUserName,
    toUserEmail,
    toUserPicture,
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
}

// Get pending requests sent by user
export async function getSentRequests(userId: string): Promise<ConnectionRequest[]> {
  const requestsRef = collection(db, 'connectionRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', userId),
    where('status', '==', 'pending')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      fromUserEmail: data.fromUserEmail,
      fromUserPicture: data.fromUserPicture,
      toUserId: data.toUserId,
      toUserName: data.toUserName,
      toUserEmail: data.toUserEmail,
      status: data.status as ConnectionRequestStatus,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

// Get pending requests received by user
export async function getReceivedRequests(userId: string): Promise<ConnectionRequest[]> {
  const requestsRef = collection(db, 'connectionRequests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      fromUserEmail: data.fromUserEmail,
      fromUserPicture: data.fromUserPicture,
      toUserId: data.toUserId,
      toUserName: data.toUserName,
      toUserEmail: data.toUserEmail,
      status: data.status as ConnectionRequestStatus,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

// Subscribe to received connection requests
export function subscribeToReceivedRequests(
  userId: string,
  callback: (requests: ConnectionRequest[]) => void
) {
  const requestsRef = collection(db, 'connectionRequests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        fromUserEmail: data.fromUserEmail,
        fromUserPicture: data.fromUserPicture,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        toUserEmail: data.toUserEmail,
        status: data.status as ConnectionRequestStatus,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    callback(requests);
  });
}

// Accept a connection request
export async function acceptConnectionRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, 'connectionRequests', requestId);
  await updateDoc(requestRef, {
    status: 'accepted',
    updatedAt: Timestamp.now(),
  });
}

// Reject a connection request
export async function rejectConnectionRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, 'connectionRequests', requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    updatedAt: Timestamp.now(),
  });
}

// Cancel a sent connection request
export async function cancelConnectionRequest(requestId: string): Promise<void> {
  const requestRef = doc(db, 'connectionRequests', requestId);
  await deleteDoc(requestRef);
}

// Check if a request already exists between two users
export async function checkExistingRequest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  const requestsRef = collection(db, 'connectionRequests');
  
  // Check if fromUser has sent a request to toUser
  const q1 = query(
    requestsRef,
    where('fromUserId', '==', fromUserId),
    where('toUserId', '==', toUserId),
    where('status', '==', 'pending')
  );
  
  // Check if toUser has sent a request to fromUser
  const q2 = query(
    requestsRef,
    where('fromUserId', '==', toUserId),
    where('toUserId', '==', fromUserId),
    where('status', '==', 'pending')
  );

  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2),
  ]);

  return !snapshot1.empty || !snapshot2.empty;
}
