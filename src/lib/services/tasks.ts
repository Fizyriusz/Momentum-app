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
const getUserTaskListsCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "taskLists");
const getUserTaskListDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "taskLists", id);
const getUserTaskDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "tasks", id);

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
  taskListId?: string | null; // Przypisanie do listy zadań
  projectId?: string | null; // Przypisanie do głównego projektu
  placeId?: string | null; // Powiązane z geolokalizacją (miejscem)
  column: string;
  tagNames?: string[];
  createdAt: any;
};

export type TaskList = {
  id: string;
  name: string;
  color?: string; // np. "purple", "blue", "emerald", "amber", "rose", "indigo"
  icon?: string; // np. "List", "Monitor", "Bookmark", "Target", "Home", "Briefcase", "Code", "Zap"
  projectId?: string | null;
  isArchived?: boolean;
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
    let q = query(getUserTasksCol());
    if (taskListIdOrProjectId) {
      q = query(
        getUserTasksCol(), 
        where("taskListId", "==", taskListIdOrProjectId)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          ...d,
          taskListId: d.taskListId || d.projectId || null
        } as Task;
      });

      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return timeB - timeA;
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
    let q = query(getUserTaskListsCol());
    if (projectId) {
      q = query(getUserTaskListsCol(), where("projectId", "==", projectId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskList));
      
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return timeB - timeA;
      });

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

export function useTaskList(id: string) {
  const [taskList, setTaskList] = useState<TaskList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !auth.currentUser) return;
    const unsubscribe = onSnapshot(getUserTaskListDoc(id), (docSnap) => {
      if (docSnap.exists()) {
        setTaskList({ id: docSnap.id, ...docSnap.data() } as TaskList);
      } else {
        setTaskList(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, auth.currentUser?.uid]);

  return { taskList, loading };
}

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
      const qDirect = query(getUserTasksCol(), where("projectId", "==", projectId));
      const unsubDirect = onSnapshot(qDirect, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        data.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
          return timeB - timeA;
        });
        setTasks(data);
        setLoadingTasks(false);
      }, () => setLoadingTasks(false));
      return () => unsubDirect();
    }

    const listIds = taskLists.map(p => p.id);
    if (listIds.length > 10) {
      listIds.length = 10;
    }

    const q = query(getUserTasksCol(), where("taskListId", "in", listIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return timeB - timeA;
      });
      setTasks(data);
      setLoadingTasks(false);
    }, () => setLoadingTasks(false));

    return () => unsubscribe();
  }, [taskLists, projectId, auth.currentUser?.uid]);

  return { 
    taskLists,
    projects: taskLists,
    tasks, 
    loading: taskListsLoading || loadingTasks 
  };
}

// --- Akcje Mutacji ---

export async function createTaskList(
  nameOrProjectId: string, 
  nameOrOptions?: string | { projectId?: string | null, icon?: string, color?: string },
  optionsParam?: { icon?: string, color?: string }
) {
  if (!auth.currentUser) return;
  
  let name = "";
  let projectId: string | null = null;
  let icon = "List";
  let color = "purple";

  if (typeof nameOrOptions === "string") {
    // Wywołanie w starym formacie: createTaskList(projectId, name)
    projectId = nameOrProjectId || null;
    name = nameOrOptions;
    if (optionsParam) {
      icon = optionsParam.icon || "List";
      color = optionsParam.color || "purple";
    }
  } else if (typeof nameOrOptions === "object") {
    // Nowy format: createTaskList(name, { projectId, icon, color })
    name = nameOrProjectId;
    projectId = nameOrOptions.projectId || null;
    icon = nameOrOptions.icon || "List";
    color = nameOrOptions.color || "purple";
  } else {
    name = nameOrProjectId;
  }

  return addDoc(getUserTaskListsCol(), {
    name: name.trim(),
    color,
    icon,
    projectId: projectId || null,
    isArchived: false,
    createdAt: serverTimestamp()
  });
}

export const createProjectList = createTaskList;

export async function updateTaskList(id: string, data: Partial<TaskList>) {
  if (!auth.currentUser) return;
  return updateDoc(getUserTaskListDoc(id), data);
}

export async function deleteTaskList(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserTaskListDoc(id));
}

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
  return updateDoc(getUserTaskDoc(id), {
    isCompleted,
    column: isCompleted ? "done" : "todo"
  });
}

export async function deleteTask(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserTaskDoc(id));
}

export async function updateTask(id: string, data: Partial<Task>) {
  if (!auth.currentUser) return;
  return updateDoc(getUserTaskDoc(id), data);
}
