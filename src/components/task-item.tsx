"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Task, updateTask, toggleTaskComplete, deleteTask, useTaskLists } from "@/lib/services/tasks";
import { usePlaces } from "@/lib/services/places";
import { useProjects } from "@/lib/services/projects";
import { Check, Calendar, Tag as TagIcon, FileText, Image as ImageIcon, Save, MapPin, Trash2, Sun, Sunset, CalendarX, ListTodo, Briefcase } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";

export function TaskItem({ task }: { task: Task }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Lokalny stan do edycji
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [imageUrl, setImageUrl] = useState(task.imageUrl || "");
  const [tagNames, setTagNames] = useState(task.tagNames?.join(", ") || "");
  const [placeId, setPlaceId] = useState<string | null>(task.placeId || null);
  const [taskListId, setTaskListId] = useState<string | null>(task.taskListId || null);
  const [projectId, setProjectId] = useState<string | null>(task.projectId || null);

  // Stan daty (ISO YYYY-MM-DD lub null)
  const getInitialDateStr = () => {
    if (!task.dueDate) return "";
    const d = new Date(task.dueDate);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split("T")[0];
  };

  const [dateStr, setDateStr] = useState<string>(getInitialDateStr());
  
  const { places } = usePlaces();
  const { taskLists } = useTaskLists();
  const { projects } = useProjects("ACTIVE");

  // Zresetuj stan, gdy zmieniają się propsy zadania
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setImageUrl(task.imageUrl || "");
    setTagNames(task.tagNames?.join(", ") || "");
    setPlaceId(task.placeId || null);
    setTaskListId(task.taskListId || null);
    setProjectId(task.projectId || null);
    setDateStr(getInitialDateStr());
  }, [task]);

  const handleSave = () => {
    startTransition(async () => {
      const parsedTags = tagNames.split(",").map(t => t.trim()).filter(Boolean);
      
      let computedDueDate: number | null = null;
      if (dateStr) {
        // Obliczamy timestamp dla północy danego dnia
        const [year, month, day] = dateStr.split("-").map(Number);
        const parsed = new Date(year, month - 1, day, 12, 0, 0);
        computedDueDate = parsed.getTime();
      }

      await updateTask(task.id, {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        tagNames: parsedTags,
        placeId: placeId || null,
        taskListId: taskListId || null,
        projectId: projectId || null,
        dueDate: computedDueDate
      });
      setIsOpen(false);
    });
  };

  const handleDelete = () => {
    if (!confirm("Czy na pewno chcesz usunąć to zadanie?")) return;
    startTransition(async () => {
      await deleteTask(task.id);
      setIsOpen(false);
    });
  };

  const setTodayDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    setDateStr(new Date(d.getTime() - offset).toISOString().split("T")[0]);
  };

  const setTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const offset = d.getTimezoneOffset() * 60000;
    setDateStr(new Date(d.getTime() - offset).toISOString().split("T")[0]);
  };

  const clearDate = () => setDateStr("");

  const isOverdue = task.dueDate && new Date(task.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`
          group flex items-start justify-between p-3.5 rounded-2xl transition-all duration-200 cursor-pointer border gap-3
          ${task.isCompleted 
            ? "bg-zinc-100/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/30 opacity-60" 
            : "bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border-zinc-200/80 dark:border-zinc-800/60 shadow-xs dark:shadow-none"
          }
        `}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startTransition(() => toggleTaskComplete(task.id, !task.isCompleted));
            }}
            disabled={isPending}
            className={`
              shrink-0 w-5 h-5 rounded-lg flex items-center justify-center border transition-all mt-0.5
              ${task.isCompleted 
                ? "bg-purple-600 border-purple-600 text-white shadow-xs" 
                : "border-zinc-300 dark:border-zinc-600 text-transparent hover:border-purple-500 group-hover:border-purple-500 bg-white/50 dark:bg-zinc-800/50"
              }
            `}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
          
          <DialogTrigger className="flex flex-col flex-1 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none min-w-0">
            <span className={`text-sm font-semibold break-words leading-snug ${task.isCompleted ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-200"}`}>
              {task.title}
            </span>
            {(task.dueDate || task.description || task.placeId || task.taskListId) && !task.isCompleted && (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className={`w-3 h-3 ${isOverdue ? "text-red-500" : (isToday ? "text-purple-600 dark:text-purple-400" : "text-zinc-500")}`} />
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${isOverdue ? "text-red-500 font-black" : (isToday ? "text-purple-600 dark:text-purple-400" : "text-zinc-500")}`}>
                      {isToday ? "Dzisiaj" : new Date(task.dueDate).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )}
                {task.description && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Notatka</span>
                  </div>
                )}
                {task.placeId && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 truncate max-w-[80px]">
                      {places.find(p => p.id === task.placeId)?.name || "Miejsce"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </DialogTrigger>
        </div>
        
        {/* Tagi na liście */}
        {task.tagNames && task.tagNames.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {task.tagNames.map(name => (
              <span 
                key={name}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50`}
              >
                #{name}
              </span>
            ))}
          </div>
        )}
      </div>

      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Szczegóły Zadania</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Tytuł */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tytuł Zadania</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-medium"
            />
          </div>

          {/* Data wykonania (Termin) */}
          <div className="space-y-2 p-3.5 bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl">
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Termin wykonania
              </span>
              {dateStr ? (
                <span className="text-[10px] text-purple-700 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md font-bold">
                  {dateStr}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-500">Brak terminu (Inbox)</span>
              )}
            </label>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={setTodayDate}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-xs"
              >
                <Sun className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Dzisiaj
              </button>
              <button
                type="button"
                onClick={setTomorrowDate}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-xs"
              >
                <Sunset className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Jutro
              </button>
              {dateStr && (
                <button
                  type="button"
                  onClick={clearDate}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-red-500/10 text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-xs"
                >
                  <CalendarX className="w-3 h-3" /> Usuń datę (Inbox)
                </button>
              )}
            </div>

            <div className="pt-2">
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Przypisanie do Listy i Projektu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-zinc-400" /> Lista Zadań
              </label>
              <select
                value={taskListId || ""}
                onChange={e => setTaskListId(e.target.value || null)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="">Brak (Domyślna / Inbox)</option>
                {taskLists.map(list => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Projekt Nadrzędny
              </label>
              <select
                value={projectId || ""}
                onChange={e => setProjectId(e.target.value || null)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="">Brak (Bez projektu)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opis Markdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Notatka (Markdown)
            </label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
              placeholder="Zanotuj szczegóły, linki, przemyślenia..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-mono resize-y"
            />
            {description && (
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800/50 mt-1 text-xs prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-300">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Miejsca */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Powiązane miejsce
            </label>
            <select
              value={placeId || ""}
              onChange={e => setPlaceId(e.target.value || null)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="">Brak (Zadanie niezależne od miejsca)</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tagi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" /> Tagi (po przecinku)
            </label>
            <input 
              value={tagNames} 
              onChange={e => setTagNames(e.target.value)} 
              placeholder="np. pilne, finanse, praca"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-medium"
            />
          </div>

          {/* Zdjęcie */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> URL Zdjęcia (Opcjonalnie)
            </label>
            <input 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)} 
              placeholder="https://..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-500 font-medium"
            />
            {imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img src={imageUrl} alt="Podgląd" className="w-full h-auto object-cover max-h-40" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs px-3 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Usuń
          </Button>

          <Button 
            onClick={handleSave}
            disabled={isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 rounded-xl shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" /> Zapisz Zmiany
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
