// Quest Log – Główna strona (Server Component)
// Pobiera dane z bazy i renderuje 3 sekcje dashboardu: Nawyki, Budżety Tygodniowe, Chill Zone

import { getHabitsForToday, getSkills, getTasksByTimeframe } from "./actions";
import { RewardSection } from "@/components/reward-section";
import { Zap, Target, Flame, ArrowRight } from "lucide-react";
import { MiniTimer } from "@/components/mini-timer";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [habits, skills, todayTasks] = await Promise.all([
    getHabitsForToday(),
    getSkills(),
    getTasksByTimeframe("today")
  ]);

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];

  const dailyLoggedMinutes = skills.reduce((sum, s) => sum + s.loggedMinutesToday, 0);
  
  let habitsDone = 0;
  const allHabitsDone = habits.length > 0 && habits.every(h => {
    try {
      const dates = JSON.parse(h.completedDates) || [];
      if (dates.includes(todayStr)) habitsDone++;
      return dates.includes(todayStr);
    } catch {
      return false;
    }
  });
  
  const rewardUnlocked = dailyLoggedMinutes >= 60 || allHabitsDone;

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 pb-20">
      <div className="mx-auto max-w-md px-4 py-8 flex flex-col gap-6">
        
        <header className="flex flex-col gap-1 items-center justify-center pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-500 fill-purple-500 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tight uppercase text-zinc-100">Momentum</h1>
          </div>
          <time className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mt-1">{today}</time>
        </header>

        {/* 1. Uniwersalny Stoper */}
        <section>
          <MiniTimer skills={skills} />
        </section>

        {/* Szybkie dodawanie */}
        <section>
          <QuickAddTask />
        </section>

        {/* 2. Mini Podsumowanie Nawyków */}
        <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200">Dzisiejsze Nawyki</p>
              <p className="text-xs text-zinc-500 font-medium">Ukończono {habitsDone} z {habits.length}</p>
            </div>
          </div>
          <Link href="/habits" className="text-purple-400 hover:text-purple-300 transition-colors p-2">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* 3. Najbliższe Zadania (Dzisiaj) */}
        <section className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              Zadania na dziś
            </h2>
            <Link href="/tasks/today" className="text-[10px] font-bold text-purple-500 uppercase tracking-wider hover:text-purple-400">
              Zobacz wszystkie
            </Link>
          </div>
          
          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-2">
            <TaskList tasks={todayTasks.slice(0, 5)} />
            {todayTasks.length > 5 && (
              <p className="text-center text-xs text-zinc-500 font-medium py-2 pb-1">
                + {todayTasks.length - 5} kolejnych zadań na liście
              </p>
            )}
          </div>
        </section>

        {/* 4. Skille - Krótkie podsumowanie postępu */}
        <section className="space-y-3 mt-2">
           <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
             Aktywne Projekty
           </h2>
           <div className="grid grid-cols-2 gap-3">
             {skills.map(skill => {
                const percent = Math.min(100, Math.round((skill.loggedMinutes / skill.targetMinutes) * 100));
                return (
                  <Link key={skill.id} href={`/skills/${skill.id}`} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 hover:bg-zinc-800/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                      <span className="text-xs font-bold text-zinc-300 truncate">{skill.title}</span>
                    </div>
                    <Progress value={percent} className="h-1.5 bg-zinc-800" indicatorClassName={percent >= 100 ? "bg-purple-400" : "bg-purple-600"} />
                  </Link>
                )
             })}
           </div>
        </section>

        <RewardSection unlocked={rewardUnlocked} />
        
      </div>
    </main>
  );
}


