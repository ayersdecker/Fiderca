import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserData, Connection, Vault, CalendarEvent, Need } from '../types';
import { useAuth } from './AuthContext';

interface UserDataContextType {
  connections: Connection[];
  vaults: Vault[];
  calendarEvents: CalendarEvent[];
  needs: Need[];
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

  // Load user data from localStorage when user changes
  useEffect(() => {
    if (user) {
      const storageKey = `userData_${user.sub}`;
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          // Convert date strings back to Date objects
          const data = {
            connections: parsed.connections.map((c: Connection) => ({
              ...c,
              connectedAt: new Date(c.connectedAt)
            })),
            vaults: parsed.vaults.map((v: Vault) => ({
              ...v,
              createdAt: new Date(v.createdAt),
              sharedWith: v.sharedWith.map(access => ({
                ...access,
                grantedAt: new Date(access.grantedAt),
                expiresAt: access.expiresAt ? new Date(access.expiresAt) : undefined
              }))
            })),
            calendarEvents: parsed.calendarEvents.map((e: CalendarEvent) => ({
              ...e,
              date: new Date(e.date)
            })),
            needs: parsed.needs.map((n: Need) => ({
              ...n,
              postedAt: new Date(n.postedAt)
            }))
          };
          setUserData(data);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          setUserData(EMPTY_USER_DATA);
        }
      } else {
        setUserData(EMPTY_USER_DATA);
      }
    } else {
      setUserData(EMPTY_USER_DATA);
    }
  }, [user]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const storageKey = `userData_${user.sub}`;
      localStorage.setItem(storageKey, JSON.stringify(userData));
    }
  }, [userData, user]);

  // Connection methods
  const addConnection = (connection: Omit<Connection, 'id' | 'connectedAt'>) => {
    const newConnection: Connection = {
      ...connection,
      id: Date.now().toString(),
      connectedAt: new Date()
    };
    setUserData(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setUserData(prev => ({
      ...prev,
      connections: prev.connections.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  };

  const deleteConnection = (id: string) => {
    setUserData(prev => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== id)
    }));
  };

  // Vault methods
  const addVault = (vault: Omit<Vault, 'id' | 'createdAt' | 'sharedWith'>) => {
    const newVault: Vault = {
      ...vault,
      id: Date.now().toString(),
      createdAt: new Date(),
      sharedWith: []
    };
    setUserData(prev => ({
      ...prev,
      vaults: [...prev.vaults, newVault]
    }));
  };

  const updateVault = (id: string, updates: Partial<Vault>) => {
    setUserData(prev => ({
      ...prev,
      vaults: prev.vaults.map(v => 
        v.id === id ? { ...v, ...updates } : v
      )
    }));
  };

  const deleteVault = (id: string) => {
    setUserData(prev => ({
      ...prev,
      vaults: prev.vaults.filter(v => v.id !== id)
    }));
  };

  // Calendar event methods
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    setUserData(prev => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, newEvent]
    }));
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setUserData(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map(e => 
        e.id === id ? { ...e, ...updates } : e
      )
    }));
  };

  const deleteCalendarEvent = (id: string) => {
    setUserData(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter(e => e.id !== id)
    }));
  };

  // Need methods
  const addNeed = (need: Omit<Need, 'id' | 'postedAt' | 'postedBy'>) => {
    const newNeed: Need = {
      ...need,
      id: Date.now().toString(),
      postedAt: new Date(),
      postedBy: user?.name || 'You'
    };
    setUserData(prev => ({
      ...prev,
      needs: [...prev.needs, newNeed]
    }));
  };

  const updateNeed = (id: string, updates: Partial<Need>) => {
    setUserData(prev => ({
      ...prev,
      needs: prev.needs.map(n => 
        n.id === id ? { ...n, ...updates } : n
      )
    }));
  };

  const deleteNeed = (id: string) => {
    setUserData(prev => ({
      ...prev,
      needs: prev.needs.filter(n => n.id !== id)
    }));
  };

  return (
    <UserDataContext.Provider
      value={{
        connections: userData.connections,
        vaults: userData.vaults,
        calendarEvents: userData.calendarEvents,
        needs: userData.needs,
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
