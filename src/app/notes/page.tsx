"use client";

import { useNotes } from "@/lib/services/notes";
import { useSkills } from "@/lib/services/skills";
import { NotesManager } from "@/components/notes-manager";
import { FileText } from "lucide-react";

export default function NotesPage() {
  const { notes, loading: notesLoading } = useNotes(undefined);
  const { skills, loading: skillsLoading } = useSkills();

  // Dodajemy nazwy projektów do notatek dla lepszego grupowania
  const notesWithSkills = notes.map(note => ({
    ...note,
    skill: note.skillId ? { title: skills.find(s => s.id === note.skillId)?.title || "Projekt" } : null
  }));

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Notatki</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoja osobista przestrzeń na myśli i wiedzę.</p>
        </div>
      </header>

      <section>
        {notesLoading || skillsLoading ? (
          <div className="text-zinc-500 text-sm">Ładowanie...</div>
        ) : (
          <NotesManager initialNotes={notesWithSkills} groupByProject={true} />
        )}
      </section>
    </main>
  );
}
