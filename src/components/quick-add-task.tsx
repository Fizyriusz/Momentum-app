"use client";

import { useState, useTransition } from "react";
import { createTask } from "@/lib/services/tasks";
import { createNote } from "@/lib/services/notes";
import { createPlace } from "@/lib/services/places";
import { createProject, useProjects } from "@/lib/services/projects";
import { Geolocation } from "@capacitor/geolocation";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Sun, Sunset, CalendarX, FileText, CheckSquare, MapPin, Loader2, Lightbulb, Briefcase } from "lucide-react";

export function QuickAddTask({ projectId, onSuccess }: { projectId?: string, onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [mode, setMode] = useState<"TASK" | "NOTE" | "IDEA">("TASK");
  const [isPending, startTransition] = useTransition();
  
  const [locating, setLocating] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
  // Pobieramy wszystkie aktywne projekty do wyboru
  const { projects } = useProjects("ACTIVE");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "");

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
    if (!title.trim()) return;

    startTransition(async () => {
      if (mode === "TASK") {
        await createTask(title, undefined, dueDate || undefined, selectedPlaceId || undefined, selectedProjectId || undefined);
      } else if (mode === "NOTE") {
        await createNote({ title: title, content: "", projectId: selectedProjectId || undefined });
      } else if (mode === "IDEA") {
        await createProject(title, "INBOX");
      }
      setTitle("");
      setDueDate(null);
      setSelectedPlaceId(null);
      if (!projectId) setSelectedProjectId(""); // Reset if not constrained by props
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

  return (
    <div className="flex flex-col gap-2 w-full mb-4">
      <div className="flex flex-wrap gap-2 px-1 mb-1">
        <button
          type="button"
          onClick={() => setMode("TASK")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            mode === "TASK" ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Zadanie
        </button>
        <button
          type="button"
          onClick={() => setMode("NOTE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            mode === "NOTE" ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Notatka
        </button>
        <button
          type="button"
          onClick={() => setMode("IDEA")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            mode === "IDEA" ? "bg-yellow-600 text-white" : "text-zinc-500 hover:text-zinc-300"
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
            className="flex-1 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-12 pl-4 pr-12 focus-visible:ring-purple-500/50"
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending || !title.trim()}
            className={`absolute right-1 top-1 h-10 w-10 rounded-lg text-white ${
              mode === "TASK" ? "bg-purple-600 hover:bg-purple-500" : 
              mode === "NOTE" ? "bg-blue-600 hover:bg-blue-500" :
              "bg-yellow-600 hover:bg-yellow-500"
            }`}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Opcje dodatkowe (Projekt i Lokalizacja) */}
        {mode !== "IDEA" && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            {!projectId && (
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
                <div className="pl-2">
                  <Briefcase className="w-3 h-3 text-zinc-500" />
                </div>
                <select 
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-zinc-400 py-1.5 px-2 focus:outline-none max-w-[120px]"
                >
                  <option value="">Bez projektu</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
            )}
            
            {mode === "TASK" && (
              <>
                <button
                  type="button"
                  onClick={isToday ? clearDate : setToday}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors border
                    ${isToday ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'}
                  `}
                >
                  <Sun className="w-3 h-3" /> Dzisiaj
                </button>
                <button
                  type="button"
                  onClick={isTomorrow ? clearDate : setTomorrow}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors border
                    ${isTomorrow ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'}
                  `}
                >
                  <Sunset className="w-3 h-3" /> Jutro
                </button>
                
                <button
                  type="button"
                  onClick={selectedPlaceId ? () => setSelectedPlaceId(null) : handleLocateHere}
                  disabled={locating}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors border
                    ${selectedPlaceId ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'}
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors border bg-zinc-900 border-zinc-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 ml-auto"
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
