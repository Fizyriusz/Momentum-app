import { Layers, CheckCircle2, ShieldCheck, MapPin, ListTodo, Calendar } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Momentum.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.6.5 - AKTUALNA WERSJA */}
        <div className="bg-zinc-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
              <span className="text-purple-400">v0.6.5</span> - Poprawki Egzekucji: Edycja Daty Zadań & Stabilizacja Bazy
            </h2>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Zarządzanie Terminami Zadań</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Pełna Edycja Daty Zadania:</strong> Dodano panel wyboru terminu w modalu szczegółów zadania: przyciski szybkiego wyboru (<em>Dzisiaj</em>, <em>Jutro</em>, <em>Usuń datę / Inbox</em>) oraz kalendarzowy selektor daty.</li>
                <li><strong>Domyślne Trafianie do Inboxa:</strong> Zadania dodawane bez zaznaczenia terminu trafiają teraz wyłącznie do Inboxa i nie trafiają niepotrzebnie na listę <em>Dzisiaj</em>.</li>
                <li><strong>Przepięcie Listy / Projektu z Zadania:</strong> W oknie edycji zadania można teraz łatwo zmienić jego listę docelową lub projekt nadrzędny.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Stabilizacja Bazy & Inkubatora</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Natychmiastowe Wyświetlanie w Inkubatorze:</strong> Wyeliminowano problem z zapytaniami Firestore (usunięto zależność od indeksów złożonych) – nowo dodane pomysły pojawiają się na liście Inkubatora od razu.</li>
                <li><strong>Precyzyjne Liczniki:</strong> Poprawiono algorytm zliczania zadań w Inboxie i w widoku <em>Dzisiaj</em>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.6.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.0</span> - Tworzenie List Zadań & Twardy Limit Projektów
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong>Tworzenie i Organizacja List:</strong> Dedykowana sekcja <em>Listy</em> w pasku bocznym z przyciskiem <code>+</code>, customowymi ikonami i kolorami.</li>
            <li><strong>Dynamiczne Liczniki Zadań:</strong> Prezentacja liczby otwartych zadań przy każdej liście w czasie rzeczywistym.</li>
            <li><strong>Twardy Limit 2 Aktywnych Projektów:</strong> Blokada aktywacji kolejnych projektów w Inkubatorze z modalem wyjaśniającym.</li>
            <li><strong>Stan PAUSED:</strong> Możliwość wstrzymywania i wznawiania projektów oraz cofania do Inkubatora.</li>
          </ul>
        </div>

        {/* v0.5.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.5.0</span> - De-gamifikacja: Surowy System Egzekucji
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong>Usunięcie Sekcji Nagród:</strong> Całkowicie usunięto komponent RewardSection z Dashboardu.</li>
            <li><strong>Nawyki bez Serii:</strong> Usunięto liczniki ciągłości i medale.</li>
            <li><strong>Czyste Słownictwo:</strong> Usunięto terminologię RPG.</li>
            <li><strong>Refaktor Modelu Danych:</strong> Kolekcja <code>skills</code> ➔ <code>projects</code>, podlisty ➔ <code>taskLists</code>.</li>
          </ul>
        </div>

        {/* v0.4.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.4.0</span> - Geofencing w Tle, Miejsca & Natywna Mobilność
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Moduł Miejsc (/places):</strong> Punkty docelowe, geofencing oraz baza miast.</li>
            <li><strong className="text-zinc-300">Natywne Logowanie Google:</strong> Wdrożono bibliotekę <code>@capacitor-firebase/authentication</code>.</li>
          </ul>
        </div>

        {/* v0.3.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.3.0</span> - System Notatek & Przebudowa Inkubatora
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Globalne notatki Markdown oraz notatki w projektach.</li>
          </ul>
        </div>

        {/* v0.2.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.2.0</span> - Przebudowa Projektów (Flat UI & Historia)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Flat UI w projektach oraz historia sesji skupienia (TimeLog).</li>
          </ul>
        </div>

        {/* v0.1.0 */}
        <div className="space-y-4 opacity-70">
          <h2 className="text-lg font-bold text-zinc-400 flex items-center gap-2">
            <span className="text-zinc-500">v0.1.0</span> - Inicjalne wydanie Momentum (Beta)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1 ml-2">
            <li>Uruchomienie rdzenia aplikacji i systemu zadań.</li>
          </ul>
        </div>

      </section>
    </main>
  );
}
