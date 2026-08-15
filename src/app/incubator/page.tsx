"use client";

import { useState } from "react";
import { useProjects, createProject } from "@/lib/services/projects";
import { Lightbulb, Plus } from "lucide-react";
import { IncubatorList } from "@/components/incubator-list";

export default function IncubatorPage() {
  const { projects: incubatorProjects, loading } = useProjects("INBOX");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setTitle(""); // Natychmiastowe wyczyszczenie pola
      await createProject(cleanTitle, "INBOX");
    } catch (error) {
      console.error("Error creating incubator project:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-yellow-500/10 rounded-xl">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Inkubator</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Poczekalnia na nowe projekty i koncepcje.</p>
        </div>
      </header>

      <section className="bg-zinc-950 rounded-2xl p-1">
        {/* Szybkie dodawanie pomysłu (kontrolowany input z natychmiastowym czyszczeniem) */}
        <form onSubmit={handleAdd} className="flex gap-2 w-full mb-6 relative">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Opisz nowy projekt..."
            disabled={isSubmitting}
            className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-12 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="absolute right-1 top-1 h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Lista projektów w Inkubatorze */}
        {loading ? (
          <div className="text-zinc-500 text-sm p-4">Ładowanie...</div>
        ) : (
          <IncubatorList projects={incubatorProjects} />
        )}
      </section>
    </main>
  );
}
