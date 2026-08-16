import { Layers, CheckCircle2, ShieldCheck, MapPin, ListTodo, Calendar, Network, Trash2, Droplet, Tag } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Momentum.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.6.8 - AKTUALNA WERSJA */}
        <div className="bg-zinc-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
              <span className="text-purple-400">v0.6.8</span> - Dynamiczne Kategorie w Inkubatorze & Autouzupełnianie
            </h2>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Zarządzanie Kategoriami Projektów</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Dynamiczne Wykrywanie Kategorii:</strong> System automatycznie agreguje wszystkie unikalne kategorie użyte w projektach i proponuje je przy tworzeniu oraz edycji każdego kolejnego pomysłu.</li>
                <li><strong>Szybki Wybór & Nowa Kategoria:</strong> Możliwość przypisania kategorii jednym kliknięciem z listy dotychczasowych tagów lub wpisania zupełnie nowej z podpowiedziami (datalist).</li>
                <li><strong>Filtrowanie Inkubatora po Kategoriach:</strong> Dodano pasek zakładek w Inkubatorze umożliwiający błyskawiczne filtrowanie pomysłów wg wybranej kategorii wraz z licznikami.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.6.7 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.7</span> - Usuwanie z Inkubatora, Tworzenie Nawyków & Pełnoekranowy Graf
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong>Usuwanie Projektów z Inkubatora:</strong> Przycisk usuwania pomysłów z listy i modalu.</li>
            <li><strong>Tworzenie i Zarządzanie Nawykami (/habits):</strong> Szybkie dodawanie i usuwanie nawyków.</li>
            <li><strong>Pełnoekranowy Graf Relacji (/graph):</strong> Dynamiczne dopasowanie do 100% okna i przyciski sterowania zoomem.</li>
          </ul>
        </div>

        {/* v0.6.5 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.5</span> - Poprawki Egzekucji: Edycja Daty Zadań & Stabilizacja Bazy
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong>Pełna Edycja Daty Zadania:</strong> Panel wyboru terminu w modalu szczegółów zadania.</li>
            <li><strong>Domyślne Trafianie do Inboxa:</strong> Zadania bez daty trafiają wyłącznie do Inboxa.</li>
            <li><strong>Przepięcie Listy / Projektu:</strong> Możliwość zmiany przypisania zadania w oknie edycji.</li>
          </ul>
        </div>

        {/* v0.6.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.6.0</span> - Tworzenie List Zadań & Twardy Limit Projektów
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong>Tworzenie i Organizacja List:</strong> Dedykowana sekcja <em>Listy</em> w pasku bocznym z przyciskiem <code>+</code>.</li>
            <li><strong>Dynamiczne Liczniki Zadań:</strong> Prezentacja liczby otwartych zadań w czasie rzeczywistym.</li>
            <li><strong>Twardy Limit 2 Aktywnych Projektów:</strong> Blokada aktywacji z modalem.</li>
            <li><strong>Stan PAUSED:</strong> Wstrzymywanie i wznawianie projektów.</li>
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
