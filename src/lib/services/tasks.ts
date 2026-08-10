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

const getUserTasksCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "tasks");
const getUserProjectsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "projects");

// --- Typy ---
export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: any;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  isCompleted: boolean;
  dueDate?: any; // Timestamp Firebase
  projectId?: string | null;
  placeId?: string | null; // Powiązane z geolokalizacją (miejscem)
  column: string;
  tagNames?: string[];
  createdAt: any;
};

export type Project = {
  id: string;
  name: string;
  color: string;
  skillId?: string | null;
  createdAt: any;
};

// --- Hooki ---

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserTasksCol(), orderBy("createdAt", "desc"));
    if (projectId) {
      q = query(getUserTasksCol(), where("projectId", "==", projectId), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [projectId, auth.currentUser?.uid]);

  return { tasks, loading };
}

export function useProjects(skillId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserProjectsCol(), orderBy("createdAt", "desc"));
    if (skillId) {
      q = query(getUserProjectsCol(), where("skillId", "==", skillId), orderBy("createdAt", "desc"));
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
  }, [skillId]);

  return { projects, loading };
}

export function useProjectTasks(skillId: string) {
  // Ten hook jest używany, żeby pobrać wszystkie projekty powiązane ze skillem 
  // oraz ich zadania. Firestore nie obsługuje relacji typu "join", więc
  // zrobimy to dwoma subskrypcjami.
  const { projects, loading: projectsLoading } = useProjects(skillId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (projects.length === 0 || !auth.currentUser) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    const projectIds = projects.map(p => p.id);
    if (projectIds.length > 10) {
      projectIds.length = 10;
    }

    const q = query(getUserTasksCol(), where("projectId", "in", projectIds), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(data);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [projects]);

  return { 
    projects, 
    tasks, 
    loading: projectsLoading || loadingTasks 
  };
}

// --- Akcje Mutacji ---

export async function createProjectList(skillId: string, name: string) {
  return addDoc(getUserProjectsCol(), {
    name,
    color: "purple-500",
    skillId,
    createdAt: serverTimestamp()
  });
}

export async function createTask(title: string, projectId?: string, dueDate?: Date, placeId?: string) {
  return addDoc(getUserTasksCol(), {
    title,
    isCompleted: false,
    projectId: projectId || null,
    placeId: placeId || null,
    column: "todo",
    dueDate: dueDate ? dueDate.getTime() : null,
    createdAt: serverTimestamp()
  });
}

export async function toggleTaskComplete(id: string, isCompleted: boolean) {
  if (!auth.currentUser) return;
  return updateDoc(doc(db, "users", auth.currentUser.uid, "tasks", id), {
    isCompleted,
    column: isCompleted ? "done" : "todo"
  });
}

export async function deleteTask(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(doc(db, "users", auth.currentUser.uid, "tasks", id));
}

export async function updateTask(id: string, data: Partial<Task>) {
  if (!auth.currentUser) return;
  return updateDoc(doc(db, "users", auth.currentUser.uid, "tasks", id), data);
}
