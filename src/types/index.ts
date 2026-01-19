// Core types for the trust-based social platform

export type TrustLevel = 'core' | 'close' | 'trusted' | 'known';

export interface Connection {
  id: string;
  name: string;
  email: string;
  picture: string;
  trustLevel: TrustLevel;
  connectedAt: Date;
  notes?: string;
}

export interface Vault {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  sharedWith: VaultAccess[];
  ownerId?: string; // Track who owns the vault
  ownerName?: string; // Display owner name for shared vaults
}

export interface VaultAccess {
  connectionId: string;
  grantedAt: Date;
  expiresAt?: Date;
  canRevoke: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  sharedWith: string[]; // connection IDs
  needsBased?: boolean;
}

export interface Need {
  id: string;
  category: string;
  description: string;
  postedBy: string;
  postedAt: Date;
  trustLevelRequired: TrustLevel;
}

// User data structure
export interface UserData {
  userId: string;
  connections: Connection[];
  vaults: Vault[];
  sharedVaults: Vault[]; // Vaults shared with this user by others
  calendarEvents: CalendarEvent[];
  needs: Need[];
}
