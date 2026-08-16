"use client";

import { useState, useTransition } from "react";
import { createTask, useTaskLists } from "@/lib/services/tasks";
import { createNote } from "@/lib/services/notes";
import { createPlace } from "@/lib/services/places";
import { createProject, useProjects } from "@/lib/services/projects";
import { Geolocation } from "@capacitor/geolocation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Sun, Sunset, CalendarX, FileText, CheckSquare, MapPin, Loader2, Lightbulb, Briefcase, ListTodo } from "lucide-react";

export function QuickAddTask({ 
  projectId, 
  taskListId, 
  onSuccess 
}: { 
  projectId?: string, 
  taskListId?: string, 
  onSuccess?: () => void 
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [mode, setMode] = useState<"TASK" | "NOTE" | "IDEA">("TASK");
  const [isPending, startTransition] = useTransition();
  
  const [locating, setLocating] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  // Pobieramy aktywne projekty oraz listy zadań do wyboru
  const { projects } = useProjects("ACTIVE");
  const { taskLists } = useTaskLists();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "");
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>(taskListId || "");

  async function handleLocateHere() {
    setLocating(true);
    try {
      const position = await Geolocation.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      const placeName = `📍 Zapisane miejsce (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      
      const docRef = await createPlace(placeName, lat, lng, 500, "POINT");
      if (docRef) {
        setSelectedPlaceId(docRef.id);
      }
    } catch (error) {
      console.error("Błąd lokalizacji:", error);
      alert("Nie udało się pobrać lokalizacji.");
    } finally {
      setLocating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    startTransition(async () => {
      if (mode === "TASK") {
        await createTask(
          cleanTitle, 
          taskListId || selectedTaskListId || undefined, 
          dueDate || undefined, 
          selectedPlaceId || undefined, 
          projectId || selectedProjectId || undefined
        );
      } else if (mode === "NOTE") {
        await createNote({ title: cleanTitle, content: "", projectId: selectedProjectId || undefined });
      } else if (mode === "IDEA") {
        await createProject(cleanTitle, "INBOX");
      }

      setTitle("");
      setDueDate(null);
      setSelectedPlaceId(null);
      if (!projectId) setSelectedProjectId("");
      if (!taskListId) setSelectedTaskListId("");
      if (onSuccess) onSuccess();
    });
  }

  const setToday = () => setDueDate(new Date());
  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow);
  };
  const clearDate = () => setDueDate(null);

  const isToday = dueDate && new Date().toDateString() === new Date().toDateString();
  const isTomorrow = dueDate && (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dueDate.toDateString() === tomorrow.toDateString();
  })();

  const activeTaskLists = taskLists.filter(l => !l.isArchived);

  return (
    <div className="flex flex-col gap-2 w-full mb-4">
      <div className="flex flex-wrap gap-2 px-1 mb-1">
        <button
          type="button"
          onClick={() => setMode("TASK")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mode === "TASK" ? "bg-purple-600 text-white shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Zadanie
        </button>
        <button
          type="button"
          onClick={() => setMode("NOTE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mode === "NOTE" ? "bg-blue-600 text-white shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Notatka
        </button>
        <button
          type="button"
          onClick={() => setMode("IDEA")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mode === "IDEA" ? "bg-amber-600 text-white shadow-xs" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Pomysł (Inkubator)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full relative">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              mode === "TASK" ? "Co masz do zrobienia?" : 
              mode === "NOTE" ? "Szybka notatka..." : 
              "Nowy projekt do Inkubatora..."
            }
            className="flex-1 bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-2xl h-12 pl-4 pr-12 focus-visible:ring-purple-500/50 shadow-xs dark:shadow-none"
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !title.trim()}
            className={`absolute right-1 top-1 h-10 w-10 rounded-xl text-white shadow-xs ${
              mode === "TASK" ? "bg-purple-600 hover:bg-purple-700" : 
              mode === "NOTE" ? "bg-blue-600 hover:bg-blue-700" :
              "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Opcje dodatkowe */}
        {mode !== "IDEA" && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            {/* Wybór Listy Zadań */}
            {mode === "TASK" && !taskListId && activeTaskLists.length > 0 && (
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs dark:shadow-none">
                <div className="pl-2.5">
                  <ListTodo className="w-3 h-3 text-zinc-400" />
                </div>
                <select 
                  value={selectedTaskListId}
                  onChange={e => setSelectedTaskListId(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-zinc-700 dark:text-zinc-300 py-1.5 px-2 focus:outline-none max-w-[130px]"
                >
                  <option value="" className="bg-white dark:bg-zinc-900">Lista: Domyślna</option>
                  {activeTaskLists.map(list => (
                    <option key={list.id} value={list.id} className="bg-white dark:bg-zinc-900">{list.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Wybór Projektu */}
            {!projectId && (
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs dark:shadow-none">
                <div className="pl-2.5">
                  <Briefcase className="w-3 h-3 text-zinc-400" />
                </div>
                <select 
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-zinc-700 dark:text-zinc-300 py-1.5 px-2 focus:outline-none max-w-[120px]"
                >
                  <option value="" className="bg-white dark:bg-zinc-900">Bez projektu</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id} className="bg-white dark:bg-zinc-900">{project.title}</option>
                  ))}
                </select>
              </div>
            )}
            
            {mode === "TASK" && (
              <>
                <button
                  type="button"
                  onClick={isToday ? clearDate : setToday}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-colors border
                    ${isToday ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-xs dark:shadow-none'}
                  `}
                >
                  <Sun className="w-3 h-3 text-amber-500" /> Dzisiaj
                </button>
                <button
                  type="button"
                  onClick={isTomorrow ? clearDate : setTomorrow}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-colors border
                    ${isTomorrow ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-xs dark:shadow-none'}
                  `}
                >
                  <Sunset className="w-3 h-3 text-orange-500" /> Jutro
                </button>
                
                <button
                  type="button"
                  onClick={selectedPlaceId ? () => setSelectedPlaceId(null) : handleLocateHere}
                  disabled={locating}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-colors border
                    ${selectedPlaceId ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-xs dark:shadow-none'}
                    ${locating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />} 
                  {selectedPlaceId ? 'Przypięto' : 'Tutaj'}
                </button>
              </>
            )}
            
            {dueDate && mode === "TASK" && (
              <button
                type="button"
                onClick={clearDate}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-colors border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 ml-auto shadow-xs dark:shadow-none"
              >
                <CalendarX className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
