"use client";

import { useTransition, useOptimistic, useMemo } from "react";
import { toggleHabit } from "@/lib/services/habits";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, CheckCircle2 } from "lucide-react";

type Habit = {
  id: string;
  title: string;
  completedDates: string; // JSON array string
};

function getLocalDateString(d: Date) {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
}

export function HabitList({ habits }: { habits: Habit[] }) {
  return (
    <section className="space-y-1 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
      {/* Nagłówek sekcji */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-4 w-4 text-purple-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Codzienne Nawyki
        </h2>
      </div>

      {/* Lista nawyków */}
      <div className="space-y-2">
        {habits.map((habit) => (
          <HabitItem key={habit.id} habit={habit} />
        ))}
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

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-xl
        transition-all duration-300 ease-out
        ${optimisticIsDone
          ? "bg-purple-500/10 border border-purple-500/30"
          : "bg-zinc-950/60 border border-zinc-800/50 hover:bg-zinc-800/80"
        }
        ${isPending ? "opacity-60" : ""}
        active:scale-[0.98]
      `}
    >
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
      
      <div className="flex flex-col items-start gap-1.5 flex-1">
        <span
          className={`
            text-sm font-medium transition-all duration-300 leading-none
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
                } ${isToday ? "w-2 h-2" : "w-1.5 h-1.5"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Znacznik ukończenia */}
      {optimisticIsDone && (
        <span className="ml-auto text-xs text-purple-400 flex items-center justify-center bg-purple-500/20 rounded-full w-6 h-6 shrink-0">
          <Check className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}
