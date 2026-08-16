"use client";

import { useHabits } from "@/lib/services/habits";
import { HabitList } from "@/components/habit-list";
import { Droplet } from "lucide-react";

export default function HabitsPage() {
  const { habits, loading } = useHabits();

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-2xl">
          <Droplet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Nawyki</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoje codzienne mikrozadania i rutyny.</p>
        </div>
      </header>

      <section className="mt-4">
        {loading ? (
          <div className="text-zinc-500 text-sm">Ładowanie...</div>
        ) : (
          <HabitList habits={habits} />
        )}
      </section>
    </main>
  );
}
