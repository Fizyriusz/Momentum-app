"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Place } from "@/lib/services/places";

interface PlacesOverviewMapProps {
  places: Place[];
  activePlaceIds: Set<string>;
  onSelectPlace?: (place: Place) => void;
  className?: string;
}

export default function PlacesOverviewMap({
  places,
  activePlaceIds,
  onSelectPlace,
  className = "w-full rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/60 shadow-xs"
}: PlacesOverviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const hasFittedBoundsRef = useRef<string>("");
  const focusedPlaceIdRef = useRef<string | null>(null);

  // Inicjalizacja instancji Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter: [number, number] = places.length > 0
      ? [places[0].lat, places[0].lng]
      : [52.2297, 21.0122];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: places.length > 0 ? 12 : 6,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 450);

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Rysowanie pinezek i obsługa FlyTo / FlyFrom (Toggle Focus)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    layerGroupRef.current.clearLayers();
    const bounds = L.latLngBounds([]);

    places.forEach((place) => {
      const isActive = activePlaceIds.has(place.id);
      const pinColor = isActive ? "#9333ea" : "#71717a";

      const icon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: ${pinColor}; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <div style="
              width: 10px; 
              height: 10px; 
              background: #ffffff; 
              border-radius: 50%; 
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([place.lat, place.lng], { icon });
      
      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #18181b; min-width: 180px; padding: 2px;">
          <div style="font-size: 14px; font-weight: 800; color: #18181b; margin-bottom: 2px;">${place.name}</div>
          ${place.address ? `<div style="color: #71717a; font-size: 11px; margin-bottom: 6px; line-height: 1.3;">${place.address}</div>` : ""}
          
          <div style="margin-bottom: 6px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-weight: 800; font-size: 10px; text-transform: uppercase; background: ${isActive ? '#f3e8ff' : '#f4f4f5'}; color: ${isActive ? '#7e22ce' : '#71717a'}; border: 1px solid ${isActive ? '#d8b4fe' : '#e4e4e7'};">
              ${isActive ? '🟢 Aktywny GPS' : '⚪ Czuwanie'}
            </span>
          </div>

          <div style="font-size: 11px; color: #52525b; border-top: 1px solid #f4f4f5; margin-top: 4px; padding-top: 4px;">
            Promień: <strong>${place.radiusMeters >= 1000 ? `${place.radiusMeters / 1000} km` : `${place.radiusMeters} m`}</strong>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        autoPan: false
      });

      // Obsługa kliknięcia: Toggle FlyTo (przybliżenie) / FlyFrom (oddalenie)
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);

        if (focusedPlaceIdRef.current === place.id) {
          // Drugie kliknięcie w ten sam punkt -> FlyFrom (płynne oddalenie do widoku ogólnego)
          focusedPlaceIdRef.current = null;
          marker.closePopup();

          if (places.length > 1 && bounds.isValid()) {
            map.flyToBounds(bounds, {
              padding: [50, 50],
              maxZoom: 14,
              duration: 0.6
            });
          } else if (places.length === 1) {
            map.flyTo([places[0].lat, places[0].lng], 13, { duration: 0.6 });
          }

          if (onSelectPlace) {
            onSelectPlace(place);
          }
        } else {
          // Pierwsze kliknięcie -> FlyTo (płynne przybliżenie i otwarcie dymka)
          focusedPlaceIdRef.current = place.id;
          map.flyTo([place.lat, place.lng], 15, {
            animate: true,
            duration: 0.6
          });
          marker.openPopup();

          if (onSelectPlace) {
            onSelectPlace(place);
          }
        }
      });

      const circle = L.circle([place.lat, place.lng], {
        radius: place.radiusMeters,
        color: pinColor,
        fillColor: pinColor,
        fillOpacity: isActive ? 0.22 : 0.08,
        weight: 2
      });

      layerGroupRef.current?.addLayer(marker);
      layerGroupRef.current?.addLayer(circle);
      bounds.extend([place.lat, place.lng]);
    });

    // Kliknięcie w wolną przestrzeń mapy również resetuje focus (FlyFrom)
    map.off("click");
    map.on("click", () => {
      if (focusedPlaceIdRef.current) {
        focusedPlaceIdRef.current = null;
        map.closePopup();
        if (places.length > 1 && bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14,
            duration: 0.6
          });
        }
      }
    });

    // Dopasuj widok do wszystkich punktów TYLKO RAZ przy inicjalizacji listy
    const placesSignature = places.map(p => p.id).sort().join(",");
    if (places.length > 1 && bounds.isValid() && hasFittedBoundsRef.current !== placesSignature) {
      hasFittedBoundsRef.current = placesSignature;
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (places.length === 1 && hasFittedBoundsRef.current !== placesSignature) {
      hasFittedBoundsRef.current = placesSignature;
      map.setView([places[0].lat, places[0].lng], 14);
    }
  }, [places, activePlaceIds, onSelectPlace]);

  return (
    <div 
      ref={mapContainerRef} 
      className={className} 
      style={{ 
        height: "340px", 
        minHeight: "340px", 
        width: "100%", 
        position: "relative",
        zIndex: 1 
      }} 
    />
  );
}
