import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserData, Connection, Vault, CalendarEvent, Need } from '../types';
import { useAuth } from './AuthContext';
import * as firestoreService from '../services/firestore';

interface UserDataContextType {
  connections: Connection[];
  vaults: Vault[];
  calendarEvents: CalendarEvent[];
  needs: Need[];
  isLoading: boolean;
  addConnection: (connection: Omit<Connection, 'id' | 'connectedAt'>) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  addVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'sharedWith'>) => void;
  updateVault: (id: string, updates: Partial<Vault>) => void;
  deleteVault: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addNeed: (need: Omit<Need, 'id' | 'postedAt' | 'postedBy'>) => void;
  updateNeed: (id: string, updates: Partial<Need>) => void;
  deleteNeed: (id: string) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const EMPTY_USER_DATA: Omit<UserData, 'userId'> = {
  connections: [],
  vaults: [],
  calendarEvents: [],
  needs: []
};

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<Omit<UserData, 'userId'>>(EMPTY_USER_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to real-time Firestore updates when user changes
  useEffect(() => {
    if (!user) {
      setUserData(EMPTY_USER_DATA);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    let mounted = true;
    
    // Initialize user data in Firestore if it doesn't exist
    firestoreService.initializeUserData(user.sub).catch(console.error);
    
    // Subscribe to real-time updates
    const unsubscribe = firestoreService.subscribeToUserData(user.sub, (data) => {
      if (mounted) {
        setUserData(data);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount or user change
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [user]);

  // Connection methods
  const addConnection = (connection: Omit<Connection, 'id' | 'connectedAt'>) => {
    if (!user) return;
    
    firestoreService.addConnection(user.sub, connection).catch(console.error);
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    if (!user) return;
    
    firestoreService.updateConnection(user.sub, id, updates).catch(console.error);
  };

  const deleteConnection = (id: string) => {
    if (!user) return;
    
    firestoreService.deleteConnection(user.sub, id).catch(console.error);
  };

  // Vault methods
  const addVault = (vault: Omit<Vault, 'id' | 'createdAt' | 'sharedWith'>) => {
    if (!user) return;
    
    firestoreService.addVault(user.sub, vault).catch(console.error);
  };

  const updateVault = (id: string, updates: Partial<Vault>) => {
    if (!user) return;
    
    firestoreService.updateVault(user.sub, id, updates).catch(console.error);
  };

  const deleteVault = (id: string) => {
    if (!user) return;
    
    firestoreService.deleteVault(user.sub, id).catch(console.error);
  };

  // Calendar event methods
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;
    
    firestoreService.addCalendarEvent(user.sub, event).catch(console.error);
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;
    
    firestoreService.updateCalendarEvent(user.sub, id, updates).catch(console.error);
  };

  const deleteCalendarEvent = (id: string) => {
    if (!user) return;
    
    firestoreService.deleteCalendarEvent(user.sub, id).catch(console.error);
  };

  // Need methods
  const addNeed = (need: Omit<Need, 'id' | 'postedAt' | 'postedBy'>) => {
    if (!user) return;
    
    firestoreService.addNeed(user.sub, need, user.name || 'You').catch(console.error);
  };

  const updateNeed = (id: string, updates: Partial<Need>) => {
    if (!user) return;
    
    firestoreService.updateNeed(user.sub, id, updates).catch(console.error);
  };

  const deleteNeed = (id: string) => {
    if (!user) return;
    
    firestoreService.deleteNeed(user.sub, id).catch(console.error);
  };

  return (
    <UserDataContext.Provider
      value={{
        connections: userData.connections,
        vaults: userData.vaults,
        calendarEvents: userData.calendarEvents,
        needs: userData.needs,
        isLoading,
        addConnection,
        updateConnection,
        deleteConnection,
        addVault,
        updateVault,
        deleteVault,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addNeed,
        updateNeed,
        deleteNeed
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
