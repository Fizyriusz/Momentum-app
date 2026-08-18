"use client";

import { useState, useTransition, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  createPlace, 
  searchAddressNominatim, 
  GeocodingResult 
} from "@/lib/services/places";
import { Geolocation } from "@capacitor/geolocation";
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Loader2, 
  Plus, 
  Check, 
  Sparkles,
  Sliders
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";

// Dynamiczny import mapy wyboru (wyłączony SSR dla Leaflet)
const PlaceMapPicker = dynamic(() => import("./place-map-picker"), { 
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs text-zinc-500 font-bold animate-pulse">
      Ładowanie mapy...
    </div>
  )
});

const RADIUS_PRESETS = [
  { label: "100m", value: 100, desc: "Budynek / Biuro" },
  { label: "300m", value: 300, desc: "Osiedle" },
  { label: "500m", value: 500, desc: "Standard" },
  { label: "1 km", value: 1000, desc: "Okolica" },
  { label: "3 km", value: 3000, desc: "Dzielnica" },
  { label: "5 km", value: 5000, desc: "Miasto" }
];

export function CreatePlaceDialog({
  trigger,
  onCreated
}: {
  trigger?: React.ReactNode;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Pola formularza
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(52.2297); // Domyślnie Warszawa
  const [lng, setLng] = useState(21.0122);
  const [radiusMeters, setRadiusMeters] = useState(500);

  // Wyszukiwarka adresów
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  // Debounce dla wyszukiwarki
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddressNominatim(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pobranie bieżącej pozycji GPS
  const handleLocateMe = async () => {
    setIsLocatingUser(true);
    try {
      const pos = await Geolocation.getCurrentPosition();
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
      if (!name) setName("Moja Lokalizacja");
    } catch (err) {
      console.error("Błąd lokalizacji GPS:", err);
      alert("Nie udało się pobrać lokalizacji GPS.");
    } finally {
      setIsLocatingUser(false);
    }
  };

  // Wybór adresu z podpowiedzi
  const handleSelectSearchResult = (result: GeocodingResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setLat(newLat);
    setLng(newLng);
    setAddress(result.display_name);

    // Sugestia krótkiej nazwy
    if (!name) {
      const shortName = result.display_name.split(",")[0];
      setName(shortName);
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await createPlace(
        name,
        lat,
        lng,
        radiusMeters,
        "CUSTOM",
        address || undefined
      );

      // Reset
      setName("");
      setAddress("");
      setSearchQuery("");
      setSearchResults([]);
      setOpen(false);
      if (onCreated) onCreated();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          trigger ? (
            trigger as React.ReactElement
          ) : (
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-4 rounded-xl shadow-xs">
              <Plus className="w-4 h-4 mr-2" /> Dodaj Miejsce
            </Button>
          )
        }
      />
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Nowe Miejsce / Strefa GPS
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* 1. Wyszukiwarka Adresów na Żywo */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span>Wyszukaj Adres lub Obiekt</span>
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocatingUser}
                className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {isLocatingUser ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
                Pobierz GPS z telefonu
              </button>
            </label>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="np. ul. Złota 44 Warszawa, Biuro, Kawiarnia..."
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 pl-9.5 text-xs h-10 rounded-xl"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 absolute right-3.5 top-3 text-purple-500 animate-spin" />
              )}
            </div>

            {/* Wyniki wyszukiwania Nominatim */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full p-2.5 text-left text-xs text-zinc-800 dark:text-zinc-200 hover:bg-purple-500/10 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Interaktywna Mapa Leaflet */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium px-1">
              <span>Kliknij lub przeciągnij pinezkę na mapie</span>
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

          {/* 3. Nazwa Miejsca */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Nazwa Miejsca
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Biuro Główne, Dom, Magazyn, Siłownia..."
              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm h-11 rounded-xl font-bold"
              required
            />
          </div>

          {/* 4. Promień Geofencingu */}
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
          <div className="flex items-center justify-end gap-2 pt-2">
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
              Zapisz Miejsce
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
