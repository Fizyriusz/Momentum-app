import { Sun, Moon, Sparkles, Monitor, Layers, CheckCircle2, ShieldCheck, MapPin, ListTodo, Calendar, Network, Trash2, Droplet, Tag, LayoutGrid } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Momentum.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.7.5 - AKTUALNA WERSJA */}
        <div className="bg-white dark:bg-zinc-900/40 border border-purple-500/40 dark:border-purple-500/30 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-md dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">v0.7.5</span> - Tryb Jasny i Ciemny (Light & Dark Mode)
                </h2>
                <p className="text-xs text-zinc-500 font-medium">Etap 1.2 Roadmapy Momentum</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Nowości & Usprawnienia Stylistyczne</h3>
              <ul className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Trójpozycyjny Przełącznik Motywów:</strong> Jasny (Light), Ciemny (Dark) oraz Automatyczny (System) w dolnym panelu nawigacji bocznej oraz mobilnej.</li>
                <li><strong>Kompleksowa Adaptacja Wszystkich Widoków:</strong> Kokpit (Dashboard), Listy Zadań, Tablice Kanban, Projekty, Inkubator, Miejsca, Nawyki, Notatki, Modale dialogowe oraz Graf Powiązań.</li>
                <li><strong>Dynamiczny Canvas Grafu:</strong> Graf 2D automatycznie wykrywa aktywny motyw i przełącza tło płótna, barwy powiązań i etykiety dla maksymalnej czytelności.</li>
                <li><strong>Anti-FOUC & Zapamiętywanie:</strong> Motyw jest odczytywany przed renderowaniem HTML, zapobiegając białemu/ciemnemu błyskowi przy przeładowaniu, z automatyczną synchronizacją do <code>localStorage</code> i <code>prefers-color-scheme</code>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.7.2 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.7.2</span> - Stabilizacja Stanu Przełączania List
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Natychmiastowe odpinanie list: Poprawiono błąd zachowywania starego przypisania do projektu przy nawigacji między różnymi listami bez projektu.</li>
            <li>Rozwiązanie błędu globalnego podpięcia: Usunięto problem, w którym odpięcie jednej listy sprawiało wrażenie przypisywania wszystkich list do projektów.</li>
          </ul>
        </div>

        {/* v0.7.1 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.7.1</span> - Poprawki List Zadań, Kaskadowe Odpinanie & Reaktywne Menu
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Natychmiastowe odpinanie list od projektów – w 100% reaktywne.</li>
            <li>Kaskadowa synchronizacja zadań w odpinanej liście.</li>
            <li>Naprawa zacinającego się menu przy użyciu <code>useSearchParams</code>.</li>
          </ul>
        </div>

        {/* v0.7.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.7.0</span> - Tablica Kanban z Własnymi Kolumnami & Przełącznik Widoków
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Własne kolumny Kanban z opcją tworzenia, edycji i oznaczania stanu ukończenia.</li>
            <li>Przeciąganie Drag & Drop oraz szybkie przesuwanie strzałkami na smartfonach.</li>
            <li>Przełącznik widoków (Lista vs Kanban) w Listach i Projektach z zapamiętywaniem stanu.</li>
          </ul>
        </div>

        {/* v0.6.8 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.6.8</span> - Dynamiczne Kategorie w Inkubatorze & Autouzupełnianie
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Dynamiczne wykrywanie i agregacja kategorii projektów.</li>
            <li>Szybkie pigułki wyboru i autouzupełnianie (<code>datalist</code>).</li>
            <li>Pasek zakładek i filtrowanie pomysłów w Inkubatorze.</li>
          </ul>
        </div>

        {/* v0.6.7 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.6.7</span> - Usuwanie z Inkubatora, Tworzenie Nawyków & Pełnoekranowy Graf
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Usuwanie Projektów z Inkubatora: Przycisk usuwania pomysłów z listy i modalu.</li>
            <li>Tworzenie i Zarządzanie Nawykami (/habits): Szybkie dodawanie i usuwanie nawyków.</li>
            <li>Pełnoekranowy Graf Relacji (/graph): Dynamiczne dopasowanie do 100% okna i przyciski sterowania zoomem.</li>
          </ul>
        </div>

        {/* v0.6.5 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.6.5</span> - Poprawki Egzekucji: Edycja Daty Zadań & Stabilizacja Bazy
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Pełna Edycja Daty Zadania: Panel wyboru terminu w modalu szczegółów zadania.</li>
            <li>Domyślne Trafianie do Inboxa: Zadania bez daty trafiają wyłącznie do Inboxa.</li>
            <li>Przepięcie Listy / Projektu: Możliwość zmiany przypisania zadania w oknie edycji.</li>
          </ul>
        </div>

        {/* v0.6.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.6.0</span> - Tworzenie List Zadań & Twardy Limit Projektów
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Autonomiczne Listy Zadań: Własne ikony i kolory, z opcją przypisania do projektu lub jako lista wolnostojąca.</li>
            <li>Twardy Limit 2 Aktywnych Projektów: Zabezpieczenie przed rozproszeniem uwagi (wymusza skupienie).</li>
          </ul>
        </div>

      </section>
    </main>
  );
}
