"use client";

import { useHabits } from "@/lib/services/habits";
import { useProjects } from "@/lib/services/projects";
import { useTasks } from "@/lib/services/tasks";
import { usePlaces, getDistance } from "@/lib/services/places";
import { Layers, Target, Flame, ArrowRight, MapPin } from "lucide-react";
import { MiniTimer } from "@/components/mini-timer";
import { TaskList } from "@/components/task-list";
import { QuickAddTask } from "@/components/quick-add-task";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Geolocation } from "@capacitor/geolocation";

export default function Home() {
  const { habits, loading: loadingHabits } = useHabits();
  const { projects, loading: loadingProjects } = useProjects("ACTIVE");
  const { tasks: allTasks, loading: loadingTasks } = useTasks();
  const { places, loading: loadingPlaces } = usePlaces();

  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Odczyt jednorazowy po wejściu na stronę główną
    Geolocation.getCurrentPosition()
      .then(pos => {
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      })
      .catch(err => {
        console.error("Geofencing error:", err);
      });
  }, []);

  const today = new Date().toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const todayStr = new Date(d.getTime() - offset).toISOString().split("T")[0];

  // Filtrujemy dzisiejsze zadania po stronie klienta (tylko zadania z przypisaną datą na dziś lub zaległe)
  const todayTasks = allTasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] <= todayStr);

  // Szukamy, w jakich miejscach się teraz znajdujemy
  const activePlaces = currentLocation && places ? places.filter(place => {
    const dist = getDistance(currentLocation.lat, currentLocation.lng, place.lat, place.lng);
    return dist <= place.radiusMeters;
  }) : [];

  // Wyciągamy zadania przypisane do tych miejsc
  const placeTasks = allTasks.filter(t => !t.isCompleted && t.placeId && activePlaces.some(p => p.id === t.placeId));

  let habitsDone = 0;
  habits.forEach(h => {
    try {
      const dates = JSON.parse(h.completedDates) || [];
      if (dates.includes(todayStr)) habitsDone++;
    } catch {}
  });

  const isLoading = loadingHabits || loadingProjects || loadingTasks;

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Layers className="h-8 w-8 text-purple-600 dark:text-purple-500 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-purple-500/30 pb-20 transition-colors duration-200">
      <div className="mx-auto max-w-md px-4 py-8 flex flex-col gap-6">
        
        <header className="flex flex-col gap-1 items-center justify-center pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-600 dark:text-purple-500" />
            <h1 className="text-2xl font-black tracking-tight uppercase text-zinc-900 dark:text-zinc-100">Momentum</h1>
          </div>
          <time className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mt-1">{today}</time>
        </header>

        {/* Baner Geofencingowy */}
        {activePlaces.length > 0 && placeTasks.length > 0 && (
          <section className="bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 rounded-3xl p-4 animate-in fade-in slide-in-from-top-2 shadow-xs">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-xl shrink-0">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-blue-900 dark:text-blue-100">Jesteś w zapisanej strefie!</h2>
                <p className="text-xs text-blue-800/80 dark:text-blue-200/70 mt-0.5">
                  Wykryto obecność w: <span className="font-bold text-blue-700 dark:text-blue-300">{activePlaces.map(p => p.name).join(", ")}</span>.
                  Masz tu {placeTasks.length} {placeTasks.length === 1 ? 'zadanie' : placeTasks.length >= 2 && placeTasks.length <= 4 ? 'zadania' : 'zadań'}.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <TaskList tasks={placeTasks} />
            </div>
          </section>
        )}

        {/* 1. Rejestrator Czasu */}
        <section>
          <MiniTimer projects={projects} />
        </section>

        {/* Szybkie dodawanie */}
        <section>
          <QuickAddTask />
        </section>

        {/* 2. Podsumowanie Nawyków */}
        <section className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/50 rounded-3xl p-4 flex items-center justify-between backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-2xl">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Dzisiejsze Nawyki</p>
              <p className="text-xs text-zinc-500 font-medium">Ukończono {habitsDone} z {habits.length}</p>
            </div>
          </div>
          <Link href="/habits" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors p-2">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* 3. Najbliższe Zadania (Dzisiaj) */}
        <section className="space-y-3 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              Zadania na dziś
            </h2>
            <Link href="/tasks/today" className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider hover:underline">
              Zobacz wszystkie
            </Link>
          </div>
          
          <div className="bg-white/60 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/50 rounded-3xl p-2 shadow-xs dark:shadow-none">
            <TaskList tasks={todayTasks.slice(0, 5)} />
            {todayTasks.length > 5 && (
              <p className="text-center text-xs text-zinc-500 font-medium py-2 pb-1">
                + {todayTasks.length - 5} kolejnych zadań na liście
              </p>
            )}
          </div>
        </section>

        {/* 4. Projekty - Podsumowanie postępu */}
        <section className="space-y-3 mt-2">
           <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
             Aktywne Projekty
           </h2>
           <div className="grid grid-cols-2 gap-3">
             {projects.map(project => {
                const percent = Math.min(100, Math.round(((project.loggedMinutes || 0) / (project.targetMinutes || 1)) * 100));
                return (
                  <Link key={project.id} href={`/projects?id=${project.id}`} className="bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/50 rounded-2xl p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group shadow-xs dark:shadow-none">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 truncate">{project.title}</span>
                    </div>
                    <Progress value={percent} className="h-1.5 bg-zinc-200 dark:bg-zinc-800" indicatorClassName={percent >= 100 ? "bg-emerald-500" : "bg-purple-600 dark:bg-purple-500"} />
                  </Link>
                )
             })}
           </div>
        </section>
        
      </div>
    </main>
  );
}
