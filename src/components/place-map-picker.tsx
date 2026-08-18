"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PlaceMapPickerProps {
  lat: number;
  lng: number;
  radiusMeters: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function PlaceMapPicker({
  lat,
  lng,
  radiusMeters,
  onChange,
  className = "w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
}: PlaceMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Inicjalizacja Mapy
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Tworzymy niestandardową ikonę SVG pinezki
    const customIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="
          width: 32px; 
          height: 32px; 
          background: #9333ea; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
          border: 2px solid #ffffff;
          cursor: grab;
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

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);

    const circle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: "#9333ea",
      fillColor: "#a855f7",
      fillOpacity: 0.22,
      weight: 2
    }).addTo(map);

    // Nasłuchiwanie na przeciąganie pinezki
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      circle.setLatLng(pos);
      onChange(pos.lat, pos.lng);
    });

    // Nasłuchiwanie na kliknięcie w dowolne miejsce mapy
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // Poprawka renderowania kafelków po zamontowaniu modala
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Aktualizacja pozycji gdy zmienią się koordynaty z zewnątrz (np. wyszukiwarka)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        circleRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 14);
      }
    }
  }, [lat, lng]);

  // Aktualizacja promienia okręgu
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  return (
    <div 
      ref={mapContainerRef} 
      className={className} 
      style={{ 
        height: "260px", 
        minHeight: "260px", 
        width: "100%", 
        position: "relative",
        zIndex: 1 
      }} 
    />
  );
}
