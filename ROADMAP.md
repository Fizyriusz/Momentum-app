# 🗺️ Momentum (Quest Log) — Oficjalny Roadmap Projektu

Niniejszy dokument jest nadrzędnym planem rozwoju systemu **Momentum**, podzielonym na **Fazy** oraz zawarte w nich **Etapy**. Każdy etap realizowany jest w formule: **Plan ➔ Wdrożenie ➔ Weryfikacja (testy użytkownika) ➔ Commit / Release**.

---

## 📌 FAZA 1: UX & Codzienna Egzekucja (Szybkie i Praktyczne)
*Cel: Zapewnienie maksymalnej wygody, elastyczności pracy z zadaniami oraz czytelności interfejsu w każdych warunkach.*

- [x] **Etap 1.1: Widok Kanban vs Lista w Projektach i Listach Zadań** `[ZREALIZOWANE — v0.7.0 / v0.7.2]`
  - Przełącznik widoków `☰ Lista` / `▦ Kanban` w widokach list i projektów (z pamięcią wyboru w `localStorage`).
  - System w pełni konfigurowalnych kolumn Kanban (dodawanie, zmiana nazwy, usuwanie, oznaczanie kolumn kończących `isCompletedColumn`).
  - Przeciąganie Drag & Drop oraz szybkie sterowanie strzałkami na urządzeniach mobilnych.
  - Dynamiczna i kaskadowa synchronizacja zadań oraz stabilizacja stanu hooków po odpięciu od projektu.

- [x] **Etap 1.2: Przełącznik Trybu Jasnego / Ciemnego (Light & Dark Mode)** `[ZREALIZOWANE — v0.7.5]`
  - Trójpozycyjny przełącznik motywów w stopce paska bocznego oraz w menu mobilnym (`Jasny` / `Ciemny` / `Systemowy`).
  - Wdrożenie czystego, ultra-czytelnego motywu jasnego (*Zinc-50/White*, mocny kontrast tekstu *Zinc-900* pod słońce w terenie).
  - Zachowanie i dopracowanie motywu ciemnego (*Dark-Tech / Zinc-950* z fioletowymi akcentami).
  - Dynamiczny silnik Canvas 2D w Grafie Powiązań (`/graph`) z automatyczną zmianą tła i barw węzłów.
  - Anti-FOUC i trwałe zapamiętywanie wyboru użytkownika.

- [ ] **Etap 1.3: Własne Pinezki i Adresy na Mapie w Miejscach (`/places`)** `[NAJBLIŻSZY CEL]`
  - Wskazywanie dowolnych punktów na interaktywnej mapie (zamiast polegania wyłącznie na bazie miast).
  - Wpisywanie precyzyjnych adresów, automatyczne geokodowanie i ustawianie promienia geofencingu (np. biuro, magazyn, klient).

---

## 📌 FAZA 2: Planowanie Strategiczne & Rozwój
*Cel: Zarządzanie czasem w perspektywie długoterminowej oraz zintegrowane budowanie wiedzy.*

- [ ] **Etap 2.1: Zadania Okresowe, Pływające & Zarządzanie Zaległościami (Smart Overdue & Auto-Rollover)** `[DO ZROBIENIA]`
  - **Zaległe zadania w Dzisiaj (Smart Overdue):** Zadania z przeszłości automatycznie pojawiają się na szczycie widoku `Dzisiaj` z wyróżnioną etykietą opóźnienia (*„Wczoraj”*, *„3 dni temu”*) i szybkimi akcjami (*„Przełóż na dziś”*, *„Na jutro”*, *„Zdejmij termin do Inboxa”*).
  - **Zadania Pływające (Floating Tasks):** Możliwość zdefiniowania zadań do wykonania w horyzoncie tygodniowym bez sztywnej daty dziennej.
  - **Przeglądy Cykliczne (Review):** Mechanizm cyklicznych podsumowań (tygodniowych / kwartalnych).

- [ ] **Etap 2.2: Moduł Rozwoju & Czytania Książek zintegrowany ze Stoperem** `[DO ZROBIENIA]`
  - Śledzenie czytanych książek, stron i celów edukacyjnych.
  - Bezpośrednia integracja ze stoperem skupienia (MiniTimer) i logowaniem czasu rozwoju.

---

## 📌 FAZA 3: Zaawansowane Systemy Wizualne & AI
*Cel: Przekształcenie systemu w potężną przestrzeń myśli (Second Brain) oraz lokalnego asystenta decyzyjnego.*

- [ ] **Etap 3.1: Infinite Canvas / Obsidian-style Mind Map dla Zadań i Notatek (`/graph`)** `[DO ZROBIENIA]`
  - **Tryb 1 (Sieć Fizyczna):** Zachowanie obecnego grafu 2D ze sprężystą fizyką węzłów i dynamicznymi powiązaniami relacyjnymi.
  - **Tryb 2 (Infinite Canvas / Mind Mapa):** Nieskończone, czyste płótno z siatką (dot grid), stałe pozycje kart `(x, y)` zapisywane w chmurze, ręczne łączenie bloczków strzałkami z własnymi etykietami.

- [ ] **Etap 3.2: Lokalne Offline AI: Profil Decyzyjny & Wycena Opłacalności Projektów** `[DO ZROBIENIA]`
  - Wycena szans powodzenia i priorytetyzacja pomysłów w Inkubatorze.
  - Prywatny model działający lokalnie w urządzeniu, bez wysyłania wrażliwych danych poza system użytkownika.

---

*Ostatnia aktualizacja: 17 sierpnia 2026 r. (v0.7.5)*
