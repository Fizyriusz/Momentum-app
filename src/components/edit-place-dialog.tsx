"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Place, updatePlace, deletePlace } from "@/lib/services/places";
import { 
  MapPin, 
  Trash2, 
  Loader2, 
  Check, 
  Sliders, 
  Pencil 
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";

const PlaceMapPicker = dynamic(() => import("./place-map-picker"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 font-bold animate-pulse">
      Ładowanie mapy...
    </div>
  )
});

const RADIUS_PRESETS = [
  { label: "100m", value: 100 },
  { label: "300m", value: 300 },
  { label: "500m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 }
];

export function EditPlaceDialog({
  place,
  trigger
}: {
  place: Place;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(place.name);
  const [address, setAddress] = useState(place.address || "");
  const [lat, setLat] = useState(place.lat);
  const [lng, setLng] = useState(place.lng);
  const [radiusMeters, setRadiusMeters] = useState(place.radiusMeters || 500);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await updatePlace(place.id, {
        name: name.trim(),
        address: address.trim() || null as any,
        lat,
        lng,
        radiusMeters
      });
      setOpen(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Czy na pewno chcesz usunąć miejsce „${place.name}”?`)) return;
    startTransition(async () => {
      await deletePlace(place.id);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          trigger ? (
            trigger as React.ReactElement
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )
        }
      />
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Edytuj Miejsce
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 my-2">
          {/* Mapa Leaflet */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium px-1">
              <span>Przeciągnij pinezkę, aby skorygować punkt</span>
              <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
            <PlaceMapPicker
              lat={lat}
              lng={lng}
              radiusMeters={radiusMeters}
              onChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />
          </div>

          {/* Nazwa Miejsca */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Nazwa Miejsca
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm h-11 rounded-xl font-bold"
              required
            />
          </div>

          {/* Adres */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Adres / Opis Lokalizacji
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="np. ul. Złota 44, Warszawa"
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-10 rounded-xl"
            />
          </div>

          {/* Promień Geofencingu */}
          <div className="space-y-2 p-3.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Promień Strefy (Geofence)
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-black">
                {radiusMeters >= 1000 ? `${radiusMeters / 1000} km` : `${radiusMeters} m`}
              </span>
            </div>

            {/* Presety Promienia */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setRadiusMeters(preset.value)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    radiusMeters === preset.value
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-purple-400"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Przyciski Modala */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isPending}
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-xs h-10 px-3 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Usuń</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-xl text-xs h-10 px-4"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-xs"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                Zapisz Zmiany
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
