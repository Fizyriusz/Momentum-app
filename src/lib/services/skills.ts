"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getUserSkillsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "skills");
const getUserSkillDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "skills", id);

// --- Typy ---
export type Skill = {
  id: string; // w Firestore ID to string
  title: string;
  status: "ACTIVE" | "INBOX";
  targetMinutes: number;
  period: string;
  loggedMinutes: number;
  loggedMinutesToday: number;
  lastLoggedDate: string;
  icon: string;
  category?: string | null;
  description?: string | null;
  goal?: string | null;
  createdAt: any;
};

// --- Hooki do Odczytu ---

export function useSkills(status?: "ACTIVE" | "INBOX") {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserSkillsCol(), orderBy("createdAt", "desc"));
    if (status) {
      q = query(getUserSkillsCol(), where("status", "==", status), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
      setSkills(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching skills:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [status, auth.currentUser?.uid]);

  return { skills, loading };
}

export function useSkill(id: string) {
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !auth.currentUser) return;
    const unsubscribe = onSnapshot(getUserSkillDoc(id), (docSnap) => {
      if (docSnap.exists()) {
        setSkill({ id: docSnap.id, ...docSnap.data() } as Skill);
      } else {
        setSkill(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, auth.currentUser?.uid]);

  return { skill, loading };
}

// --- Akcje Mutacji (Zamiast Server Actions) ---

export async function createSkill(title: string, status: "ACTIVE" | "INBOX" = "ACTIVE", category?: string) {
  return addDoc(getUserSkillsCol(), {
    title,
    status,
    category: category || null,
    targetMinutes: 240,
    period: "WEEK",
    loggedMinutes: 0,
    loggedMinutesToday: 0,
    lastLoggedDate: "",
    icon: "Briefcase",
    createdAt: serverTimestamp()
  });
}

export async function updateSkill(id: string, data: Partial<Skill>) {
  if (!auth.currentUser) return;
  return updateDoc(getUserSkillDoc(id), data);
}

export async function deleteSkill(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserSkillDoc(id));
}

// Aktywowanie z Inkubatora
export async function activateSkill(id: string) {
  if (!auth.currentUser) return;
  return updateDoc(getUserSkillDoc(id), {
    status: "ACTIVE"
  });
}
