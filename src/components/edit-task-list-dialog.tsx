"use client";

import { useState, useTransition } from "react";
import { updateTaskList, deleteTaskList, TaskList } from "@/lib/services/tasks";
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
import { Settings2, Trash2, Save, Archive } from "lucide-react";
import { LIST_ICONS, LIST_COLORS } from "./create-task-list-dialog";
import { useRouter } from "next/navigation";

export function EditTaskListDialog({ 
  taskList,
  trigger,
  onDeleted
}: { 
  taskList: TaskList,
  trigger?: React.ReactNode,
  onDeleted?: () => void
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(taskList.name);
  const [selectedIcon, setSelectedIcon] = useState(taskList.icon || "List");
  const [selectedColor, setSelectedColor] = useState(taskList.color || "purple");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(taskList.projectId || "");

  const { projects: activeProjects } = useProjects("ACTIVE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    startTransition(async () => {
      await updateTaskList(taskList.id, {
        name: cleanName,
        projectId: selectedProjectId || null,
        icon: selectedIcon,
        color: selectedColor
      });
      setOpen(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Czy na pewno chcesz usunąć listę "${taskList.name}"? Zadania w tej liście nie zostaną skasowane, ale stracą przypisanie.`)) return;

    startTransition(async () => {
      await deleteTaskList(taskList.id);
      setOpen(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/inbox");
      }
    });
  };

  const handleToggleArchive = () => {
    startTransition(async () => {
      await updateTaskList(taskList.id, {
        isArchived: !taskList.isArchived
      });
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          trigger ? (
            trigger as React.ReactElement
          ) : (
            <Button 
              variant="outline"
              size="sm" 
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs"
            >
              <Settings2 className="w-3.5 h-3.5 mr-1" /> Ustawienia Listy
            </Button>
          )
        }
      />

      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md w-[90vw] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tight">
            <Settings2 className="w-5 h-5 text-purple-500" />
            Edycja Listy Zadań
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nazwa listy */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">
              Nazwa Listy
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800 text-sm font-medium"
              required
            />
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
              Przypisanie do Projektu
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

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-2"
                title="Usuń listę"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleArchive}
                disabled={isPending}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-2"
                title={taskList.isArchived ? "Przywróć listę" : "Zarchiwizuj listę"}
              >
                <Archive className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
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
                <Save className="w-3.5 h-3.5 mr-1.5" /> Zapisz
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
