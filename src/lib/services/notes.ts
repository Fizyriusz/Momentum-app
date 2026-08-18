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

const getUserNotesCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "notes");
const getUserNoteDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "notes", id);

export type Note = {
  id: string;
  title: string;
  content: string;
  projectId?: string | null;
  createdAt: any;
  updatedAt: any;
};

export function useNotes(projectId?: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(getUserNotesCol(), orderBy("updatedAt", "desc"));
    
    if (projectId) {
      q = query(getUserNotesCol(), where("projectId", "==", projectId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title,
          content: d.content,
          // Kompatybilność z migracją (projectId || skillId)
          projectId: d.projectId || d.skillId || null,
          createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : (typeof d.createdAt === 'number' ? d.createdAt : Date.now()),
          updatedAt: d.updatedAt?.toMillis ? d.updatedAt.toMillis() : (typeof d.updatedAt === 'number' ? d.updatedAt : Date.now()),
        } as Note;
      });

      // Sortowanie po stronie klienta
      data.sort((a, b) => b.updatedAt - a.updatedAt);

      setNotes(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId, auth.currentUser?.uid]);

  return { notes, loading };
}

export async function createNote(data: { title: string, content: string, projectId?: string }) {
  if (!auth.currentUser) return;
  return addDoc(getUserNotesCol(), {
    title: data.title || "Nowa Notatka",
    content: data.content,
    projectId: data.projectId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateNote(id: string, data: { title?: string, content?: string }) {
  if (!auth.currentUser) return;
  return updateDoc(getUserNoteDoc(id), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteNote(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserNoteDoc(id));
}
