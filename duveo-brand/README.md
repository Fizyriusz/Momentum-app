# Duveo — zasoby marki

Wszystko wygenerowane z jednego wzorca wektorowego. Sygnet: litera **D** ze strzałką wystrzeliwującą z barku łuku w górę i w prawo.

**Kolory:** tło `#09090B` · litera `#FAFAFA` · strzałka `#C084FC` · akcent podstawowy `#9333EA`

---

## `svg/` — mastery

| Plik | Zastosowanie |
| --- | --- |
| `duveo-mark.svg` | sygnet na przezroczystym tle, do wszystkiego |
| `duveo-mark-dark-bg.svg` | sygnet na ciemnym kaflu z zaokrągleniem |
| `duveo-mark-mono-black.svg` | jednokolorowy, na jasne tła |
| `duveo-mark-mono-white.svg` | jednokolorowy, na zdjęcia i nadruki |
| `duveo-logo-horizontal.svg` | lockup poziomy na ciemne tło |
| `duveo-logo-horizontal-light.svg` | lockup poziomy na jasne tło |
| `favicon.svg` | favicon wektorowy |

> **Lockupy zawierają żywy tekst w kroju Archivo.** Zanim wyślesz je komuś na zewnątrz, otwórz w Figmie lub Illustratorze i zamień tekst na krzywe — inaczej u kogoś bez Archivo napis podmieni się na inny krój.

## `favicon/`

`favicon.ico` zawiera 16, 32, 48 i 64 px w jednym pliku. Do `<head>`:

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
```

## `pwa/`

```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
  { "src": "/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
  { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

Wersje `maskable` mają celowo mniejszy rysunek — Android przycina ikonę do dowolnego kształtu i obcięłoby strzałkę.

## `android/`

Pliki `ic_launcher-*` i `ic_launcher_round-*` idą do `android/app/src/main/res/mipmap-{dpi}/` pod nazwami `ic_launcher.png` i `ic_launcher_round.png` (bez sufiksu z dpi i rozmiarem).

Dla ikony adaptacyjnej: `ic_launcher_foreground-432.png` → `mipmap-xxxhdpi/ic_launcher_foreground.png`, a `ic_launcher_background.xml` → `res/drawable/`.

`play-store-512.png` wgrywasz w Play Console jako ikonę aplikacji.

## `ios/`

Na razie nieużywane (brak wersji iOS), ale `apple-touch-icon-180.png` przyda się dla PWA dodanej do ekranu głównego na iPhonie.

## `social/`

`og-image-1200x630.png` do `<meta property="og:image">` i `<meta name="twitter:image">`. Źródłowy SVG dołączony, gdybyś chciał zmienić hasło.

## `splash/`

`splash-2732.png` to uniwersalny kwadrat dla Capacitora — plugin sam przytnie go do proporcji każdego ekranu. Kolor tła splasha ustaw na `#09090B`, żeby nie było widać szwu.

---

## Regeneracja

Jeśli będziesz chciał zmienić kolory lub proporcje, wszystko powstaje z jednego skryptu — geometria siedzi w stałych `D_PATH`, `ARR_MAIN` i `ARR_HEAD` na górze pliku. Zmiana koloru w jednym miejscu przebudowuje cały zestaw.
