"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getUserHabitsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "habits");
const getUserHabitDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "habits", id);

export type Habit = {
  id: string;
  title: string;
  completedDates: string; // "[\"2026-08-01\"]" - zostawiamy ten format z SQLite dla prostoty migracji logiki
  sortOrder: number;
  createdAt: any;
};

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(getUserHabitsCol(), orderBy("sortOrder", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { habits, loading };
}

export async function toggleHabit(id: string, dateStr: string, completedDatesStr: string) {
  if (!auth.currentUser) return;
  let dates: string[] = [];
  try {
    dates = JSON.parse(completedDatesStr);
  } catch (e) {
    //
  }

  if (dates.includes(dateStr)) {
    dates = dates.filter(d => d !== dateStr);
  } else {
    dates.push(dateStr);
  }

  return updateDoc(getUserHabitDoc(id), {
    completedDates: JSON.stringify(dates)
  });
}

export async function createHabit(title: string) {
  if (!auth.currentUser) return;
  return addDoc(getUserHabitsCol(), {
    title,
    completedDates: "[]",
    sortOrder: 0,
    createdAt: serverTimestamp()
  });
}

export async function deleteHabit(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserHabitDoc(id));
}
