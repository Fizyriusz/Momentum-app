import { Layers, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Momentum.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.5.0 - AKTUALNA WERSJA */}
        <div className="bg-zinc-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
              <span className="text-purple-400">v0.5.0</span> - De-gamifikacja: Surowy System Egzekucji
            </h2>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Koniec Grywalizacji (Raw Execution)</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Usunięcie Sekcji Nagród:</strong> Całkowicie usunięto komponent RewardSection z Dashboardu oraz warunki odblokowywania nagród po zalogowaniu 60 minut lub 100% nawyków.</li>
                <li><strong>Nawyki bez Serii i Kar:</strong> Z modułu <em>Nawyki (/habits)</em> usunięto liczniki ciągłości (streak), medale i komunikaty o przerywaniu serii. Tygodniowa 7-dniowa siatka historii została zachowana jako obiektywny fakt historyczny.</li>
                <li><strong>Czyste Słownictwo:</strong> Usunięto z całego kodu, interfejsu i metadanych słownictwo RPG (questy, skille, zbrojownia, XP, odznaki, nagrody).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Przebudowa Architektury Danych</h3>
              <ul className="space-y-2 text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Model Głównych Projektów (skills ➔ projects):</strong> Dawna kolekcja <code>skills</code> została przekształcona w główne projekty <code>projects</code>, a podlisty w <code>taskLists</code>.</li>
                <li><strong>Unifikacja ścieżki /projects:</strong> Połączono widok ogólny projektów z widokiem pojedynczego projektu (<code>/projects?id=...</code>) i wygaszono dawną ścieżkę <code>/skill</code>.</li>
                <li><strong>Graf Relacji (/graph):</strong> Zaktualizowano węzły i powiązania w silniku Canvas 2D (Projekty, Podlisty zadań, Zadania, Notatki, Miejsca, Tagi).</li>
                <li><strong>Czysty Ekran Logowania:</strong> Zastąpiono dawne motywy RPG neutralnym interfejsem Momentum z ikonami warstw i bezpośrednim logowaniem Google.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.4.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.4.0</span> - Geofencing w Tle, Miejsca & Natywna Mobilność
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Moduł Miejsc (/places):</strong> Zarządzanie punktami docelowymi (klienci, biura, magazyny) oraz miastami z offline bazą miast Polski (<code>cities.json</code>).</li>
            <li><strong className="text-zinc-300">Inteligentny Baner Zbliżeniowy:</strong> Po wejściu na stronę główną GPS automatycznie oblicza odległość do zapisanych stref i wyświetla zadania przypisane do danej lokalizacji.</li>
            <li><strong className="text-zinc-300">Natywny Geofencing w Tle:</strong> Integracja wtyczek Capacitora do nasłuchiwania w tle i wyzwalania natywnych powiadomień Push na ekranie blokady smartfona.</li>
            <li><strong className="text-zinc-300">Kreator Zgód (PermissionsOnboarding):</strong> Interaktywny przewodnik konfiguracji uprawnień lokalizacji "Zawsze zezwalaj" oraz wyłączania optymalizacji baterii.</li>
            <li><strong className="text-zinc-300">Natywne Logowanie Google:</strong> Wdrożono bibliotekę <code>@capacitor-firebase/authentication</code>, która rozwiązuje problem zewnętrznej przeglądarki na Androidzie.</li>
            <li><strong className="text-zinc-300">Multi-Tenant i Bezpieczeństwo:</strong> Pełna izolacja danych użytkowników w Firestore (<code>{"users/{uid}/..."}</code>) z rygorystycznymi regułami bezpieczeństwa.</li>
          </ul>
        </div>

        {/* v0.3.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.3.0</span> - System Notatek & Przebudowa Inkubatora
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Globalne Notatki:</strong> Dodano zakładkę "Notatki" na pasku bocznym do zapisywania wolnych myśli w Markdownie.</li>
            <li><strong className="text-zinc-300">Notatki w Projektach:</strong> Każdy projekt otrzymał wbudowany menedżer notatek, wyświetlany tuż nad listami zadań.</li>
            <li><strong className="text-zinc-300">Przygotowanie w Inkubatorze:</strong> Przed aktywacją pomysłu z Inkubatora kliknięcie "Przygotuj" otwiera pełny edytor celu nadrzędnego, budżetu godzin i opisu.</li>
            <li><strong className="text-zinc-300">Budżet czasu (targetHours):</strong> Projekty zyskały możliwość precyzyjnego definiowania godzinowego budżetu w wybranym horyzoncie czasowym (Tydzień, Miesiąc, Kwartał, Rok).</li>
          </ul>
        </div>

        {/* v0.2.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-300 flex items-center gap-2">
            <span className="text-purple-400">v0.2.0</span> - Przebudowa Projektów (Flat UI & Historia)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 ml-2">
            <li><strong className="text-zinc-300">Flat UI w Projektach:</strong> Zadania i listy wyświetlane są bezpośrednio na stronie projektu bez zagnieżdżonych modali.</li>
            <li><strong className="text-zinc-300">Historia Sesji:</strong> Wdrożono model TimeLog rejestrujący datę i czas trwania poszczególnych sesji skupienia.</li>
            <li><strong className="text-zinc-300">Reorganizacja Nawigacji:</strong> Pasek boczny został podzielony na sekcje System, Rutyny oraz Projekty z przypiętym Inkubatorem.</li>
          </ul>
        </div>

        {/* v0.1.0 */}
        <div className="space-y-4 opacity-70">
          <h2 className="text-lg font-bold text-zinc-400 flex items-center gap-2">
            <span className="text-zinc-500">v0.1.0</span> - Inicjalne wydanie Momentum (Beta)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1 ml-2">
            <li>Uruchomienie rdzenia aplikacji, systemu zadań z widokami czasowymi (Dziś, Jutro, 7 Dni, Inbox) oraz stopera.</li>
          </ul>
        </div>

      </section>
    </main>
  );
}
