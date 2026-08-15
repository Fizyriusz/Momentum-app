/**
 * Skrypt migracyjny: Przepisanie kolekcji Firestore
 * 
 * Mapowanie:
 * 1. users/{uid}/projects (dawne podlisty) -> users/{uid}/taskLists (podlisty) [skillId -> projectId]
 * 2. users/{uid}/skills (dawne skille) -> users/{uid}/projects (główne projekty)
 * 3. users/{uid}/notes: pole `skillId` -> `projectId`
 * 4. users/{uid}/timeLogs: pole `skillId` -> `projectId`
 * 5. users/{uid}/tasks: pole `projectId` -> `taskListId`
 * 
 * UWAGA: Skrypt jest przygotowany do uruchomienia z poziomu aplikacji lub jednorazowego wywołania po zalogowaniu.
 * Nie wykonuje żadnych operacji automatycznie bez wyraźnego wywołania funkcji `runMigration()`.
 */

import { db, auth } from "../firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  deleteField 
} from "firebase/firestore";

export async function runMigration(userId?: string) {
  const uid = userId || auth.currentUser?.uid;
  if (!uid) {
    throw new Error("Brak zalogowanego użytkownika do przeprowadzenia migracji.");
  }

  console.log(`[MIGRACJA] Rozpoczynam migrację danych dla użytkownika: ${uid}`);

  // 1. Migracja dawnych podlist: users/{uid}/projects -> users/{uid}/taskLists
  console.log("[MIGRACJA] Krok 1: Przenoszenie dawnych podlist (projects -> taskLists)...");
  const oldProjectsCol = collection(db, "users", uid, "projects");
  const oldProjectsSnapshot = await getDocs(oldProjectsCol);

  for (const docSnap of oldProjectsSnapshot.docs) {
    const data = docSnap.data();
    const taskListRef = doc(db, "users", uid, "taskLists", docSnap.id);
    
    // Zapis do nowej kolekcji taskLists ze zmianą skillId -> projectId
    await setDoc(taskListRef, {
      name: data.name || "Lista zadań",
      color: data.color || "purple-500",
      projectId: data.skillId || null,
      createdAt: data.createdAt || new Date()
    });

    console.log(`  -> Przeniesiono podlistę: ${docSnap.id} (${data.name})`);
  }

  // 2. Migracja głównych projektów: users/{uid}/skills -> users/{uid}/projects
  console.log("[MIGRACJA] Krok 2: Przenoszenie projektów głównych (skills -> projects)...");
  const oldSkillsCol = collection(db, "users", uid, "skills");
  const oldSkillsSnapshot = await getDocs(oldSkillsCol);

  for (const docSnap of oldSkillsSnapshot.docs) {
    const data = docSnap.data();
    const newProjectRef = doc(db, "users", uid, "projects", docSnap.id);

    await setDoc(newProjectRef, {
      title: data.title,
      status: data.status || "ACTIVE",
      category: data.category || null,
      targetMinutes: data.targetMinutes || 240,
      period: data.period || "WEEK",
      loggedMinutes: data.loggedMinutes || 0,
      loggedMinutesToday: data.loggedMinutesToday || 0,
      lastLoggedDate: data.lastLoggedDate || "",
      icon: data.icon || "Briefcase",
      goal: data.goal || null,
      description: data.description || null,
      createdAt: data.createdAt || new Date()
    });

    console.log(`  -> Przeniesiono projekt główny: ${docSnap.id} (${data.title})`);
  }

  // 3. Aktualizacja powiązań w Notatkach: skillId -> projectId
  console.log("[MIGRACJA] Krok 3: Aktualizacja powiązań w notatkach...");
  const notesCol = collection(db, "users", uid, "notes");
  const notesSnapshot = await getDocs(notesCol);

  for (const docSnap of notesSnapshot.docs) {
    const data = docSnap.data();
    if (data.skillId) {
      const noteRef = doc(db, "users", uid, "notes", docSnap.id);
      await updateDoc(noteRef, {
        projectId: data.skillId,
        skillId: deleteField()
      });
      console.log(`  -> Zaktualizowano notatkę: ${docSnap.id}`);
    }
  }

  // 4. Aktualizacja powiązań w TimeLogs: skillId -> projectId
  console.log("[MIGRACJA] Krok 4: Aktualizacja wpisów czasu (timeLogs)...");
  const timeLogsCol = collection(db, "users", uid, "timeLogs");
  const timeLogsSnapshot = await getDocs(timeLogsCol);

  for (const docSnap of timeLogsSnapshot.docs) {
    const data = docSnap.data();
    if (data.skillId) {
      const logRef = doc(db, "users", uid, "timeLogs", docSnap.id);
      await updateDoc(logRef, {
        projectId: data.skillId,
        skillId: deleteField()
      });
      console.log(`  -> Zaktualizowano wpis czasu: ${docSnap.id}`);
    }
  }

  // 5. Aktualizacja zadań: projectId -> taskListId (gdyż wskazywały na dawne sublisty)
  console.log("[MIGRACJA] Krok 5: Aktualizacja zadań (projectId -> taskListId)...");
  const tasksCol = collection(db, "users", uid, "tasks");
  const tasksSnapshot = await getDocs(tasksCol);

  for (const docSnap of tasksSnapshot.docs) {
    const data = docSnap.data();
    if (data.projectId) {
      const taskRef = doc(db, "users", uid, "tasks", docSnap.id);
      await updateDoc(taskRef, {
        taskListId: data.projectId,
        projectId: deleteField()
      });
      console.log(`  -> Zaktualizowano zadanie: ${docSnap.id}`);
    }
  }

  // 6. Usunięcie starych kolekcji 'skills'
  console.log("[MIGRACJA] Krok 6: Czyszczenie starej kolekcji skills...");
  for (const docSnap of oldSkillsSnapshot.docs) {
    await deleteDoc(doc(db, "users", uid, "skills", docSnap.id));
  }

  console.log("[MIGRACJA] Zakończono pomyślnie migrację wszystkich danych!");
  return { success: true };
}
