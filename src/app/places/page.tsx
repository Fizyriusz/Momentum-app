"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePlaces, Place } from "@/lib/services/places";
import { useTasks } from "@/lib/services/tasks";
import { MAX_ACTIVE_GEOFENCES } from "@/lib/services/background-location";
import { 
  MapPin, 
  Plus, 
  Radio, 
  Navigation, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  ListTodo,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatePlaceDialog } from "@/components/create-place-dialog";
import { EditPlaceDialog } from "@/components/edit-place-dialog";
import { TaskList } from "@/components/task-list";

// Dynamiczny import mapy zbiorczej (SSR false dla Leaflet)
const PlacesOverviewMap = dynamic(() => import("@/components/places-overview-map"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 font-bold animate-pulse">
      Ładowanie mapy stref...
    </div>
  )
});

export default function PlacesPage() {
  const { places, loading: placesLoading } = usePlaces();
  const { tasks, loading: tasksLoading } = useTasks();

  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);

  const isLoading = placesLoading || tasksLoading;

  // Zliczanie aktywnych zadań dla poszczególnych stref z memoizacją
  const activePlacesSet = useMemo(() => {
    return new Set(
      places
        .filter(p => tasks.some(t => t.placeId === p.id && !t.isCompleted))
        .slice(0, MAX_ACTIVE_GEOFENCES)
        .map(p => p.id)
    );
  }, [places, tasks]);

  const handleSelectPlace = useCallback((place: Place) => {
    setExpandedPlaceId(prev => prev === place.id ? null : place.id);
  }, []);

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-8">
      {/* 1. Nagłówek i Status Geofencingu */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
              Miejsca & Geofencing
            </h1>
            <p className="text-zinc-500 text-sm font-medium mt-0.5">
              Inteligentne strefy GPS aktywowane przez otwarte zadania.
            </p>
          </div>
        </div>

        <CreatePlaceDialog />
      </header>

      {/* 2. Banner Informacyjny Task-Driven Geofencing */}
      <section className="bg-white dark:bg-zinc-900/40 border border-purple-500/30 dark:border-purple-500/20 p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
                Natywny Monitoring w Tle
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white">
                {activePlacesSet.size} / {MAX_ACTIVE_GEOFENCES} stref
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Zgodnie z regułą oszczędzania baterii i limitów systemowych, w telefonie aktywnie nasłuchiwane są <strong>wyłącznie te miejsca, w których masz nieukończone zadania</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Interaktywna Mapa Zbiorcza */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-purple-500" />
            Mapa Wszystkich Stref
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
            {places.length} zapisanych punktów
          </span>
        </div>

        <PlacesOverviewMap 
          places={places} 
          activePlaceIds={activePlacesSet} 
          onSelectPlace={handleSelectPlace}
        />
      </section>

      {/* 4. Lista Kart Miejsc */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Twoje Miejsca ({places.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-zinc-500 text-sm font-medium">
            Ładowanie stref geofencingowych...
          </div>
        ) : places.length === 0 ? (
          <div className="text-center p-10 text-zinc-500 flex flex-col items-center gap-4 bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-zinc-800 dark:text-zinc-300">Nie masz jeszcze żadnych zapisanych miejsc.</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Dodaj swoje pierwsze miejsce (np. Dom, Biuro, Siłownia), aby otrzymywać powiadomienia o zadaniach po wejściu w strefę.</p>
            </div>
            <CreatePlaceDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {places.map((place) => {
              const placeTasks = tasks.filter(t => t.placeId === place.id);
              const uncompletedTasks = placeTasks.filter(t => !t.isCompleted);
              const isMonitored = activePlacesSet.has(place.id);
              const isExpanded = expandedPlaceId === place.id;

              return (
                <div 
                  key={place.id}
                  className={`bg-white dark:bg-zinc-900/40 border rounded-3xl transition-all shadow-xs dark:shadow-none overflow-hidden ${
                    isMonitored 
                      ? "border-purple-500/50 dark:border-purple-500/30" 
                      : "border-zinc-200/80 dark:border-zinc-800/60"
                  }`}
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Informacje o Miejscu */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                        isMonitored 
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" 
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {place.name}
                          </h3>
                          
                          {/* Status nasłuchu */}
                          {isMonitored ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <Radio className="w-2.5 h-2.5 animate-pulse" /> Aktywny GPS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700/50">
                              Czuwanie (brak zadań)
                            </span>
                          )}
                        </div>

                        {place.address && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {place.address}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500 font-medium">
                          <span>Promień: <strong>{place.radiusMeters >= 1000 ? `${place.radiusMeters / 1000} km` : `${place.radiusMeters} m`}</strong></span>
                          <span>•</span>
                          <span>Współrzędne: <strong>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Akcje i rozwijanie zadań */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {placeTasks.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedPlaceId(prev => prev === place.id ? null : place.id)}
                          className="h-9 px-3 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 flex items-center gap-1.5"
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>Zadania ({uncompletedTasks.length})</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </Button>
                      )}

                      <EditPlaceDialog place={place} />
                    </div>
                  </div>

                  {/* Rozwinięta lista zadań przypisanych do tego miejsca */}
                  {isExpanded && placeTasks.length > 0 && (
                    <div className="p-4 bg-zinc-50/70 dark:bg-zinc-950/40 border-t border-zinc-200/80 dark:border-zinc-800/60 animate-in fade-in duration-200">
                      <div className="mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Przypisane zadania do tego punktu
                      </div>
                      <TaskList tasks={placeTasks} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
