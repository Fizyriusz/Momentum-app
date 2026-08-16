"use client";

import { useTasks } from "@/lib/services/tasks";
import { TaskList } from "@/components/task-list";
import { CalendarDays } from "lucide-react";
import { QuickAddTask } from "@/components/quick-add-task";

export default function UpcomingTasksPage() {
  const { tasks, loading } = useTasks();

  const d = new Date();
  d.setDate(d.getDate() + 1); // jutro
  const offset = d.getTimezoneOffset() * 60000;
  const tomorrowStr = new Date(d.getTime() - offset).toISOString().split("T")[0];

  const upcomingTasks = tasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] > tomorrowStr);

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-2xl">
          <CalendarDays className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">7 Dni</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Zadania zaplanowane na najbliższe 7 dni.</p>
        </div>
      </header>

      <section className="mt-4">
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-md p-4 shadow-xs dark:shadow-none">
          <QuickAddTask />
          {loading ? (
            <div className="text-zinc-500 text-sm p-4">Ładowanie...</div>
          ) : (
            <TaskList tasks={upcomingTasks} />
          )}
        </div>
      </section>
    </main>
  );
}
