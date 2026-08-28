import { Sun, Moon, Sparkles, Monitor, Layers, CheckCircle2, ShieldCheck, MapPin, ListTodo, Calendar, Network, Trash2, Droplet, Tag, LayoutGrid, Timer, Flame, Cloud, Rocket } from "lucide-react";
import { DuveoLogo } from "@/components/duveo-logo";

export default function ChangelogPage() {
  return (
    <main className="min-h-full px-4 py-8 pb-32 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">Changelog</h1>
        <p className="text-zinc-500 text-sm font-medium mt-0.5">Historia rozwoju i aktualizacji systemu Duveo.</p>
      </header>

      <section className="space-y-8">
        
        {/* v0.9.0 - AKTUALNA WERSJA */}
        <div className="bg-white dark:bg-zinc-900/40 border border-purple-500/40 dark:border-purple-500/30 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-md dark:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <DuveoLogo className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">v0.9.0</span> - Rebranding Duveo (duveo.app), Nowy Sygnet & Natywny Geofencing
                </h2>
                <p className="text-xs text-zinc-500 font-medium">Oficjalna zmiana marki, nowy identyfikator aplikacji i pancerny silnik powiadomień GPS</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl border border-purple-500/30">
              Aktualna wersja
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Główne Zmiany w v0.9.0</h3>
              <ul className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm list-disc list-inside">
                <li><strong>Oficjalny Rebranding na Duveo:</strong> Zmiana nazwy aplikacji w całym ekosystemie, domena docelowa <code>duveo.app</code> oraz identyfikator paczki mobilnej <code>app.duveo.mobile</code>.</li>
                <li><strong>Nowy Sygnet Wektorowy Duveo:</strong> Autorski komponent SVG (litera D w <code>currentColor</code> ze stałą neonowo-fioletową strzałką <code>#C084FC</code>) zastępujący dotychczasowe generyczne ikony.</li>
                <li><strong>Komplet Nowych Zasobów Graficznych:</strong> Nowe ikony aplikacji na Androida i iOS, ikona adaptacyjna z ciemnym tłem <code>#09090B</code>, splash screen 2732px, favikony oraz PWA z obsługą trybu maskable.</li>
                <li><strong>Natywny Silnik Geofencingu w Androidzie:</strong> Wdrożenie natywnej klasy <code>DuveoApp</code> i odbiornika <code>NativeGeofenceReceiver</code> w Java/Kotlin wyzwalających powiadomienia o wejściu w strefę GPS bezpośrednio na zablokowanym ekranie bez zależności od uśpionego JavaScriptu.</li>
                <li><strong>Wsteczna Kompatybilność:</strong> Bezpieczna migracja motywów i stanów stoperów z zachowaniem danych użytkowników (fallbacki <code>localStorage</code>).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* v0.8.5 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.8.5</span> - Nowy Silnik Wizualny Grafu 2D (Obsidian Dark-Tech) & System Filtrów
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li><strong>Estetyka Obsidian Dark-Tech:</strong> Neonowe kule z poświatą (Aura Glow) i minimalistyczną typografią monospace (<code>Geist Mono</code>) pod węzłami.</li>
            <li><strong>Hierarchia Kolorów:</strong> Fiolet dla projektów, złoto dla inkubatora, indygo dla list, szarość dla zadań otwartych, błękit dla notatek, turkus dla miejsc i róż dla tagów.</li>
            <li><strong>Pływający Pasek Filtrów:</strong> Włączanie i wyłączanie widoczności dowolnej kategorii elementów w czasie rzeczywistym z licznikami obiektów.</li>
            <li><strong>Dynamiczna Interakcja:</strong> Płynne przybliżenie (zoom 2.8) po kliknięciu w węzeł oraz centrowanie całości po kliknięciu w tło.</li>
          </ul>
        </div>

        {/* v0.8.1 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.8.1</span> - Stabilizacja Grafu 2D & Naprawa Notatek
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Filtr bezpiecznych połączeń D3 zapobiegający awarii przy usuniętych listach.</li>
            <li>Optymalizacja zapytań notatek bez konieczności tworzenia indeksu w Firestore.</li>
            <li>Poprawka ikony w manifest.json.</li>
          </ul>
        </div>

        {/* v0.8.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.8.0</span> - Własne Pinezki, Wyszukiwarka Adresów & Inteligentny Geofencing
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Interaktywna mapa Leaflet ze swobodnym stawianiem pinezek i Toggle Focus (FlyTo ➔ FlyFrom).</li>
            <li>Wyszukiwarka adresów na żywo (Nominatim Geocoding) z automatycznym centrowaniem mapy.</li>
            <li>Task-Driven Geofencing z limitem 15 stref w natywnym GPS telefonu.</li>
          </ul>
        </div>

        {/* v0.7.7 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.7.7</span> - Zaznaczanie Wielu Zadań & Akcje Masowe (Bulk Actions)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Tryb zaznaczania wielu zadań (Multi-Select) z licznikiem i opcją „Zaznacz wszystkie”.</li>
            <li>Pływający dock z masową zmianą terminu, przenoszeniem do listy/projektu, tagowaniem, miejscami i usuwaniem.</li>
            <li>Atomiczne operacje Firestore w pojedynczej transakcji <code>writeBatch</code>.</li>
          </ul>
        </div>

        {/* v0.7.6 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.7.6</span> - Inteligentny FAB, Pełne Zawijanie Zadań & Mobilny Przegląd
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Pełne wyświetlanie i naturalne zawijanie długich tytułów zadań (brak ucinania tekstu).</li>
            <li>Inteligentny przycisk FAB automatycznie wykrywający kontekst bieżącego widoku (Dzisiaj, Jutro, Lista, Projekt, Notatki, Inkubator).</li>
            <li>Dodanie pozycji „Przegląd” na szczycie menu mobilnego.</li>
          </ul>
        </div>

        {/* v0.7.5 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.7.5</span> - Tryb Jasny i Ciemny (Light & Dark Mode)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Trójpozycyjny przełącznik motywów: Jasny (Light), Ciemny (Dark) oraz Automatyczny (System).</li>
            <li>Kompleksowa adaptacja wszystkich widoków, kart, modali, Kanbanu i nawyków.</li>
            <li>Dynamiczny Canvas grafu 2D reagujący na aktywny motyw.</li>
          </ul>
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

        {/* v0.5.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.5.0</span> - Inkubator Pomysłów & Przygotowanie Projektów
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Inkubator Pomysłów (/incubator): Dedykowane miejsce na luźne koncepcje i plany bez zaśmiecania aktywnych celów.</li>
            <li>Karty Przygotowania: Określanie celu nadrzędnego, budżetu czasowego i kryteriów sukcesu przed aktywacją.</li>
            <li>Jednoklikowy transfer pomysłu do aktywnych projektów głównych.</li>
          </ul>
        </div>

        {/* v0.4.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.4.0</span> - System Nawyków & Notatki Globalne Markdown
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Śledzenie Nawyków (/habits): Codzienna lista powtarzalnych czynności z automatycznym resetem o północy.</li>
            <li>Globalny Notatnik (/notes): Szybki edytor notatek ze wsparciem Markdown do zapisywania przemyśleń i linków.</li>
            <li>System tagowania notatek i powiązań z zadaniami.</li>
          </ul>
        </div>

        {/* v0.3.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.3.0</span> - Stoper Pomodoro & Wbudowany Focus Timer (TimeLogs)
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Wbudowany stoper skupienia w projektach z deklaracją planowanego czasu pracy.</li>
            <li>Automatyczne rejestrowanie logów czasowych (TimeLogs) i pełna historia sesji pod przyciskiem Historia.</li>
            <li>Pływający mini-timer (Mini-Timer) zachowujący stan odliczania w tle podczas nawigacji po aplikacji.</li>
          </ul>
        </div>

        {/* v0.2.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.2.0</span> - Migracja na Cloud Firestore & Autoryzacja Google
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Przejście z lokalnej bazy SQLite na bezpieczną chmurę Google Cloud Firestore z synchronizacją offline.</li>
            <li>Integracja Firebase Authentication: Logowanie za pomocą konta Google na Web i natywnym Androidzie.</li>
            <li>Izolacja danych użytkowników w strukturze <code>/users/{'{uid}'}/...</code>.</li>
          </ul>
        </div>

        {/* v0.1.0 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400">v0.1.0</span> - Prototyp MVP & Architektura Flat UI Mobile-First
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-2 ml-2">
            <li>Płaski interfejs użytkownika (Flat UI) zoptymalizowany pod urządzenia mobilne i responsywność PWA.</li>
            <li>Karty zadań (Dzisiaj, Jutro, Nadchodzące, Inbox) z szybkimi akcjami.</li>
            <li>Podstawowa struktura projektów i zarządzania czasem.</li>
          </ul>
        </div>

      </section>
    </main>
  );
}
