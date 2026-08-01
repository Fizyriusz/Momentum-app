"use client";

import { useState, useTransition } from "react";
import { createTask } from "@/app/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Sun, Sunset, CalendarX } from "lucide-react";

export function QuickAddTask({ projectId }: { projectId?: string }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      await createTask(title, projectId, dueDate || undefined);
      setTitle("");
      setDueDate(null);
    });
  }

  const setToday = () => {
    const today = new Date();
    setDueDate(today);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow);
  };

  const clearDate = () => setDueDate(null);

  const isToday = dueDate && new Date().toDateString() === dueDate.toDateString();
  const isTomorrow = dueDate && (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dueDate.toDateString() === tomorrow.toDateString();
  })();

  return (
    <div className="flex flex-col gap-2 w-full mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full relative">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Co masz do zrobienia?"
          className="flex-1 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-12 pl-4 pr-12 focus-visible:ring-purple-500/50"
          disabled={isPending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending || !title.trim()}
          className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </form>
      <div className="flex items-center gap-2 px-1">
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
        {dueDate && (
          <button
            type="button"
            onClick={clearDate}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-colors border bg-zinc-900 border-zinc-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 ml-auto"
          >
            <CalendarX className="w-3 h-3" /> Wyczyść datę
          </button>
        )}
      </div>
    </div>
  );
}

