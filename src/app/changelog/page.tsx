import { Layers, CheckCircle2, ShieldCheck, MapPin, ListTodo } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Momentum.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.6.0 - AKTUALNA WERSJA */}
        <div className="bg-zinc-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
              <span className="text-purple-400">v0.6.0</span> - Tworzenie List Zadań & Twardy Limit Projektów
            </h2>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Zarządzanie Listami Zadań (Task Lists)</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Tworzenie i Organizacja List:</strong> Dodano dedykowaną sekcję <em>Listy</em> w pasku bocznym z przyciskiem <code>+</code> do tworzenia nowych list. Każda lista posiada konfigurowalną nazwę, ikonę, kolor akcentu oraz opcjonalne przypisanie do projektu.</li>
                <li><strong>Dynamiczne Liczniki Zadań:</strong> Pasek boczny wyświetla w czasie rzeczywistym liczbę otwartych zadań dla każdej listy oraz dla widoków <em>Dzisiaj</em>, <em>7 Dni</em> i <em>Inbox</em>.</li>
                <li><strong>Podstrona Szczegółów Listy (/lists?id=...):</strong> Dedykowany widok dla każdej listy z formularzem szybkiego dodawania, podziałem na zadania aktywne/ukończone oraz modalem ustawień (edycja, archiwizacja, usuwanie).</li>
                <li><strong>Listy w Projektach:</strong> Możliwość bezpośredniego dodawania i zarządzania listami zadań z poziomu karty projektu.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Egzekucja & Twardy Limit Skupienia</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Twardy Limit 2 Aktywnych Projektów:</strong> Wymuszenie skupienia – zablokowano możliwość posiadania więcej niż 2 aktywnych projektów jednocześnie. Próba aktywacji kolejnego projektu w Inkubatorze wyświetla modal z blokadą i instrukcją zwolnienia slotu.</li>
                <li><strong>Stan PAUSED (Wstrzymany):</strong> Dodano trzeci stan projektu obok <code>INBOX</code> i <code>ACTIVE</code>. Wstrzymane projekty nie wliczają się do limitu.</li>
                <li><strong>Cofanie do Inkubatora:</strong> Wprowadzono akcję przenoszenia projektów z powrotem do Inkubatora (<code>INBOX</code>).</li>
                <li><strong>Poprawka Inkubatora:</strong> Naprawiono czyszczenie pola formularza – po zatwierdzeniu wpisany tekst znika natychmiast.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.5.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.5.0</span> - De-gamifikacja: Surowy System Egzekucji
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong>Usunięcie Sekcji Nagród:</strong> Całkowicie usunięto komponent RewardSection z Dashboardu oraz warunki odblokowywania nagród.</li>
            <li><strong>Nawyki bez Serii i Kar:</strong> Usunięto liczniki ciągłości (streak), medale i komunikaty o przerywaniu serii. Zachowano czystą 7-dniową historię.</li>
            <li><strong>Czyste Słownictwo:</strong> Usunięto terminologię RPG (questy, skille, zbrojownia, XP, odznaki).</li>
            <li><strong>Refaktor Modelu Danych:</strong> Kolekcja <code>skills</code> ➔ <code>projects</code>, podlisty ➔ <code>taskLists</code>.</li>
            <li><strong>Unifikacja ścieżki /projects:</strong> Połączono widok ogólny ze szczegółami projektu i wygaszono <code>/skill</code>.</li>
          </ul>
        </div>

        {/* v0.4.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.4.0</span> - Geofencing w Tle, Miejsca & Natywna Mobilność
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Moduł Miejsc (/places):</strong> Zarządzanie punktami docelowymi oraz miastami z offline bazą miast Polski (<code>cities.json</code>).</li>
            <li><strong className="text-zinc-300">Inteligentny Baner Zbliżeniowy:</strong> Automatyczne wykrywanie obecności w zapisanych strefach i prezentacja lokalnych zadań.</li>
            <li><strong className="text-zinc-300">Natywny Geofencing w Tle:</strong> Integracja wtyczek Capacitora do powiadomień Push na ekranie blokady smartfona.</li>
            <li><strong className="text-zinc-300">Kreator Zgód (PermissionsOnboarding):</strong> Przewodnik konfiguracji uprawnień lokalizacji i optymalizacji baterii.</li>
            <li><strong className="text-zinc-300">Natywne Logowanie Google:</strong> Wdrożono bibliotekę <code>@capacitor-firebase/authentication</code>.</li>
            <li><strong className="text-zinc-300">Multi-Tenant:</strong> Pełna izolacja danych użytkowników w Firestore (<code>{"users/{uid}/..."}</code>).</li>
          </ul>
        </div>

        {/* v0.3.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.3.0</span> - System Notatek & Przebudowa Inkubatora
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Globalne Notatki:</strong> Dodano zakładkę "Notatki" na pasku bocznym do zapisywania wolnych myśli w Markdownie.</li>
            <li><strong className="text-zinc-300">Notatki w Projektach:</strong> Wbudowany menedżer notatek w każdym projekcie.</li>
            <li><strong className="text-zinc-300">Przygotowanie w Inkubatorze:</strong> Edytor celu, budżetu i notatek przed aktywacją.</li>
          </ul>
        </div>

        {/* v0.2.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.2.0</span> - Przebudowa Projektów (Flat UI & Historia)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Flat UI w Projektach:</strong> Zadania i listy bezpośrednio na stronie projektu.</li>
            <li><strong className="text-zinc-300">Historia Sesji:</strong> Model TimeLog rejestrujący sesje skupienia.</li>
          </ul>
        </div>

        {/* v0.1.0 */}
        <div className="space-y-4 opacity-70">
          <h2 className="text-lg font-bold text-zinc-400 flex items-center gap-2">
            <span className="text-zinc-500">v0.1.0</span> - Inicjalne wydanie Momentum (Beta)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1 ml-2">
            <li>Uruchomienie rdzenia aplikacji, systemu zadań z widokami czasowymi oraz stopera.</li>
          </ul>
        </div>

      </section>
    </main>
  );
}
