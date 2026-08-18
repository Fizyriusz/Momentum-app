"use client";

import { useState } from "react";
import { Task } from "@/lib/services/tasks";
import { TaskItem } from "./task-item";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { ListChecks, Check, X } from "lucide-react";
import { Button } from "./ui/button";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 text-sm font-medium">
        Brak zadań. Jesteś na czysto!
      </div>
    );
  }

  const allSelected = tasks.length > 0 && tasks.every(t => selectedIds.has(t.id));

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tasks.map(t => t.id)));
    }
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-3">
      {/* Pasek kontroli zaznaczania */}
      <div className="flex items-center justify-between px-1 text-xs">
        {isSelectionMode ? (
          <div className="flex items-center justify-between w-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 rounded-2xl px-3 py-2 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 hover:opacity-80 transition-opacity"
            >
              <div 
                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  allSelected 
                    ? "bg-purple-600 border-purple-600 text-white" 
                    : "border-purple-400 bg-white/50 dark:bg-zinc-900"
                }`}
              >
                {allSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span>{allSelected ? "Odznacz wszystkie" : "Zaznacz wszystkie"}</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="font-extrabold text-purple-800 dark:text-purple-200">
                {selectedIds.size} / {tasks.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleExitSelection}
                className="h-7 px-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 rounded-xl"
              >
                Gotowe
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={() => setIsSelectionMode(true)}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors py-1 px-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Zaznacz</span>
            </button>
          </div>
        )}
      </div>

      {/* Lista zadań */}
      <ul className="space-y-1">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskItem 
              task={task} 
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(task.id)}
              onToggleSelect={() => handleToggleTask(task.id)}
            />
          </li>
        ))}
      </ul>

      {/* Pływający dolny pasek akcji masowych */}
      {isSelectionMode && selectedIds.size > 0 && (
        <BulkActionToolbar 
          selectedTaskIds={Array.from(selectedIds)} 
          onClearSelection={() => setSelectedIds(new Set())} 
        />
      )}
    </div>
  );
}
