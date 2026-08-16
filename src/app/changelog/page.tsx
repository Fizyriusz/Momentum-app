import { Layers, CheckCircle2, ShieldCheck, MapPin, ListTodo, Calendar, Network, Trash2, Droplet, Tag, LayoutGrid } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Momentum.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.7.0 - AKTUALNA WERSJA */}
        <div className="bg-zinc-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
              <span className="text-purple-400">v0.7.0</span> - Tablica Kanban z Własnymi Kolumnami & Przełącznik Widoków
            </h2>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Zaawansowana Tablica Kanban (Faza 1)</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Własne Kolumny Kanban:</strong> Możliwość tworzenia, edycji nazwy i usuwania dowolnych kolumn per lista (np. <em>Pomysły</em> ➔ <em>Scenariusz</em> ➔ <em>Montaż</em> ➔ <em>Publikacja</em>).</li>
                <li><strong>Oznaczanie Kolumn Ukończenia:</strong> Każda kolumna może być oznaczona jako stan docelowy/ukończony (`isCompleted`), co automatycznie aktualizuje status zadania.</li>
                <li><strong>Przeciąganie & Mobilne Przesuwanie:</strong> Obsługa natywnego Drag & Drop oraz intuicyjnych strzałek przesuwania między kolumnami na smartfonach.</li>
                <li><strong>Przełącznik Widoków (Lista vs Kanban):</strong> Dostępny w Listach Zadań (`/lists?id=...`) oraz w Projektach (`/projects?id=...`). Wybrany tryb jest zapamiętywany w przeglądarce.</li>
                <li><strong>Czysty Inbox:</strong> Zgodnie z zasadą prostoty, Inbox pozostaje nienaruszony jako prosta, szybka lista zadań.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.6.8 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.8</span> - Dynamiczne Kategorie w Inkubatorze & Autouzupełnianie
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Dynamiczne wykrywanie i agregacja kategorii projektów.</li>
            <li>Szybkie pigułki wyboru i autouzupełnianie (`datalist`).</li>
            <li>Pasek zakładek i filtrowanie pomysłów w Inkubatorze.</li>
          </ul>
        </div>

        {/* v0.6.7 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.7</span> - Usuwanie z Inkubatora, Tworzenie Nawyków & Pełnoekranowy Graf
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Usuwanie Projektów z Inkubatora: Przycisk usuwania pomysłów z listy i modalu.</li>
            <li>Tworzenie i Zarządzanie Nawykami (/habits): Szybkie dodawanie i usuwanie nawyków.</li>
            <li>Pełnoekranowy Graf Relacji (/graph): Dynamiczne dopasowanie do 100% okna i przyciski sterowania zoomem.</li>
          </ul>
        </div>

        {/* v0.6.5 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.5</span> - Poprawki Egzekucji: Edycja Daty Zadań & Stabilizacja Bazy
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Pełna Edycja Daty Zadania: Panel wyboru terminu w modalu szczegółów zadania.</li>
            <li>Domyślne Trafianie do Inboxa: Zadania bez daty trafiają wyłącznie do Inboxa.</li>
            <li>Przepięcie Listy / Projektu: Możliwość zmiany przypisania zadania w oknie edycji.</li>
          </ul>
        </div>

        {/* v0.6.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.0</span> - Tworzenie List Zadań & Twardy Limit Projektów
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Tworzenie i Organizacja List: Dedykowana sekcja <em>Listy</em> w pasku bocznym z przyciskiem <code>+</code>.</li>
            <li>Dynamiczne Liczniki Zadań: Prezentacja liczby otwartych zadań w czasie rzeczywistym.</li>
            <li>Twardy Limit 2 Aktywnych Projektów: Blokada aktywacji z modalem.</li>
            <li>Stan PAUSED: Wstrzymywanie i wznawianie projektów.</li>
          </ul>
        </div>

        {/* v0.5.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.5.0</span> - De-gamifikacja: Surowy System Egzekucji
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Usunięcie nagród, XP, serii nawyków i terminologii RPG.</li>
            <li>Refaktor bazy danych: <code>skills</code> ➔ <code>projects</code>.</li>
          </ul>
        </div>

        {/* v0.4.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.4.0</span> - Geofencing w Tle, Miejsca & Natywna Mobilność
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li>Moduł Miejsc (/places), geofencing oraz baza miast.</li>
            <li>Natywne Logowanie Google przez Capacitor Firebase Authentication.</li>
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
