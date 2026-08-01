"use client";

import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateTask, toggleTaskStatus } from "@/app/actions";
import { Check, Calendar, Tag as TagIcon, FileText, Image as ImageIcon, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Tag = { id: string; name: string; color: string; };

export type FullTask = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isCompleted: boolean;
  dueDate: Date | null;
  tags?: Tag[];
};

export function TaskItem({ task }: { task: FullTask }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Lokalny stan do edycji
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [imageUrl, setImageUrl] = useState(task.imageUrl || "");
  const [tagNames, setTagNames] = useState(task.tags?.map(t => t.name).join(", ") || "");
  
  // Zresetuj stan, gdy zmieniają się propsy zadania
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setImageUrl(task.imageUrl || "");
    setTagNames(task.tags?.map(t => t.name).join(", ") || "");
  }, [task]);

  const handleSave = () => {
    startTransition(async () => {
      const parsedTags = tagNames.split(",").map(t => t.trim()).filter(Boolean);
      await updateTask(task.id, {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        tagNames: parsedTags,
      });
      setIsOpen(false);
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`
          group flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer
          ${task.isCompleted ? "bg-zinc-900/20 opacity-50" : "bg-zinc-900/60 hover:bg-zinc-800/80"}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startTransition(() => toggleTaskStatus(task.id, task.isCompleted));
            }}
            disabled={isPending}
            className={`
              shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors
              ${task.isCompleted 
                ? "bg-purple-500 border-purple-500 text-white" 
                : "border-zinc-600 text-transparent hover:border-purple-400 group-hover:border-purple-500"
              }
            `}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
          
          <DialogTrigger className="flex flex-col flex-1 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none">
            <span className={`text-sm font-medium truncate ${task.isCompleted ? "line-through text-zinc-500" : "text-zinc-200"}`}>
              {task.title}
            </span>
            {(task.dueDate || task.description) && !task.isCompleted && (
              <div className="flex items-center gap-2 mt-0.5">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className={`w-3 h-3 ${isOverdue ? "text-red-400" : (isToday ? "text-purple-400" : "text-zinc-500")}`} />
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${isOverdue ? "text-red-400" : (isToday ? "text-purple-400" : "text-zinc-500")}`}>
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
              </div>
            )}
          </DialogTrigger>
        </div>
        
        {/* Tagi na liście */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {task.tags.map(tag => (
              <span 
                key={tag.id}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${tag.color}/10 text-${tag.color}`}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edycja Zadania</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Tytuł */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tytuł</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Opis Markdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Notatka (Markdown)
            </label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={4}
              placeholder="Zanotuj szczegóły, linki, przemyślenia..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 font-mono resize-y"
            />
            {description && (
              <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50 mt-2 text-sm prose prose-invert max-w-none">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Tagi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5" /> Tagi (po przecinku)
            </label>
            <input 
              value={tagNames} 
              onChange={e => setTagNames(e.target.value)} 
              placeholder="np. zakupy, dom, pilne"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-purple-500"
            />
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border border-zinc-800">
                <img src={imageUrl} alt="Podgląd" className="w-full h-auto object-cover max-h-40" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Zapisz Zmiany
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
