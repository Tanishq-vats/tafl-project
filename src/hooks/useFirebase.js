import { useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// useFirebase — hook for saving/loading Turing Machine configs to Firestore
// Gracefully degrades when Firebase is not configured.
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTION = 'machines';
const isFirebaseReady = () => db != null;

export function useFirebase() {
  const [savedMachines, setSavedMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /** Save a machine configuration to Firestore */
  const saveMachine = useCallback(async (config) => {
    if (!isFirebaseReady()) {
      toast.error('Firebase not configured. See /src/lib/firebase.js to add your credentials.');
      return null;
    }

    setIsLoading(true);
    try {
      const docData = {
        name: config.name || 'Untitled Machine',
        description: config.description || '',
        initialTape: config.initialTape || '',
        initialState: config.initialState || 'q0',
        blankSymbol: config.blankSymbol || 'B',
        acceptStates: config.acceptStates || ['qAccept'],
        rejectStates: config.rejectStates || ['qReject'],
        rules: config.rules || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION), docData);
      toast.success('Machine saved to cloud! 🎉');
      return docRef.id;
    } catch (err) {
      console.error('Error saving machine:', err);
      toast.error('Failed to save machine. Check console for details.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Load all saved machines from Firestore */
  const loadMachines = useCallback(async () => {
    if (!isFirebaseReady()) {
      setSavedMachines([]);
      return [];
    }

    setIsLoading(true);
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const machines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSavedMachines(machines);
      return machines;
    } catch (err) {
      console.error('Error loading machines:', err);
      toast.error('Failed to load saved machines.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Load a single machine by ID */
  const loadMachineById = useCallback(async (machineId) => {
    if (!isFirebaseReady()) {
      toast.error('Firebase not configured.');
      return null;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, COLLECTION, machineId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        toast.error('Machine not found.');
        return null;
      }
    } catch (err) {
      console.error('Error loading machine:', err);
      toast.error('Failed to load machine.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Delete a machine by ID */
  const deleteMachine = useCallback(async (machineId) => {
    if (!isFirebaseReady()) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, COLLECTION, machineId));
      setSavedMachines(prev => prev.filter(m => m.id !== machineId));
      toast.success('Machine deleted.');
    } catch (err) {
      console.error('Error deleting machine:', err);
      toast.error('Failed to delete machine.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Generate a shareable URL for a machine */
  const getShareUrl = useCallback((machineId) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?machine=${machineId}`;
  }, []);

  return {
    savedMachines,
    isLoading,
    saveMachine,
    loadMachines,
    loadMachineById,
    deleteMachine,
    getShareUrl,
    isFirebaseReady: isFirebaseReady(),
  };
}
