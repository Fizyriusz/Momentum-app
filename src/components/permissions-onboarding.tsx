"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { BackgroundGeolocation } from "@capgo/background-geolocation";
import { MapPin, Bell, BatteryWarning, ShieldCheck } from "lucide-react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export function PermissionsOnboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0); // 0 = start, 1 = lokalizacja, 2 = notyfikacje, 3 = bateria

  useEffect(() => {
    // Sprawdzamy czy to urządzenie natywne, w przeglądarce pomijamy
    if (!Capacitor.isNativePlatform()) return;

    // Prosta heurystyka – sprawdzamy uprawnienia na starcie
    const checkStatus = async () => {
      try {
        const bgStatus = await BackgroundGeolocation.checkPermissions();
        // Jeśli nie mamy uprawnień do tła (zawsze zezwalaj), pokaż onboarding
        if (bgStatus.location !== "granted") {
          const hasSeen = localStorage.getItem("duveo_permissions_seen") || localStorage.getItem("momentum_permissions_seen");
          if (!hasSeen) {
            setShow(true);
          }
        }
      } catch (error) {
        console.error("Permission check error", error);
      }
    };
    
    checkStatus();
  }, []);

  const requestLocation = async () => {
    try {
      await BackgroundGeolocation.requestPermissions();
      setStep(2);
    } catch (e) {
      setStep(2);
    }
  };

  const requestNotifications = async () => {
    try {
      await LocalNotifications.requestPermissions();
      setStep(3);
    } catch (e) {
      setStep(3);
    }
  };

  const finishOnboarding = () => {
    localStorage.setItem("duveo_permissions_seen", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl">
        {step === 0 && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Konfiguracja Uprawnień
            </h2>
            <p className="text-sm text-zinc-400 mb-8">
              Aby przypomnienia w tle działały, gdy jesteś w terenie, Duveo potrzebuje kilku uprawnień.
            </p>
            <Button 
              onClick={() => setStep(1)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-12"
            >
              Rozpocznij Konfigurację
            </Button>
            <button 
              onClick={finishOnboarding}
              className="mt-4 text-xs text-zinc-600 font-bold uppercase tracking-wider hover:text-zinc-400 transition-colors"
            >
              Pomiń na razie
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Śledzenie w Tle
            </h2>
            <p className="text-sm text-zinc-400 mb-2">
              Duveo wybudzi się i powiadomi Cię o zadaniach, gdy wejdziesz w przypisaną strefę.
            </p>
            <div className="bg-zinc-950 p-4 rounded-xl text-xs text-left mb-6 border border-zinc-800">
              <span className="text-yellow-500 font-bold">Ważne:</span> Gdy system zapyta o lokalizację, koniecznie wybierz <strong className="text-white">"Zawsze zezwalaj"</strong>. Inaczej funkcja nie zadziała gdy telefon będzie w kieszeni!
            </div>
            <Button 
              onClick={requestLocation}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12"
            >
              Przyznaj Dostęp
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Powiadomienia
            </h2>
            <p className="text-sm text-zinc-400 mb-8">
              Zezwól na wyświetlanie cichych lub głośnych alertów na zablokowanym ekranie Twojego smartfona.
            </p>
            <Button 
              onClick={requestNotifications}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12"
            >
              Włącz Powiadomienia
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
              <BatteryWarning className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
              Ostatni Krok
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Android agresywnie usypia aplikacje. Aby Geofencing działał poprawnie, przejdź do ustawień telefonu, znajdź Duveo i <strong>wyłącz "Optymalizację baterii"</strong>.
            </p>
            <Button 
              onClick={finishOnboarding}
              className="w-full bg-zinc-100 hover:bg-zinc-300 text-black font-bold h-12"
            >
              Gotowe, rozumiem!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
