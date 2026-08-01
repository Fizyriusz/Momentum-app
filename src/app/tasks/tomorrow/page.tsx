import { getTasksByTimeframe } from "@/app/actions";
import { TaskList } from "@/components/task-list";
import { Sunset } from "lucide-react";
import { QuickAddTask } from "@/components/quick-add-task";

export const dynamic = "force-dynamic";

export default async function TomorrowTasksPage() {
  const tasks = await getTasksByTimeframe("tomorrow");

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Sunset className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Jutro</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Zadania zaplanowane na jutrzejszy dzień.</p>
        </div>
      </header>

      <section className="mt-4">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-md p-4">
          <QuickAddTask />
          <TaskList tasks={tasks} />
        </div>
      </section>
    </main>
  );
}
