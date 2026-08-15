"use client";

import { useNotes } from "@/lib/services/notes";
import { useProjects } from "@/lib/services/projects";
import { NotesManager } from "@/components/notes-manager";
import { FileText } from "lucide-react";

export default function NotesPage() {
  const { notes, loading: notesLoading } = useNotes(undefined);
  const { projects, loading: projectsLoading } = useProjects();

  // Dodajemy nazwy projektów do notatek dla lepszego grupowania
  const notesWithProjects = notes.map(note => ({
    ...note,
    project: note.projectId ? { title: projects.find(p => p.id === note.projectId)?.title || "Projekt" } : null
  }));

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Notatki</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoja baza wiedzy i dokumentacja projektowa.</p>
        </div>
      </header>

      <section>
        {notesLoading || projectsLoading ? (
          <div className="text-zinc-500 text-sm">Ładowanie...</div>
        ) : (
          <NotesManager initialNotes={notesWithProjects} groupByProject={true} />
        )}
      </section>
    </main>
  );
}
