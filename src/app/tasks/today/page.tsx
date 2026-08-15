"use client";

import { useTasks } from "@/lib/services/tasks";
import { TaskList } from "@/components/task-list";
import { Sun } from "lucide-react";
import { QuickAddTask } from "@/components/quick-add-task";

export default function TodayTasksPage() {
  const { tasks, loading } = useTasks();

  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];

  const todayTasks = tasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= todayStr);

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Sun className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Dzisiaj</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoje zadania zaplanowane na dzisiaj lub zaległe.</p>
        </div>
      </header>

      <section className="mt-4">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-md p-4">
          <QuickAddTask />
          {loading ? (
            <div className="text-zinc-500 text-sm p-4">Ładowanie...</div>
          ) : (
            <TaskList tasks={todayTasks} />
          )}
        </div>
      </section>
    </main>
  );
}
