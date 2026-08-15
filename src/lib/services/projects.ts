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
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "../firebase";

const getUserProjectsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "projects");
const getUserProjectDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "projects", id);

// --- Typy ---
export type Project = {
  id: string;
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

export function useProjects(status?: "ACTIVE" | "INBOX") {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserProjectsCol(), orderBy("createdAt", "desc"));
    if (status) {
      q = query(getUserProjectsCol(), where("status", "==", status), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [status, auth.currentUser?.uid]);

  return { projects, loading };
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !auth.currentUser) return;
    const unsubscribe = onSnapshot(getUserProjectDoc(id), (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      } else {
        setProject(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, auth.currentUser?.uid]);

  return { project, loading };
}

// --- Akcje Mutacji ---

export async function createProject(title: string, status: "ACTIVE" | "INBOX" = "ACTIVE", category?: string) {
  if (!auth.currentUser) return;
  return addDoc(getUserProjectsCol(), {
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

export async function updateProject(id: string, data: Partial<Project>) {
  if (!auth.currentUser) return;
  return updateDoc(getUserProjectDoc(id), data);
}

export async function deleteProject(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserProjectDoc(id));
}

// Aktywowanie z Inkubatora
export async function activateProject(id: string) {
  if (!auth.currentUser) return;
  return updateDoc(getUserProjectDoc(id), {
    status: "ACTIVE"
  });
}
