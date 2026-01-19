import {
  collection,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Vault } from '../types';

// Helper to convert Firestore timestamps to Date objects
function timestampToDate(timestamp: unknown): Date {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp as string | number);
}

// Get all vaults shared with a specific user
export async function getVaultsSharedWithUser(userId: string): Promise<Vault[]> {
  const sharedVaults: Vault[] = [];
  
  // Query all userData documents
  const userDataRef = collection(db, 'userData');
  const snapshot = await getDocs(userDataRef);
  
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const ownerId = userDoc.id;
    
    // Get owner name from users collection
    let ownerName = 'Unknown';
    try {
      const userProfileDoc = await getDoc(doc(db, 'users', ownerId));
      if (userProfileDoc.exists()) {
        ownerName = userProfileDoc.data().name || 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching owner name:', error);
    }
    
    if (data.vaults) {
      data.vaults.forEach((vault: Record<string, unknown>) => {
        // Check if this vault is shared with the current user
        const sharedWith = vault.sharedWith as Array<Record<string, unknown>> || [];
        const isSharedWithUser = sharedWith.some(
          (access: Record<string, unknown>) => access.connectionId === userId
        );
        
        if (isSharedWithUser) {
          sharedVaults.push({
            id: vault.id as string,
            name: vault.name as string,
            description: vault.description as string,
            createdAt: timestampToDate(vault.createdAt),
            sharedWith: sharedWith.map((access: Record<string, unknown>) => ({
              connectionId: access.connectionId as string,
              grantedAt: timestampToDate(access.grantedAt),
              expiresAt: access.expiresAt ? timestampToDate(access.expiresAt) : undefined,
              canRevoke: access.canRevoke as boolean,
            })),
            ownerId,
            ownerName,
          });
        }
      });
    }
  }
  
  return sharedVaults;
}

// Subscribe to vaults shared with a user (real-time updates)
export function subscribeToSharedVaults(
  userId: string,
  callback: (vaults: Vault[]) => void
): () => void {
  const userDataRef = collection(db, 'userData');
  
  return onSnapshot(userDataRef, async (snapshot) => {
    const sharedVaults: Vault[] = [];
    
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      const ownerId = userDoc.id;
      
      // Get owner name from users collection
      let ownerName = 'Unknown';
      try {
        const userProfileDoc = await getDoc(doc(db, 'users', ownerId));
        if (userProfileDoc.exists()) {
          ownerName = userProfileDoc.data().name || 'Unknown';
        }
      } catch (error) {
        console.error('Error fetching owner name:', error);
      }
      
      if (data.vaults) {
        data.vaults.forEach((vault: Record<string, unknown>) => {
          const sharedWith = vault.sharedWith as Array<Record<string, unknown>> || [];
          const isSharedWithUser = sharedWith.some(
            (access: Record<string, unknown>) => access.connectionId === userId
          );
          
          if (isSharedWithUser) {
            sharedVaults.push({
              id: vault.id as string,
              name: vault.name as string,
              description: vault.description as string,
              createdAt: timestampToDate(vault.createdAt),
              sharedWith: sharedWith.map((access: Record<string, unknown>) => ({
                connectionId: access.connectionId as string,
                grantedAt: timestampToDate(access.grantedAt),
                expiresAt: access.expiresAt ? timestampToDate(access.expiresAt) : undefined,
                canRevoke: access.canRevoke as boolean,
              })),
              ownerId,
              ownerName,
            });
          }
        });
      }
    }
    
    callback(sharedVaults);
  });
}
