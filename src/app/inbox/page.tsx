"use client";

import { useTasks } from "@/lib/services/tasks";
import { QuickAddTask } from "@/components/quick-add-task";
import { TaskList } from "@/components/task-list";
import { Inbox } from "lucide-react";

export default function InboxPage() {
  const { tasks, loading } = useTasks();
  
  // Inbox tasks: brak przypisanego projectId oraz nieukończone
  const inboxTasks = tasks.filter(t => !t.projectId && !t.isCompleted);

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-2xl">
          <Inbox className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Inbox</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Zrzuć myśli z głowy.</p>
        </div>
      </header>

      <section className="bg-white/60 dark:bg-zinc-950 rounded-3xl">
        {/* Szybkie dodawanie */}
        <QuickAddTask />

        {/* Lista zadań */}
        {loading ? (
          <div className="text-zinc-500 text-sm p-4">Ładowanie...</div>
        ) : (
          <TaskList tasks={inboxTasks} />
        )}
      </section>
    </main>
  );
}
