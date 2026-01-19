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
  runTransaction,
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
  toUserPicture: string;
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
      toUserPicture: data.toUserPicture,
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
      toUserPicture: data.toUserPicture,
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
        toUserPicture: data.toUserPicture,
        status: data.status as ConnectionRequestStatus,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    callback(requests);
  });
}

// Subscribe to accepted requests sent by user (to add them to connections)
export function subscribeToAcceptedSentRequests(
  userId: string,
  onAccepted: (request: ConnectionRequest) => void
) {
  const requestsRef = collection(db, 'connectionRequests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', userId),
    where('status', '==', 'accepted')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified' || change.type === 'added') {
        const data = change.doc.data();
        const request: ConnectionRequest = {
          id: change.doc.id,
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserEmail: data.fromUserEmail,
          fromUserPicture: data.fromUserPicture,
          toUserId: data.toUserId,
          toUserName: data.toUserName,
          toUserEmail: data.toUserEmail,
          toUserPicture: data.toUserPicture,
          status: data.status as ConnectionRequestStatus,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        onAccepted(request);
      }
    });
  });
}

// Accept a connection request (only updates current user's connections)
export async function acceptConnectionRequest(
  requestId: string,
  currentUserId: string
): Promise<void> {
  const requestRef = doc(db, 'connectionRequests', requestId);
  const currentUserRef = doc(db, 'userData', currentUserId);
  
  // Use a transaction to ensure atomic read-check-write
  await runTransaction(db, async (transaction) => {
    // Get the request data
    const requestSnap = await transaction.get(requestRef);
    if (!requestSnap.exists()) {
      throw new Error('Connection request not found');
    }
    
    const request = requestSnap.data();
    
    // Get current user's connections
    const currentUserSnap = await transaction.get(currentUserRef);
    const currentUserData = currentUserSnap.exists() ? currentUserSnap.data() : {};
    const currentUserConnections = currentUserData.connections || [];
    
    // Determine which user data to add
    const isReceiver = request.toUserId === currentUserId;
    const otherUserId = isReceiver ? request.fromUserId : request.toUserId;
    const otherUserName = isReceiver ? request.fromUserName : request.toUserName;
    const otherUserEmail = isReceiver ? request.fromUserEmail : request.toUserEmail;
    const otherUserPicture = isReceiver ? request.fromUserPicture : request.toUserPicture;
    
    // Check if connection already exists
    const connectionExists = currentUserConnections.some((c: { id: string }) => c.id === otherUserId);
    if (connectionExists) {
      // Connection already exists, but still update request status if needed
      if (request.status !== 'accepted') {
        transaction.update(requestRef, {
          status: 'accepted',
          updatedAt: Timestamp.now(),
        });
      }
      return;
    }
    
    // Update request status
    transaction.update(requestRef, {
      status: 'accepted',
      updatedAt: Timestamp.now(),
    });
    
    // Add connection to current user
    const connectionTimestamp = Timestamp.now();
    transaction.update(currentUserRef, {
      connections: [
        ...currentUserConnections,
        {
          id: otherUserId,
          name: otherUserName,
          email: otherUserEmail,
          picture: otherUserPicture,
          trustLevel: 'known',
          connectedAt: connectionTimestamp,
        },
      ],
    });
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
