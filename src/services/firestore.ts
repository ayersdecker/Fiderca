import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Connection, Vault, CalendarEvent, Need, UserData } from '../types';

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

// Helper to convert Date objects to Firestore timestamps
function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// Get user data reference
function getUserDataRef(userId: string) {
  return doc(db, 'userData', userId);
}

// Subscribe to real-time updates
export function subscribeToUserData(
  userId: string,
  callback: (data: Omit<UserData, 'userId'>) => void
) {
  const userDataRef = getUserDataRef(userId);
  
  return onSnapshot(userDataRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Convert Firestore data back to our types with Date objects
      const userData = {
        connections: (data.connections || []).map((c: Record<string, unknown>) => ({
          ...c,
          connectedAt: timestampToDate(c.connectedAt),
        })),
        vaults: (data.vaults || []).map((v: Record<string, unknown>) => ({
          ...v,
          createdAt: timestampToDate(v.createdAt),
          sharedWith: (v.sharedWith as Array<Record<string, unknown>> || []).map((access: Record<string, unknown>) => ({
            ...access,
            grantedAt: timestampToDate(access.grantedAt),
            expiresAt: access.expiresAt ? timestampToDate(access.expiresAt) : undefined,
          })),
        })),
        calendarEvents: (data.calendarEvents || []).map((e: Record<string, unknown>) => ({
          ...e,
          date: timestampToDate(e.date),
        })),
        needs: (data.needs || []).map((n: Record<string, unknown>) => ({
          ...n,
          postedAt: timestampToDate(n.postedAt),
        })),
      };
      
      callback(userData);
    } else {
      // Initialize empty user data if it doesn't exist
      callback({
        connections: [],
        vaults: [],
        calendarEvents: [],
        needs: [],
      });
    }
  });
}

// Initialize user data in Firestore
export async function initializeUserData(userId: string): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  
  if (!docSnap.exists()) {
    await setDoc(userDataRef, {
      connections: [],
      vaults: [],
      calendarEvents: [],
      needs: [],
    });
  }
}

// Connection operations
export async function addConnection(
  userId: string,
  connection: Omit<Connection, 'id' | 'connectedAt'>
): Promise<Connection> {
  const newConnection: Connection = {
    ...connection,
    id: Date.now().toString(),
    connectedAt: new Date(),
  };
  
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.exists() ? docSnap.data() : {};
  const connections = currentData.connections || [];
  
  // Convert Date to Timestamp for Firestore
  const firestoreConnection = {
    ...newConnection,
    connectedAt: dateToTimestamp(newConnection.connectedAt),
  };
  
  await updateDoc(userDataRef, {
    connections: [...connections, firestoreConnection],
  });
  
  return newConnection;
}

export async function updateConnection(
  userId: string,
  connectionId: string,
  updates: Partial<Connection>
): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.connections) {
    const connections = (currentData.connections as Array<Record<string, unknown>>).map((c: Record<string, unknown>) =>
      c.id === connectionId ? { ...c, ...updates } : c
    );
    await updateDoc(userDataRef, { connections });
  }
}

export async function deleteConnection(userId: string, connectionId: string): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.connections) {
    const connections = (currentData.connections as Array<Record<string, unknown>>).filter((c: Record<string, unknown>) => c.id !== connectionId);
    await updateDoc(userDataRef, { connections });
  }
}

// Vault operations
export async function addVault(
  userId: string,
  vault: Omit<Vault, 'id' | 'createdAt' | 'sharedWith'>
): Promise<Vault> {
  const newVault: Vault = {
    ...vault,
    id: Date.now().toString(),
    createdAt: new Date(),
    sharedWith: [],
  };
  
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.exists() ? docSnap.data() : {};
  const vaults = currentData.vaults || [];
  
  const firestoreVault = {
    ...newVault,
    createdAt: dateToTimestamp(newVault.createdAt),
  };
  
  await updateDoc(userDataRef, {
    vaults: [...vaults, firestoreVault],
  });
  
  return newVault;
}

export async function updateVault(
  userId: string,
  vaultId: string,
  updates: Partial<Vault>
): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.vaults) {
    const vaults = (currentData.vaults as Array<Record<string, unknown>>).map((v: Record<string, unknown>) =>
      v.id === vaultId ? { ...v, ...updates } : v
    );
    await updateDoc(userDataRef, { vaults });
  }
}

export async function deleteVault(userId: string, vaultId: string): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.vaults) {
    const vaults = (currentData.vaults as Array<Record<string, unknown>>).filter((v: Record<string, unknown>) => v.id !== vaultId);
    await updateDoc(userDataRef, { vaults });
  }
}

// Calendar event operations
export async function addCalendarEvent(
  userId: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<CalendarEvent> {
  const newEvent: CalendarEvent = {
    ...event,
    id: Date.now().toString(),
  };
  
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.exists() ? docSnap.data() : {};
  const calendarEvents = currentData.calendarEvents || [];
  
  const firestoreEvent = {
    ...newEvent,
    date: dateToTimestamp(newEvent.date),
  };
  
  await updateDoc(userDataRef, {
    calendarEvents: [...calendarEvents, firestoreEvent],
  });
  
  return newEvent;
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  updates: Partial<CalendarEvent>
): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.calendarEvents) {
    const updatesWithTimestamp = {
      ...updates,
      date: updates.date ? dateToTimestamp(updates.date) : undefined,
    };
    
    const calendarEvents = (currentData.calendarEvents as Array<Record<string, unknown>>).map((e: Record<string, unknown>) =>
      e.id === eventId ? { ...e, ...updatesWithTimestamp } : e
    );
    await updateDoc(userDataRef, { calendarEvents });
  }
}

export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.calendarEvents) {
    const calendarEvents = (currentData.calendarEvents as Array<Record<string, unknown>>).filter((e: Record<string, unknown>) => e.id !== eventId);
    await updateDoc(userDataRef, { calendarEvents });
  }
}

// Need operations
export async function addNeed(
  userId: string,
  need: Omit<Need, 'id' | 'postedAt' | 'postedBy'>,
  postedBy: string
): Promise<Need> {
  const newNeed: Need = {
    ...need,
    id: Date.now().toString(),
    postedAt: new Date(),
    postedBy,
  };
  
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.exists() ? docSnap.data() : {};
  const needs = currentData.needs || [];
  
  const firestoreNeed = {
    ...newNeed,
    postedAt: dateToTimestamp(newNeed.postedAt),
  };
  
  await updateDoc(userDataRef, {
    needs: [...needs, firestoreNeed],
  });
  
  return newNeed;
}

export async function updateNeed(
  userId: string,
  needId: string,
  updates: Partial<Need>
): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.needs) {
    const needs = (currentData.needs as Array<Record<string, unknown>>).map((n: Record<string, unknown>) =>
      n.id === needId ? { ...n, ...updates } : n
    );
    await updateDoc(userDataRef, { needs });
  }
}

export async function deleteNeed(userId: string, needId: string): Promise<void> {
  const userDataRef = getUserDataRef(userId);
  const docSnap = await getDoc(userDataRef);
  const currentData = docSnap.data();
  
  if (currentData?.needs) {
    const needs = (currentData.needs as Array<Record<string, unknown>>).filter((n: Record<string, unknown>) => n.id !== needId);
    await updateDoc(userDataRef, { needs });
  }
}
