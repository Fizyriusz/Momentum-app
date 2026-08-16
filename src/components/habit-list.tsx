"use client";

import { useState, useTransition, useOptimistic, useMemo } from "react";
import { toggleHabit, deleteHabit, createHabit, Habit } from "@/lib/services/habits";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, CheckCircle2, Plus, Trash2, Droplet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getLocalDateString(d: Date) {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
}

export function HabitList({ habits }: { habits: Habit[] }) {
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, startAdding] = useTransition();

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTitle.trim();
    if (!clean) return;

    startAdding(async () => {
      await createHabit(clean);
      setNewTitle("");
    });
  };

  return (
    <section className="space-y-6">
      {/* Formularz szybkiego dodawania nowego nawyku */}
      <form onSubmit={handleAddHabit} className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nowy codzienny nawyk (np. 30 minut czytania, trening, zimny prysznic)..."
          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl h-11 px-4 focus-visible:ring-purple-500"
          disabled={isAdding}
        />
        <Button
          type="submit"
          disabled={isAdding || !newTitle.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-11 px-4 rounded-xl shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Dodaj Nawyk
        </Button>
      </form>

      {/* Lista nawyków */}
      <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Twoje Nawyki ({habits.length})
            </h2>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Ostatnie 7 dni
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-sm">
            Brak zdefiniowanych nawyków. Dodaj swój pierwszy nawyk powyżej!
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <HabitItem key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HabitItem({ habit }: { habit: Habit }) {
  const [isPending, startTransition] = useTransition();

  // Odtwarzamy tablicę z JSONa
  const datesArray: string[] = useMemo(() => {
    try {
      return JSON.parse(habit.completedDates) || [];
    } catch {
      return [];
    }
  }, [habit.completedDates]);

  // Generujemy 7 ostatnich dni (od najstarszego do dzisiaj)
  const last7Days = useMemo(() => {
    const days = [];
    const todayDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      days.push(getLocalDateString(d));
    }
    return days;
  }, []);

  const todayStr = last7Days[6]; // Dzisiaj
  const isDoneToday = datesArray.includes(todayStr);

  const [optimisticIsDone, setOptimisticIsDone] = useOptimistic(
    isDoneToday
  );

  // Podmieniamy status dzisiejszej kropki na podstawie optimisticIsDone
  const optimisticDatesArray = [...datesArray];
  if (optimisticIsDone && !optimisticDatesArray.includes(todayStr)) {
    optimisticDatesArray.push(todayStr);
  } else if (!optimisticIsDone && optimisticDatesArray.includes(todayStr)) {
    const index = optimisticDatesArray.indexOf(todayStr);
    if (index !== -1) optimisticDatesArray.splice(index, 1);
  }

  function handleToggle() {
    startTransition(async () => {
      setOptimisticIsDone(!optimisticIsDone);
      await toggleHabit(habit.id, todayStr, habit.completedDates);
    });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Czy na pewno chcesz usunąć nawyk "${habit.title}"?`)) return;
    startTransition(async () => {
      await deleteHabit(habit.id);
    });
  }

  return (
    <div
      onClick={handleToggle}
      className={`
        group w-full flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        ${optimisticIsDone
          ? "bg-purple-500/10 border border-purple-500/30"
          : "bg-zinc-950/60 border border-zinc-800/50 hover:bg-zinc-800/80"
        }
        ${isPending ? "opacity-60" : ""}
      `}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Checkbox
          checked={optimisticIsDone}
          className={`
            h-5 w-5 rounded-md border-2 transition-colors duration-300 shrink-0
            ${optimisticIsDone
              ? "border-purple-500 bg-purple-500 text-white data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
              : "border-zinc-600 bg-transparent"
            }
          `}
          tabIndex={-1}
        />
        
        <div className="flex flex-col items-start gap-1.5 min-w-0 flex-1">
          <span
            className={`
              text-sm font-medium transition-all duration-300 leading-none truncate w-full text-left
              ${optimisticIsDone
                ? "text-purple-300 line-through decoration-purple-500/50"
                : "text-zinc-200"
              }
            `}
          >
            {habit.title}
          </span>
          
          {/* Pasek z kropkami (7 dni) */}
          <div className="flex gap-1.5 items-center">
            {last7Days.map((dateStr, index) => {
              const isCompleted = optimisticDatesArray.includes(dateStr);
              const isToday = index === 6;
              return (
                <div
                  key={dateStr}
                  title={dateStr}
                  className={`rounded-full transition-colors ${
                    isCompleted 
                      ? "bg-purple-500" 
                      : "bg-zinc-700/60"
                  } ${isToday ? "w-2.5 h-2.5 ring-1 ring-purple-500/40" : "w-1.5 h-1.5"}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Znacznik ukończenia */}
        {optimisticIsDone && (
          <span className="text-xs text-purple-400 flex items-center justify-center bg-purple-500/20 rounded-full w-6 h-6">
            <Check className="w-4 h-4" />
          </span>
        )}

        {/* Przycisk usuwania */}
        <button
          type="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 rounded-md transition-opacity"
          title="Usuń nawyk"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
