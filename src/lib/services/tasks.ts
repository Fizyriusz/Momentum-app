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
  getDocs,
  writeBatch
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

export type KanbanColumn = {
  id: string;
  name: string;
  isCompletedColumn?: boolean;
  color?: string;
};

export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "todo", name: "Do zrobienia", isCompletedColumn: false },
  { id: "in_progress", name: "W trakcie", isCompletedColumn: false },
  { id: "done", name: "Zrobione", isCompletedColumn: true }
];

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
  columns?: KanbanColumn[];
  createdAt: any;
};

// Kompatybilność wsteczna aliasu
export type Project = TaskList;

// --- Hooki ---

export function useTasks(taskListIdOrProjectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }
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
    if (!auth.currentUser) {
      setTaskLists([]);
      setLoading(false);
      return;
    }
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
    if (!id || !auth.currentUser) {
      setTaskList(null);
      setLoading(false);
      return;
    }
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
    if (!auth.currentUser || !projectId) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    const q = query(getUserTasksCol());
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allTasks = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          taskListId: d.taskListId || null
        } as Task;
      });

      const listIds = new Set(taskLists.map(l => l.id));
      const filtered = allTasks.filter(t => 
        (t.taskListId && listIds.has(t.taskListId)) || (t.projectId === projectId)
      );

      filtered.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return timeB - timeA;
      });

      setTasks(filtered);
      setLoadingTasks(false);
    }, (error) => {
      console.error("Error in useProjectTasks:", error);
      setLoadingTasks(false);
    });

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
  
  // Aktualizacja samej listy
  await updateDoc(getUserTaskListDoc(id), data);

  // Jeśli zmieniono przypisanie do projektu, zaktualizuj wszystkie zadania należące do tej listy
  if (data.projectId !== undefined) {
    const tasksSnapshot = await getDocs(query(getUserTasksCol(), where("taskListId", "==", id)));
    const updatePromises = tasksSnapshot.docs.map(taskDoc => 
      updateDoc(doc(db, "users", auth.currentUser!.uid, "tasks", taskDoc.id), {
        projectId: data.projectId || null
      })
    );
    await Promise.all(updatePromises);
  }
}

export async function updateTaskListColumns(id: string, columns: KanbanColumn[]) {
  if (!auth.currentUser) return;
  return updateDoc(getUserTaskListDoc(id), { columns });
}

export async function deleteTaskList(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserTaskListDoc(id));
}

export async function createTask(
  title: string, 
  taskListId?: string, 
  dueDate?: Date, 
  placeId?: string, 
  projectId?: string,
  column: string = "todo"
) {
  if (!auth.currentUser) return;
  return addDoc(getUserTasksCol(), {
    title,
    isCompleted: column === "done",
    taskListId: taskListId || null,
    projectId: projectId || null,
    placeId: placeId || null,
    column: column || "todo",
    dueDate: dueDate ? dueDate.getTime() : null,
    createdAt: serverTimestamp()
  });
}

export async function setTaskColumn(taskId: string, columnId: string, isCompleted?: boolean) {
  if (!auth.currentUser) return;
  const updatePayload: any = { column: columnId };
  if (typeof isCompleted === "boolean") {
    updatePayload.isCompleted = isCompleted;
  }
  return updateDoc(getUserTaskDoc(taskId), updatePayload);
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

// --- Akcje Masowe (Bulk / Batch Operations) ---

export async function batchUpdateTasks(taskIds: string[], data: Partial<Task>) {
  if (!auth.currentUser || taskIds.length === 0) return;
  const batch = writeBatch(db);
  for (const id of taskIds) {
    batch.update(getUserTaskDoc(id), data as any);
  }
  return batch.commit();
}

export async function batchDeleteTasks(taskIds: string[]) {
  if (!auth.currentUser || taskIds.length === 0) return;
  const batch = writeBatch(db);
  for (const id of taskIds) {
    batch.delete(getUserTaskDoc(id));
  }
  return batch.commit();
}

export async function batchAddTagToTasks(taskIds: string[], tag: string) {
  if (!auth.currentUser || taskIds.length === 0 || !tag.trim()) return;
  const cleanTag = tag.trim().replace(/^#/, "");
  
  // Pobieramy zadania, aby scalić tagi
  const promises = taskIds.map(async (id) => {
    const taskDoc = getUserTaskDoc(id);
    const snap = await getDocs(query(getUserTasksCol(), where("__name__", "==", id)));
    if (!snap.empty) {
      const currentTags: string[] = snap.docs[0].data().tagNames || [];
      if (!currentTags.includes(cleanTag)) {
        await updateDoc(taskDoc, { tagNames: [...currentTags, cleanTag] });
      }
    }
  });
  return Promise.all(promises);
}

