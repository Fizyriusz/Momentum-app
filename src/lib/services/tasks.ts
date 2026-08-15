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

const getUserTasksCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "tasks");
const getUserTaskListsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "taskLists");

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
  taskListId?: string | null; // Przypisanie do podlisty
  projectId?: string | null; // Przypisanie do głównego projektu
  placeId?: string | null; // Powiązane z geolokalizacją (miejscem)
  column: string;
  tagNames?: string[];
  createdAt: any;
};

export type TaskList = {
  id: string;
  name: string;
  color: string;
  projectId?: string | null;
  createdAt: any;
};

// Kompatybilność wsteczna aliasu
export type Project = TaskList;

// --- Hooki ---

export function useTasks(taskListIdOrProjectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserTasksCol(), orderBy("createdAt", "desc"));
    if (taskListIdOrProjectId) {
      q = query(
        getUserTasksCol(), 
        where("taskListId", "==", taskListIdOrProjectId), 
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          ...d,
          // Obsługa wsteczna pola projectId z dawnych zadań
          taskListId: d.taskListId || d.projectId || null
        } as Task;
      });
      setTasks(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [taskListIdOrProjectId, auth.currentUser?.uid]);

  return { tasks, loading };
}

export function useTaskLists(projectId?: string) {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserTaskListsCol(), orderBy("createdAt", "desc"));
    if (projectId) {
      q = query(getUserTaskListsCol(), where("projectId", "==", projectId), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskList));
      setTaskLists(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching task lists:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId, auth.currentUser?.uid]);

  return { taskLists, loading };
}

// Alias dla kompatybilności
export const useProjects = useTaskLists;

export function useProjectTasks(projectId: string) {
  const { taskLists, loading: taskListsLoading } = useTaskLists(projectId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    if (taskLists.length === 0) {
      // Pobierz zadania przypisane bezpośrednio do projectId
      const qDirect = query(getUserTasksCol(), where("projectId", "==", projectId), orderBy("createdAt", "desc"));
      const unsubDirect = onSnapshot(qDirect, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(data);
        setLoadingTasks(false);
      }, () => setLoadingTasks(false));
      return () => unsubDirect();
    }

    const listIds = taskLists.map(p => p.id);
    if (listIds.length > 10) {
      listIds.length = 10;
    }

    const q = query(getUserTasksCol(), where("taskListId", "in", listIds), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(data);
      setLoadingTasks(false);
    }, () => setLoadingTasks(false));

    return () => unsubscribe();
  }, [taskLists, projectId, auth.currentUser?.uid]);

  return { 
    taskLists,
    projects: taskLists, // Kompatybilność wsteczna 
    tasks, 
    loading: taskListsLoading || loadingTasks 
  };
}

// --- Akcje Mutacji ---

export async function createTaskList(projectId: string, name: string) {
  if (!auth.currentUser) return;
  return addDoc(getUserTaskListsCol(), {
    name,
    color: "purple-500",
    projectId,
    createdAt: serverTimestamp()
  });
}

// Alias dla kompatybilności
export const createProjectList = createTaskList;

export async function createTask(title: string, taskListId?: string, dueDate?: Date, placeId?: string, projectId?: string) {
  if (!auth.currentUser) return;
  return addDoc(getUserTasksCol(), {
    title,
    isCompleted: false,
    taskListId: taskListId || null,
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
