import { FileText } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia zmian i nowości w Momentum.</p>
      </header>

      <section className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.3.0</span> - System Notatek & Przebudowa Inkubatora
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Globalne Notatki:</strong> Dodano zakładkę "Notatki" na pasku bocznym (w nowej sekcji System) do zapisywania wolnych myśli. Oparto je o pełnoprawny Markdown.</li>
            <li><strong className="text-zinc-300">Notatki w Projektach:</strong> Każdy projekt otrzymał wbudowany menedżer notatek, wyświetlany tuż nad listami zadań. Notatki zapisywane są z odpowiednimi powiązaniami.</li>
            <li><strong className="text-zinc-300">Przygotowanie w Inkubatorze:</strong> Przed aktywacją pomysłu z Inkubatora, kliknięcie "Przygotuj" otwiera pełny modal. Możesz uzupełnić cel nadrzędny, budżet czasu i luźny opis/notatki dla pomysłu w fazie koncepcyjnej.</li>
            <li><strong className="text-zinc-300">Budżet czasu (targetHours):</strong> Projekty mają teraz możliwość definiowania czasu (liczba godzin oraz okres), co pozwala na lepsze estymowanie. Formularz jest od razu widoczny w edytorze detali.</li>
            <li><strong className="text-zinc-300">Poprawki UI:</strong> Zwiększono marginesy w zakładkach zadań (eliminacja nakładania się na kartę) oraz zreorganizowano przyciski "Historia" i "Edytuj detale projektu", by były zawsze widoczne.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.2.0</span> - Potężna Przebudowa Projektów (Flat UI & Historia)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Całkowita przebudowa interfejsu Projektów:</strong> Usunięcie zagnieżdżonego modalu. Zadania wyświetlane są teraz bezpośrednio na stronie projektu (tzw. Flat UI).</li>
            <li><strong className="text-zinc-300">Historia Sesji:</strong> Wdrożono model TimeLog rejestrujący datę i czas trwania poszczególnych sesji skupienia (uruchamianie/zatrzymywanie stopera).</li>
            <li><strong className="text-zinc-300">Nowa Karta Projektu:</strong> Cel nadrzędny i opisy (Markdown) są teraz od razu widoczne na karcie dla lepszego kontekstu. Ikona "Historii" zastąpiła ikonę zadań.</li>
            <li><strong className="text-zinc-300">Reorganizacja Paska Bocznego (Sidebar):</strong> "Zarządzanie" zostało usunięte. Dodano dedykowaną sekcję "Projekty", w której generowane są skróty do aktywnych list zadań, a na jej dnie ulokowany został na stałe Inkubator.</li>
            <li><strong className="text-zinc-300">Rutyny:</strong> Utworzono osobną sekcję "Rutyny" z Nawykami na pasku bocznym dla większej czytelności.</li>
            <li><strong className="text-zinc-300">Szybki Start dla Pustych Projektów:</strong> Jeżeli projekt nie posiada jeszcze żadnych list zadań, użytkownik może utworzyć inicjalną "Główną Listę Zadań" jednym kliknięciem z poziomu strony Projektu.</li>
          </ul>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-zinc-100">v0.1.0 (Beta)</h2>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md">Ostatnia aktualizacja</span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Rebranding</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li>Zmiana nazwy aplikacji z <span className="line-through text-zinc-500">Quest Log</span> na <strong>Momentum</strong>!</li>
                <li>Zmieniono nazewnictwo na bardziej biznesowe (Skille -&gt; Aktywne Projekty, Zbrojownia -&gt; Zarządzanie).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Nowe Funkcje (Produktywność)</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li>Dodano nowy widok <strong>Inkubator</strong> dla luźnych pomysłów bez przypisanego czasu.</li>
                <li>Zaimplementowano <strong>Modal Szczegółów Zadania</strong> ze wsparciem notatek w <em>Markdown</em> oraz osadzaniem obrazków.</li>
                <li>Wprowadzono komponent szybkiego dodawania zadań (<strong>Quick Add Task</strong>) z możliwością łatwego wyboru daty ("Dzisiaj", "Jutro"). Komponent ten jest dostępny w projektach oraz inboxie.</li>
                <li>Dodano <strong>Pływający Przycisk (FAB)</strong> w prawym dolnym rogu ekranu, umożliwiający dodanie zadania z dowolnego miejsca w aplikacji.</li>
                <li>Przebudowano <strong>Centrum Dowodzenia Projektem</strong> (Szczegóły Projektu). Dodano możliwość edycji opisu i celu nadrzędnego (Goal) oraz przycisk <em>"Szybki start"</em> pozwalający jednym kliknięciem założyć nową listę zadań i od razu podpiąć pod nią zadania, bez opuszczania okna.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">UX / UI (Mobile & Desktop)</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li>Przeniesiono <strong>Inkubator</strong> do sekcji "Zarządzanie", oddzielając go od codziennych zakładek systemowych.</li>
                <li>Kliknięcie w logo na pasku bocznym przenosi teraz na Ekran Główny.</li>
                <li>Zoptymalizowano ułożenie na telefonach: hamburger menu znajduje się teraz po lewej stronie, zapewniając bardziej naturalne odczucia.</li>
                <li>Naprawiono problem z niedziałającym hamburger menu w przypadku połączeń z innej sieci (Tailscale HMR Fix).</li>
                <li>Zaktualizowano ikony w bocznym pasku nawigacyjnym.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Inżynieria</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li>Pełny refaktor typów TypeScript. Brak błędów w procesie kompilacji.</li>
                <li>Zoptymalizowano struktury bazy danych dla rozdzielenia zadań między statusami (INBOX / ACTIVE).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
