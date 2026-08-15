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
  doc
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getUserTimeLogsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "timeLogs");
const getUserSkillDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "skills", id);

export type TimeLog = {
  id: string;
  minutes: number;
  skillId: string;
  createdAt: any;
};

export function useTimeLogs(skillId: string) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!skillId || !auth.currentUser) return;

    const q = query(
      getUserTimeLogsCol(), 
      where("skillId", "==", skillId), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeLog));
      setTimeLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [skillId]);

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
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimeLog));
      setTimeLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { timeLogs, loading };
}

export async function addMinutesToSkill(skillId: string, minutes: number) {
  if (!auth.currentUser) return;
  // 1. Dodanie logu
  await addDoc(getUserTimeLogsCol(), {
    skillId,
    minutes,
    createdAt: serverTimestamp()
  });

  const { doc, updateDoc, increment, getDoc } = await import("firebase/firestore");
  const skillRef = getUserSkillDoc(skillId);
  
  // Najprościej użyć operacji atomicznej `increment` z Firebase
  const dzisiaj = new Date().toISOString().split("T")[0];
  
  const skillSnap = await getDoc(skillRef);
  if (skillSnap.exists()) {
    const data = skillSnap.data();
    let updates: any = {
      loggedMinutes: increment(minutes)
    };
    
    if (data.lastLoggedDate !== dzisiaj) {
      // Jeśli to pierwszy raz dzisiaj
      updates.lastLoggedDate = dzisiaj;
      updates.loggedMinutesToday = minutes; // nadpisujemy
    } else {
      updates.loggedMinutesToday = increment(minutes);
    }
    
    await updateDoc(skillRef, updates);
  }
}
