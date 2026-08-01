import { getHabitsForToday } from "@/app/actions";
import { HabitList } from "@/components/habit-list";
import { Droplet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await getHabitsForToday();

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Droplet className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Nawyki</h1>
          <p className="text-zinc-500 text-sm font-medium mt-0.5">Twoje codzienne mikrozadania i rutyny.</p>
        </div>
      </header>

      <section className="mt-4">
        <HabitList habits={habits} />
      </section>
    </main>
  );
}
