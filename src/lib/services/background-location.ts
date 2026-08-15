import { BackgroundGeolocation } from '@capgo/background-geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Place } from './places';

export async function initGeofencing() {
  try {
    // Żądamy uprawnień do powiadomień
    await LocalNotifications.requestPermissions();

    // Konfiguracja geofencingu natywnego
    await BackgroundGeolocation.setupGeofencing({
      requestPermissions: true,
      backgroundLocation: true,
      notifyOnEntry: true,
      notifyOnExit: false
    });

    // Nasłuchiwanie na wejście w strefę
    BackgroundGeolocation.addListener("geofenceTransition", async (event) => {
      if (event.transition === 'enter') {
        // Wysłanie lokalnego powiadomienia
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Jesteś w pobliżu przypisanego miejsca!",
              body: `Wejście w strefę: ${event.identifier}. Sprawdź swoje zadania.`,
              id: new Date().getTime(),
              schedule: { at: new Date(Date.now() + 1000) }
            }
          ]
        });
      }
    });

  } catch (error) {
    console.error("Błąd inicjalizacji Geofencingu:", error);
  }
}

export async function syncGeofences(places: Place[]) {
  try {
    // Czyścimy obecne strefy
    await BackgroundGeolocation.removeAllGeofences();

    // Rejestrujemy nowe strefy na podstawie aktywnych miejsc użytkownika
    for (const place of places) {
      await BackgroundGeolocation.addGeofence({
        identifier: place.name, // użyjemy nazwy miejsca jako identyfikatora
        latitude: place.lat,
        longitude: place.lng,
        radius: place.radiusMeters || 500,
        notifyOnEntry: true
      });
    }
  } catch (error) {
    console.error("Błąd synchronizacji Geofencingu:", error);
  }
}
