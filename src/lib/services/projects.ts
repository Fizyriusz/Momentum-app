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

const getUserProjectsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "projects");
const getUserProjectDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "projects", id);

// --- Typy ---
export type ProjectStatus = "ACTIVE" | "INBOX" | "PAUSED";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
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
  updatedAt?: any;
};

export const MAX_ACTIVE_PROJECTS = 2;

// --- Hooki do Odczytu ---

export function useProjects(status?: ProjectStatus) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserProjectsCol());
    if (status) {
      q = query(getUserProjectsCol(), where("status", "==", status));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      // Sortowanie po stronie klienta (bezpieczne dla braku indeksów w Firestore)
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return timeB - timeA;
      });

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
    if (!id || !auth.currentUser) {
      setProject(null);
      setLoading(false);
      return;
    }
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

export async function createProject(title: string, status: ProjectStatus = "INBOX", category?: string) {
  if (!auth.currentUser) return;

  if (status === "ACTIVE") {
    const activeSnapshot = await getDocs(query(getUserProjectsCol(), where("status", "==", "ACTIVE")));
    if (activeSnapshot.size >= MAX_ACTIVE_PROJECTS) {
      throw new Error(`Osiągnięto limit ${MAX_ACTIVE_PROJECTS} aktywnych projektów.`);
    }
  }

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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateProject(id: string, data: Partial<Project>) {
  if (!auth.currentUser) return;
  return updateDoc(getUserProjectDoc(id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteProject(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserProjectDoc(id));
}

// Zmiana statusu projektu
export async function setProjectStatus(id: string, status: ProjectStatus) {
  if (!auth.currentUser) return;

  if (status === "ACTIVE") {
    const activeSnapshot = await getDocs(query(getUserProjectsCol(), where("status", "==", "ACTIVE")));
    // Jeśli ten dokument już jest aktywny, to nie liczymy go jako "nowy"
    const currentDoc = activeSnapshot.docs.find(d => d.id === id);
    if (!currentDoc && activeSnapshot.size >= MAX_ACTIVE_PROJECTS) {
      throw new Error(`Osiągnięto limit ${MAX_ACTIVE_PROJECTS} aktywnych projektów. Ukończ lub wstrzymaj obecny projekt przed aktywacją nowego.`);
    }
  }

  return updateDoc(getUserProjectDoc(id), {
    status,
    updatedAt: serverTimestamp()
  });
}

export async function activateProject(id: string) {
  return setProjectStatus(id, "ACTIVE");
}

export async function pauseProject(id: string) {
  return setProjectStatus(id, "PAUSED");
}

export async function sendProjectToInbox(id: string) {
  return setProjectStatus(id, "INBOX");
}
