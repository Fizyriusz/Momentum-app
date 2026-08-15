"use client";

import { useState, useTransition } from "react";
import { activateProject, updateProject as updateProjectDetails, Project } from "@/lib/services/projects";
import { Rocket, Play, Settings2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function IncubatorList({ projects }: { projects: Project[] }) {
  const [isPending, startTransition] = useTransition();
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  
  // State for the currently edited project
  const [editedTitle, setEditedTitle] = useState("");
  const [editedGoal, setEditedGoal] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTargetHours, setEditedTargetHours] = useState(0);
  const [editedPeriod, setEditedPeriod] = useState("WEEK");
  const [editedCategory, setEditedCategory] = useState("");

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
        category: editedCategory || null
      });
      setOpenModalId(null);
    });
  }

  function handleActivate(id: string) {
    startTransition(async () => {
      await activateProject(id);
    });
  }

  if (projects.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 text-sm font-medium">
        Inkubator jest pusty. Wpadnij tu z nowym pomysłem na projekt.
      </div>
    );
  }

  // Grupowanie
  const projectsByCategory = projects.reduce((acc, project) => {
    const cat = project.category || "Inne";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="space-y-8 mt-4">
      {Object.entries(projectsByCategory).map(([category, catProjects]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500/50"></span>
            {category}
          </h2>
          {catProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/50 transition-all duration-200 gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-200">{project.title}</h3>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mt-0.5 flex gap-2">
                    <span>Status: INBOX</span>
                    {project.goal && <span className="text-purple-500">• PRZYGOTOWANY</span>}
                  </p>
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
                        <Rocket className="w-5 h-5 text-purple-500" />
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
                      <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                          Kategoria
                        </label>
                        <Input 
                          value={editedCategory}
                          onChange={e => setEditedCategory(e.target.value)}
                          placeholder="Wpisz kategorię..."
                          className="bg-zinc-900/50 border-zinc-800"
                        />
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
                      
                      <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800/50">
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
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => handleActivate(project.id)}
                  disabled={isPending}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors h-9"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Aktywuj
                </Button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
