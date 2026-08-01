import { getInboxTasks } from "@/app/actions";
import { QuickAddTask } from "@/components/quick-add-task";
import { TaskList } from "@/components/task-list";
import { Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const tasks = await getInboxTasks();

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Inbox className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Inbox</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Zrzuć myśli z głowy.</p>
        </div>
      </header>

      <section className="bg-zinc-950 rounded-2xl">
        {/* Szybkie dodawanie */}
        <QuickAddTask />

        {/* Lista zadań (bez przypisanego projektu, nieukończone) */}
        <TaskList tasks={tasks} />
      </section>
    </main>
  );
}
