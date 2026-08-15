"use client";

import { useState, useTransition } from "react";
import { createTaskList, TaskList } from "@/lib/services/tasks";
import { useProjects } from "@/lib/services/projects";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ListTodo, 
  Monitor, 
  Bookmark, 
  Target, 
  Home, 
  Briefcase, 
  Code, 
  Flame, 
  Zap, 
  Gamepad2, 
  Plus,
  Layers,
  FolderPlus
} from "lucide-react";
import { useRouter } from "next/navigation";

export const LIST_ICONS: Record<string, React.ElementType> = {
  List: ListTodo,
  Monitor: Monitor,
  Bookmark: Bookmark,
  Target: Target,
  Home: Home,
  Briefcase: Briefcase,
  Code: Code,
  Flame: Flame,
  Zap: Zap,
  Gamepad: Gamepad2,
  Layers: Layers
};

export const LIST_COLORS = [
  { id: "purple", name: "Fioletowy", bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500" },
  { id: "blue", name: "Niebieski", bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500" },
  { id: "emerald", name: "Zielony", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500" },
  { id: "amber", name: "Bursztynowy", bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500" },
  { id: "rose", name: "Różowy", bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500" },
  { id: "indigo", name: "Indygo", bg: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500" },
  { id: "zinc", name: "Cynkowy", bg: "bg-zinc-400", text: "text-zinc-400", border: "border-zinc-400" },
];

export function CreateTaskListDialog({ 
  defaultProjectId, 
  trigger,
  onCreated 
}: { 
  defaultProjectId?: string | null,
  trigger?: React.ReactNode,
  onCreated?: (newListId: string) => void
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("List");
  const [selectedColor, setSelectedColor] = useState("purple");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || "");

  const { projects: activeProjects } = useProjects("ACTIVE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    startTransition(async () => {
      const docRef = await createTaskList(cleanName, {
        projectId: selectedProjectId || null,
        icon: selectedIcon,
        color: selectedColor
      });

      setName("");
      setSelectedIcon("List");
      setSelectedColor("purple");
      setOpen(false);

      if (docRef?.id) {
        if (onCreated) {
          onCreated(docRef.id);
        } else {
          router.push(`/lists?id=${docRef.id}`);
        }
      }
    });
  };

  const SelectedIconComponent = LIST_ICONS[selectedIcon] || ListTodo;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          trigger ? (
            trigger as React.ReactElement
          ) : (
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Nowa Lista
            </Button>
          )
        }
      />

      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md w-[90vw] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <FolderPlus className="w-5 h-5 text-purple-500" />
            Utwórz Nową Listę Zadań
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nazwa listy */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Nazwa Listy
            </label>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl shrink-0 text-zinc-300">
                <SelectedIconComponent className="w-5 h-5" />
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Content Creation, Personal, Backlog..."
                className="bg-zinc-900/50 border-zinc-800 text-sm font-medium"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Wybór Ikony */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Ikona Listy
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(LIST_ICONS).map(([key, IconComp]) => {
                const isSelected = selectedIcon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedIcon(key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected 
                        ? "bg-purple-500/20 border-purple-500 text-purple-300 scale-105" 
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wybór Koloru */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Kolor Akcentu
            </label>
            <div className="flex items-center gap-3">
              {LIST_COLORS.map((col) => {
                const isSelected = selectedColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.id)}
                    className={`w-6 h-6 rounded-full ${col.bg} transition-all relative flex items-center justify-center ${
                      isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Powiązanie z Projektem */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Przypisanie do Projektu (Opcjonalne)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Brak (Lista ogólna / niezależna)</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  Projekt: {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider"
            >
              Utwórz Listę
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
