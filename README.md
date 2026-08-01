# Momentum

Momentum to nowoczesny system egzekucji i zarządzania czasem (Personal Dashboard) zbudowany w architekturze PWA (Mobile-First). Został zaprojektowany jako narzędzie dla "hustlerów, twórców i przyszłych milionerów", którzy potrzebują płaskiego, błyskawicznego i w pełni skupionego na celu interfejsu (Flat UI).

## Tech Stack
* **Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS, shadcn/ui, wbudowany Dark Mode (`bg-zinc-950`)
* **Ikony:** lucide-react
* *(Planowane)* **Baza Danych:** Migracja na Firebase (Firestore Offline)
* *(Planowane)* **Mobile:** Capacitor (iOS/Android)

## Główne Funkcje

1. **Flat UI & Główne Projekty (Skills):**
   - Projekty wyświetlane w głównym oknie (bez zagnieżdżonych modali).
   - Definiowanie celów nadrzędnych i budżetów czasowych na tydzień/miesiąc.
   - Wbudowane notatki projektowe z obsługą Markdown.

2. **System Egzekucji i Stoper (Pomodoro):**
   - Wbudowany timer skupienia na każdym projekcie.
   - Możliwość zadeklarowania, ile czasu chcesz przeznaczyć, a stoper sam loguje historię (TimeLogs).
   - Pełna historia sesji z wizualnym podsumowaniem pod przyciskiem "Historia".

3. **Inkubator Pomysłów:**
   - Dedykowane miejsce na luźne, niezdefiniowane projekty.
   - Proces "Przygotowania" pomysłu (cel, budżet, opis) przed przeniesieniem go do aktywnych projektów.

4. **Nawyki i Rutyny w tle:**
   - Lista powtarzalnych czynności z możliwością odhaczania na dany dzień.
   - Automatyczny reset statusów o północy.

5. **Notatki Globalne:**
   - Podręczny notatnik wspierający Markdown do zapisywania szybkich myśli, linków i inspiracji.

## Zrzuty ekranu / Wygląd
Aplikacja została zaprojektowana w mrocznym, agresywnym i profesjonalnym klimacie. Dominuje ciemnoszary kolor (`zinc-950`), przeplatany fioletem dla głównych akcji, oraz złotym i niebieskim dla inkubatora/drobnych detali. Brak zaokrąglonych, "miękkich" przycisków na rzecz ostrych, biznesowych kart.

---

*(Repozytorium utworzone w fazie przejścia z lokalnej bazy SQLite na Firebase w architekturze PWA/Capacitor)*
