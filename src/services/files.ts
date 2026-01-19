import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { CircleFile } from '../types/circles';

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

// ==================== FILES ====================

export async function uploadFile(
  circleId: string,
  uploaderId: string,
  file: File
): Promise<string> {
  // Upload file to Firebase Storage
  const storagePath = `circles/${circleId}/files/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  
  // Save metadata to Firestore
  const filesRef = collection(db, `circles/${circleId}/files`);
  const fileData = {
    uploaderId,
    filename: file.name,
    storagePath,
    downloadUrl,
    createdAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(filesRef, fileData);
  return docRef.id;
}

export async function getFiles(circleId: string): Promise<CircleFile[]> {
  const filesRef = collection(db, `circles/${circleId}/files`);
  const q = query(filesRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  const files: CircleFile[] = [];
  
  for (const fileDoc of snapshot.docs) {
    const data = fileDoc.data();
    
    // Fetch uploader details
    const userRef = doc(db, 'users', data.uploaderId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;
    
    files.push({
      id: fileDoc.id,
      uploaderId: data.uploaderId,
      filename: data.filename,
      storagePath: data.storagePath,
      downloadUrl: data.downloadUrl,
      createdAt: timestampToDate(data.createdAt),
      uploaderName: userData?.displayName || userData?.name || 'Unknown',
    });
  }
  
  return files;
}

export function subscribeToFiles(
  circleId: string,
  callback: (files: CircleFile[]) => void
): () => void {
  const filesRef = collection(db, `circles/${circleId}/files`);
  const q = query(filesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, async (snapshot) => {
    const files: CircleFile[] = [];
    
    for (const fileDoc of snapshot.docs) {
      const data = fileDoc.data();
      
      // Fetch uploader details
      const userRef = doc(db, 'users', data.uploaderId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
      
      files.push({
        id: fileDoc.id,
        uploaderId: data.uploaderId,
        filename: data.filename,
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl,
        createdAt: timestampToDate(data.createdAt),
        uploaderName: userData?.displayName || userData?.name || 'Unknown',
      });
    }
    
    callback(files);
  });
}

export async function deleteFile(circleId: string, fileId: string): Promise<void> {
  const fileRef = doc(db, `circles/${circleId}/files/${fileId}`);
  const fileSnap = await getDoc(fileRef);
  
  if (fileSnap.exists()) {
    const data = fileSnap.data();
    
    // Delete from Storage
    try {
      const storageRef = ref(storage, data.storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file from storage:', error);
    }
    
    // Delete from Firestore
    await deleteDoc(fileRef);
  }
}
