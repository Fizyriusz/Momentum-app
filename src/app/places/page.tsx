"use client";

import { usePlaces, createPlace, deletePlace } from "@/lib/services/places";
import { MapPin, Plus, Trash, Navigation } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import cities from "@/lib/data/cities.json";

export default function PlacesPage() {
  const { places, loading } = usePlaces();
  const [isPending, startTransition] = useTransition();
  
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  
  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);

  function handleAddCity(city: typeof cities[0]) {
    startTransition(async () => {
      // Domyślny promień dla miast to 10km (10000m)
      await createPlace(city.name, city.lat, city.lng, 10000, "CITY");
      setIsAdding(false);
      setSearch("");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Usunąć to miejsce?")) return;
    startTransition(async () => {
      await deletePlace(id);
    });
  }

  return (
    <main className="min-h-full px-4 py-8 lg:px-12 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Miejsca</h1>
            <p className="text-zinc-500 text-sm font-medium mt-0.5">Zarządzaj swoimi strefami geofencingowymi.</p>
          </div>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-xl shadow-xs">
            <Plus className="w-4 h-4 mr-2" /> Dodaj Miejsce
          </Button>
        )}
      </header>

      {isAdding && (
        <section className="bg-white dark:bg-zinc-900/50 p-5 rounded-3xl border border-blue-500/30 shadow-md dark:shadow-none">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-300 mb-4">Wyszukaj miasto z bazy offline</h2>
          <Input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Np. Warszawa, Kraków..."
            className="bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 mb-4 rounded-xl"
          />
          <div className="space-y-2">
            {filteredCities.map(city => (
              <div key={city.name} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800/50">
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-200">{city.name}</div>
                  <div className="text-xs text-zinc-500">{city.lat}, {city.lng}</div>
                </div>
                <Button 
                  size="sm" 
                  disabled={isPending || places.some(p => p.name === city.name)} 
                  onClick={() => handleAddCity(city)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs text-xs"
                >
                  {places.some(p => p.name === city.name) ? "Dodane" : "Dodaj"}
                </Button>
              </div>
            ))}
            {search && filteredCities.length === 0 && (
              <div className="text-zinc-500 text-sm py-2">Brak wyników w bazie.</div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl text-xs">Anuluj</Button>
          </div>
        </section>
      )}

      <section>
        {loading ? (
          <div className="text-zinc-500 text-sm">Ładowanie...</div>
        ) : places.length === 0 ? (
          <div className="text-center p-8 text-zinc-500 flex flex-col items-center gap-4 bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 shadow-xs">
            <MapPin className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
            <p className="text-sm">Nie masz jeszcze przypisanych żadnych miejsc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map(place => (
              <div key={place.id} className="bg-white dark:bg-zinc-900/40 p-4 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/50 group flex justify-between items-center shadow-xs dark:shadow-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-200">{place.name}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-1">
                      Promień: {place.radiusMeters / 1000} km
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(place.id)} disabled={isPending} className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
