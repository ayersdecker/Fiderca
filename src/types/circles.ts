// Circles-first app type definitions

export type CircleType = 'Family' | 'Co-parents' | 'Friends' | 'Team' | 'Support';
export type MemberRole = 'admin' | 'member';
export type InviteStatus = 'pending' | 'accepted';
export type TaskStatus = 'open' | 'done';

export interface User {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  createdAt: Date;
}

export interface Circle {
  id: string;
  name: string;
  type: CircleType;
  createdAt: Date;
  createdBy: string;
}

export interface CircleMember {
  uid: string;
  role: MemberRole;
  joinedAt: Date;
  // Populated fields (not in Firestore)
  displayName?: string;
  photoURL?: string;
  email?: string;
}

export interface CircleInvite {
  id: string;
  email: string;
  invitedBy: string;
  createdAt: Date;
  status: InviteStatus;
  // Populated fields
  invitedByName?: string;
  circleName?: string;
}

export interface Update {
  id: string;
  authorId: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  // Populated fields
  authorName?: string;
  authorPhotoURL?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: Date;
  assignedTo?: string;
  status: TaskStatus;
  createdAt: Date;
  createdBy: string;
  // Populated fields
  assignedToName?: string;
  createdByName?: string;
}

export interface CircleFile {
  id: string;
  uploaderId: string;
  filename: string;
  storagePath: string;
  downloadUrl: string;
  createdAt: Date;
  // Populated fields
  uploaderName?: string;
}
