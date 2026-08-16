"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTasks } from "@/lib/services/tasks";
import { TaskList } from "@/components/task-list";
import { Hash } from "lucide-react";

function TagPageContent() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") || "";
  const tagName = decodeURIComponent(nameParam).toLowerCase();
  
  const { tasks, loading } = useTasks();

  if (!nameParam) return <div className="text-zinc-500 text-center py-20">Brak nazwy tagu.</div>;

  const tagTasks = tasks.filter(t => !t.isCompleted && t.tagNames && t.tagNames.some(name => name.toLowerCase() === tagName));

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-purple-500/10">
          <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">#{tagName}</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Zadania przypisane do tego tagu</p>
        </div>
      </header>

      <section className="mt-4">
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-md p-4 shadow-xs dark:shadow-none">
          {loading ? (
            <div className="text-zinc-500 text-sm p-4 text-center">Ładowanie...</div>
          ) : tagTasks.length === 0 ? (
            <div className="text-zinc-500 text-sm p-4 text-center">Brak zadań z tym tagiem.</div>
          ) : (
            <TaskList tasks={tagTasks} />
          )}
        </div>
      </section>
    </main>
  );
}

export default function TagPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-center py-20">Ładowanie...</div>}>
      <TagPageContent />
    </Suspense>
  );
}
