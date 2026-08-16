"use client";

import { useState, useTransition, useMemo } from "react";
import { activateProject, updateProject as updateProjectDetails, deleteProject, Project, useProjects, MAX_ACTIVE_PROJECTS } from "@/lib/services/projects";
import { Lightbulb, Play, Settings2, Save, AlertCircle, Lock, Trash2, Tag, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function IncubatorList({ 
  projects,
  existingCategories = []
}: { 
  projects: Project[],
  existingCategories?: string[]
}) {
  const [isPending, startTransition] = useTransition();
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [limitAlertOpen, setLimitAlertOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Stan wybranego filtra kategorii
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("ALL");

  const { projects: activeProjects } = useProjects("ACTIVE");
  const activeCount = activeProjects.length;
  const isLimitReached = activeCount >= MAX_ACTIVE_PROJECTS;

  // State for the currently edited project
  const [editedTitle, setEditedTitle] = useState("");
  const [editedGoal, setEditedGoal] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTargetHours, setEditedTargetHours] = useState(0);
  const [editedPeriod, setEditedPeriod] = useState("WEEK");
  const [editedCategory, setEditedCategory] = useState("");

  // Połączone kategorie (z przekazanych + obecnych w projektach)
  const allCategories = useMemo(() => {
    const set = new Set<string>(existingCategories);
    projects.forEach(p => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return Array.from(set).sort();
  }, [existingCategories, projects]);

  function openModal(project: Project) {
    setEditedTitle(project.title);
    setEditedGoal(project.goal || "");
    setEditedDescription(project.description || "");
    setEditedTargetHours(Math.floor(project.targetMinutes / 60) || 0);
    setEditedPeriod(project.period || "WEEK");
    setEditedCategory(project.category || "");
    setOpenModalId(project.id);
  }

  function handleSaveDetails(id: string) {
    startTransition(async () => {
      await updateProjectDetails(id, {
        title: editedTitle,
        goal: editedGoal || null,
        description: editedDescription || null,
        targetMinutes: (editedTargetHours || 0) * 60,
        period: editedPeriod,
        category: editedCategory.trim() || null
      });
      setOpenModalId(null);
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Czy na pewno chcesz usunąć pomysł "${title}" z Inkubatora?`)) return;
    startTransition(async () => {
      await deleteProject(id);
      if (openModalId === id) setOpenModalId(null);
    });
  }

  function handleActivate(id: string) {
    if (isLimitReached) {
      setLimitAlertOpen(true);
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage(null);
        await activateProject(id);
      } catch (err: any) {
        setErrorMessage(err.message || "Błąd aktywacji projektu.");
        setLimitAlertOpen(true);
      }
    });
  }

  // Filtrowane projekty
  const filteredProjects = useMemo(() => {
    if (selectedFilterCategory === "ALL") return projects;
    if (selectedFilterCategory === "UNASSIGNED") return projects.filter(p => !p.category?.trim());
    return projects.filter(p => p.category?.trim() === selectedFilterCategory);
  }, [projects, selectedFilterCategory]);

  // Grupowanie przefiltrowanych projektów
  const projectsByCategory = filteredProjects.reduce((acc, project) => {
    const cat = project.category?.trim() || "Bez kategorii";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="space-y-6 mt-4">
      {/* Baner Twardego Limitu Aktywnych Projektów */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isLimitReached 
          ? "bg-amber-500/10 border-amber-500/30 text-amber-200" 
          : "bg-zinc-900/40 border-zinc-800/50 text-zinc-400"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isLimitReached ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"}`}>
              {isLimitReached ? <AlertCircle className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">
                  Aktywne projekty: {activeCount} / {MAX_ACTIVE_PROJECTS}
                </h3>
                {isLimitReached && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                    Limit Osiągnięty
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 text-zinc-400 leading-relaxed">
                {isLimitReached 
                  ? "Osiągnięto twardy limit 2 aktywnych projektów. Aby aktywować kolejny projekt, musisz najpierw ukończyć, wstrzymać lub cofnąć do Inkubatora jeden z obecnych." 
                  : `Możesz aktywować jeszcze ${MAX_ACTIVE_PROJECTS - activeCount} projekt(y).`}
              </p>
            </div>
          </div>
          {isLimitReached && (
            <Link 
              href="/projects" 
              className="text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
            >
              Zarządzaj aktywnymi
            </Link>
          )}
        </div>
      </div>

      {/* Pasek filtrowania po kategoriach */}
      {allCategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedFilterCategory("ALL")}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedFilterCategory === "ALL"
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-950/20"
                : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
            }`}
          >
            Wszystkie ({projects.length})
          </button>

          {allCategories.map(cat => {
            const count = projects.filter(p => p.category?.trim() === cat).length;
            const isSelected = selectedFilterCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilterCategory(isSelected ? "ALL" : cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-950/20"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-sm font-medium">
          {projects.length === 0 
            ? "Inkubator jest pusty. Zapisz powyżej swój kolejny pomysł na projekt."
            : "Brak projektów w wybranej kategorii."}
        </div>
      ) : (
        Object.entries(projectsByCategory).map(([category, catProjects]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
              {category} ({catProjects.length})
            </h2>
            {catProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/50 transition-all duration-200 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200">{project.title}</h3>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>Status: INBOX</span>
                      {project.category && (
                        <span className="text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                          {project.category}
                        </span>
                      )}
                      {project.goal && <span className="text-purple-400">• PRZYGOTOWANY</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dialog open={openModalId === project.id} onOpenChange={(open) => {
                    if (open) openModal(project);
                    else setOpenModalId(null);
                  }}>
                    <DialogTrigger 
                      render={
                        <Button variant="outline" className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-white text-xs">
                          <Settings2 className="w-3 h-3 mr-1.5" /> Przygotuj
                        </Button>
                      }
                    />
                    <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-xl w-[90vw] rounded-2xl p-6">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Przygotowanie Projektu
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                            Nazwa Projektu
                          </label>
                          <Input 
                            value={editedTitle}
                            onChange={e => setEditedTitle(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800"
                          />
                        </div>

                        {/* Zarządzanie Kategorią z autouzupełnianiem */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                            Kategoria Projektu
                          </label>
                          
                          {/* Szybki wybór z istniejących kategorii */}
                          {allCategories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-1">
                              {allCategories.map(cat => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setEditedCategory(cat)}
                                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors border ${
                                    editedCategory.trim().toLowerCase() === cat.toLowerCase()
                                      ? "bg-yellow-500 text-black font-bold border-yellow-500"
                                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Input 
                              list="modal-categories-datalist"
                              value={editedCategory}
                              onChange={e => setEditedCategory(e.target.value)}
                              placeholder="Wpisz nową kategorię lub wybierz z listy..."
                              className="bg-zinc-900/50 border-zinc-800 text-xs"
                            />
                            <datalist id="modal-categories-datalist">
                              {allCategories.map(cat => (
                                <option key={cat} value={cat} />
                              ))}
                            </datalist>
                            {editedCategory && (
                              <button
                                type="button"
                                onClick={() => setEditedCategory("")}
                                className="text-xs text-zinc-500 hover:text-zinc-300 shrink-0"
                              >
                                Wyczyść
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                            Główny Cel (Jedno zdanie)
                          </label>
                          <Input 
                            value={editedGoal}
                            onChange={e => setEditedGoal(e.target.value)}
                            placeholder="Np. Główny cel do osiągnięcia..."
                            className="bg-zinc-900/50 border-zinc-800"
                          />
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                              Budżet (Godziny)
                            </label>
                            <Input 
                              type="number"
                              min="1"
                              value={editedTargetHours}
                              onChange={e => setEditedTargetHours(parseInt(e.target.value) || 0)}
                              className="bg-zinc-900/50 border-zinc-800 text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                              Okres
                            </label>
                            <select 
                              value={editedPeriod}
                              onChange={e => setEditedPeriod(e.target.value)}
                              className="w-full h-10 px-3 py-2 rounded-md bg-zinc-900/50 border border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="WEEK">Tydzień</option>
                              <option value="MONTH">Miesiąc</option>
                              <option value="QUARTER">Kwartał</option>
                              <option value="YEAR">Rok</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                            Opis / Notatki (Markdown)
                          </label>
                          <Textarea 
                            value={editedDescription}
                            onChange={e => setEditedDescription(e.target.value)}
                            placeholder="Szczegóły, notatki, linki..."
                            className="bg-zinc-900/50 border-zinc-800 min-h-[120px]"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-2"
                            onClick={() => handleDelete(project.id, project.title)}
                            disabled={isPending}
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" /> Usuń Projekt
                          </Button>

                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              onClick={() => setOpenModalId(null)}
                              disabled={isPending}
                            >
                              Anuluj
                            </Button>
                            <Button 
                              className="bg-purple-600 hover:bg-purple-500 text-white"
                              onClick={() => handleSaveDetails(project.id)}
                              disabled={isPending}
                            >
                              <Save className="w-4 h-4 mr-2" /> Zapisz Detale
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Szybki przycisk usuwania z listy */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id, project.title)}
                    disabled={isPending}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 p-0"
                    title="Usuń pomysł z Inkubatora"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => handleActivate(project.id)}
                    disabled={isPending}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all h-9 ${
                      isLimitReached
                        ? "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 border border-zinc-700/50"
                        : "bg-purple-600 hover:bg-purple-500 text-white"
                    }`}
                  >
                    {isLimitReached ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    {isLimitReached ? "Zablokowane (2/2)" : "Aktywuj"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Modal Informacji o Twardym Limicie */}
      <Dialog open={limitAlertOpen} onOpenChange={setLimitAlertOpen}>
        <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md w-[90vw] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              Osiągnięto limit aktywnych projektów
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2 text-sm text-zinc-300">
            <p>
              Momentum to system egzekucji oparty na <strong>bezwzględnym skupieniu</strong>. Możesz prowadzić maksymalnie <strong>2 aktywne projekty</strong> jednocześnie.
            </p>
            
            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <p className="font-bold text-zinc-200">Aby zwolnić miejsce na nowy projekt:</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-1">
                <li>Wstrzymaj obecny projekt (status <strong>PAUSED</strong>),</li>
                <li>Przenieś go z powrotem do <strong>Inkubatora</strong>,</li>
                <li>Lub oznacz jako zrealizowany.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setLimitAlertOpen(false)}
              >
                Rozumiem
              </Button>
              <Link href="/projects" onClick={() => setLimitAlertOpen(false)}>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                  Przejdź do Projektów
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
