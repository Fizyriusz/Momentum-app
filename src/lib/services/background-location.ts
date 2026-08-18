import { Capacitor } from '@capacitor/core';
import { BackgroundGeolocation } from '@capgo/background-geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Place } from './places';
import { Task } from './tasks';

export const MAX_ACTIVE_GEOFENCES = 15;

export async function initGeofencing() {
  if (!Capacitor.isNativePlatform()) {
    // Na platformie Web (PC) geofencing natywny nie jest wspierany
    return;
  }

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
    console.warn("Geofencing natywny nie mógł zostać zainicjalizowany:", error);
  }
}

/**
 * Synchronizacja stref GPS według Reguły Aktywnych Zadań (Task-Driven Geofencing).
 * Do natywnego rejestru trafia maksymalnie 15 stref posiadających nieukończone zadania.
 */
export async function syncGeofences(places: Place[], tasks?: Task[]) {
  // Wybieramy miejsca, które posiadają przynajmniej jedno nieukończone zadanie
  let eligiblePlaces = places;
  if (tasks && tasks.length > 0) {
    eligiblePlaces = places.filter(place => 
      tasks.some(task => task.placeId === place.id && !task.isCompleted)
    );
  }

  // Bezpieczny limit maksymalnie 15 stref (gwarantuje bezawaryjność na iOS i Androidzie)
  const activePlaces = eligiblePlaces.slice(0, MAX_ACTIVE_GEOFENCES);

  if (!Capacitor.isNativePlatform()) {
    return activePlaces;
  }

  try {
    // Czyścimy obecne strefy
    await BackgroundGeolocation.removeAllGeofences();

    // Rejestrujemy aktywne strefy
    for (const place of activePlaces) {
      await BackgroundGeolocation.addGeofence({
        identifier: place.name,
        latitude: place.lat,
        longitude: place.lng,
        radius: place.radiusMeters || 500,
        notifyOnEntry: true
      });
    }

    return activePlaces;
  } catch (error) {
    console.error("Błąd synchronizacji Geofencingu:", error);
    return [];
  }
}
