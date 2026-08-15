"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  getDoc 
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getUserTimeLogsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "timeLogs");
const getUserProjectDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "projects", id);

export type TimeLog = {
  id: string;
  minutes: number;
  projectId: string;
  createdAt: any;
};

export function useTimeLogs(projectId: string) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !auth.currentUser) return;

    const q = query(
      getUserTimeLogsCol(), 
      where("projectId", "==", projectId), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          minutes: d.minutes,
          // Kompatybilność wsteczna z migracją (projectId || skillId)
          projectId: d.projectId || d.skillId || "",
          createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : d.createdAt || Date.now()
        } as TimeLog;
      });
      setTimeLogs(data);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [projectId, auth.currentUser?.uid]);

  return { timeLogs, loading };
}

// Global hook dla wszystkich time logów (np. do wyliczania statystyk)
export function useAllTimeLogs() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(getUserTimeLogsCol(), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          minutes: d.minutes,
          projectId: d.projectId || d.skillId || "",
          createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : d.createdAt || Date.now()
        } as TimeLog;
      });
      setTimeLogs(data);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  return { timeLogs, loading };
}

export async function addMinutesToProject(projectId: string, minutes: number) {
  if (!auth.currentUser) return;

  // 1. Dodanie logu czasu
  await addDoc(getUserTimeLogsCol(), {
    projectId,
    minutes,
    createdAt: serverTimestamp()
  });

  const projectRef = getUserProjectDoc(projectId);
  const dzisiaj = new Date().toISOString().split("T")[0];
  
  const projectSnap = await getDoc(projectRef);
  if (projectSnap.exists()) {
    const data = projectSnap.data();
    let updates: any = {
      loggedMinutes: increment(minutes)
    };
    
    if (data.lastLoggedDate !== dzisiaj) {
      updates.lastLoggedDate = dzisiaj;
      updates.loggedMinutesToday = minutes;
    } else {
      updates.loggedMinutesToday = increment(minutes);
    }
    
    await updateDoc(projectRef, updates);
  }
}

// Alias dla kompatybilności
export const addMinutesToSkill = addMinutesToProject;
