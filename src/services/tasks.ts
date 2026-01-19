import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Task, TaskStatus } from '../types/circles';

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

// ==================== TASKS ====================

export async function createTask(
  circleId: string,
  title: string,
  createdBy: string,
  assignedTo?: string,
  dueDate?: Date
): Promise<string> {
  const tasksRef = collection(db, `circles/${circleId}/tasks`);
  
  const taskData = {
    title,
    status: 'open' as TaskStatus,
    createdBy,
    createdAt: Timestamp.now(),
    ...(assignedTo && { assignedTo }),
    ...(dueDate && { dueDate: Timestamp.fromDate(dueDate) }),
  };
  
  const docRef = await addDoc(tasksRef, taskData);
  return docRef.id;
}

export async function getTasks(circleId: string, status?: TaskStatus): Promise<Task[]> {
  const tasksRef = collection(db, `circles/${circleId}/tasks`);
  const q = status
    ? query(tasksRef, where('status', '==', status), orderBy('createdAt', 'desc'))
    : query(tasksRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  const tasks: Task[] = [];
  
  for (const taskDoc of snapshot.docs) {
    const data = taskDoc.data();
    
    // Fetch assignee and creator details
    const assignedToData = data.assignedTo ? await getUserData(data.assignedTo) : null;
    const createdByData = await getUserData(data.createdBy);
    
    tasks.push({
      id: taskDoc.id,
      title: data.title,
      status: data.status as TaskStatus,
      createdBy: data.createdBy,
      createdAt: timestampToDate(data.createdAt),
      ...(data.assignedTo && { assignedTo: data.assignedTo }),
      ...(data.dueDate && { dueDate: timestampToDate(data.dueDate) }),
      assignedToName: assignedToData?.displayName || assignedToData?.name || undefined,
      createdByName: createdByData?.displayName || createdByData?.name || 'Unknown',
    });
  }
  
  return tasks;
}

async function getUserData(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

export function subscribeToTasks(
  circleId: string,
  callback: (tasks: Task[]) => void,
  status?: TaskStatus
): () => void {
  const tasksRef = collection(db, `circles/${circleId}/tasks`);
  const q = status
    ? query(tasksRef, where('status', '==', status), orderBy('createdAt', 'desc'))
    : query(tasksRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, async (snapshot) => {
    const tasks: Task[] = [];
    
    for (const taskDoc of snapshot.docs) {
      const data = taskDoc.data();
      
      // Fetch assignee and creator details
      const assignedToData = data.assignedTo ? await getUserData(data.assignedTo) : null;
      const createdByData = await getUserData(data.createdBy);
      
      tasks.push({
        id: taskDoc.id,
        title: data.title,
        status: data.status as TaskStatus,
        createdBy: data.createdBy,
        createdAt: timestampToDate(data.createdAt),
        ...(data.assignedTo && { assignedTo: data.assignedTo }),
        ...(data.dueDate && { dueDate: timestampToDate(data.dueDate) }),
        assignedToName: assignedToData?.displayName || assignedToData?.name || undefined,
        createdByName: createdByData?.displayName || createdByData?.name || 'Unknown',
      });
    }
    
    callback(tasks);
  });
}

export async function updateTask(
  circleId: string,
  taskId: string,
  updates: Partial<Pick<Task, 'title' | 'status' | 'assignedTo' | 'dueDate'>>
): Promise<void> {
  const taskRef = doc(db, `circles/${circleId}/tasks/${taskId}`);
  
  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.assignedTo !== undefined) updateData.assignedTo = updates.assignedTo;
  if (updates.dueDate !== undefined) {
    updateData.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
  }
  
  await updateDoc(taskRef, updateData);
}

export async function toggleTaskStatus(circleId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, `circles/${circleId}/tasks/${taskId}`);
  const taskSnap = await getDoc(taskRef);
  
  if (taskSnap.exists()) {
    const currentStatus = taskSnap.data().status as TaskStatus;
    const newStatus: TaskStatus = currentStatus === 'open' ? 'done' : 'open';
    await updateDoc(taskRef, { status: newStatus });
  }
}

export async function deleteTask(circleId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, `circles/${circleId}/tasks/${taskId}`);
  await deleteDoc(taskRef);
}
