"use client";

import { useState, useMemo } from "react";
import { useProjects, createProject } from "@/lib/services/projects";
import { Lightbulb, Plus, Tag, FolderPlus } from "lucide-react";
import { IncubatorList } from "@/components/incubator-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function IncubatorPage() {
  const { projects: allProjects, loading } = useProjects();
  const incubatorProjects = useMemo(() => allProjects.filter(p => p.status === "INBOX"), [allProjects]);
  
  // Wszystkie unikalne kategorie ze wszystkich projektów
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return Array.from(set).sort();
  }, [allProjects]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const cleanCat = category.trim();
      setTitle(""); // Natychmiastowe wyczyszczenie pola
      setCategory("");
      setShowCategoryInput(false);
      await createProject(cleanTitle, "INBOX", cleanCat || undefined);
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
        {/* Formularz dodawania pomysłu z kategoriami */}
        <form onSubmit={handleAdd} className="space-y-3 mb-6">
          <div className="flex gap-2 w-full relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Opisz nowy pomysł na projekt..."
              disabled={isSubmitting}
              className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-12 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="absolute right-1 top-1 h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Opcjonalne pole kategorii i podpowiedzi istniejących */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryInput(!showCategoryInput)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                  category || showCategoryInput
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Tag className="w-3 h-3" />
                {category ? `Kategoria: ${category}` : "+ Kategoria"}
              </button>

              {/* Szybkie pille istniejących kategorii do wyboru jednym kliknięciem */}
              {existingCategories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(isSelected ? "" : cat);
                      setShowCategoryInput(false);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isSelected
                        ? "bg-yellow-500 text-black font-bold scale-105"
                        : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Input do wpisania nowej kategorii */}
            {showCategoryInput && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  list="categories-datalist"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Wpisz nową kategorię lub wybierz..."
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500 w-64"
                  autoFocus
                />
                <datalist id="categories-datalist">
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                {category && (
                  <button
                    type="button"
                    onClick={() => setCategory("")}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Wyczyść
                  </button>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Lista projektów w Inkubatorze */}
        {loading ? (
          <div className="text-zinc-500 text-sm p-4">Ładowanie...</div>
        ) : (
          <IncubatorList 
            projects={incubatorProjects} 
            existingCategories={existingCategories} 
          />
        )}
      </section>
    </main>
  );
}
