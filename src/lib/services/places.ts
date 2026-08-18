"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";

export type PlaceType = "CITY" | "POINT" | "CUSTOM";

export type Place = {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  type: PlaceType;
  icon?: string;
  createdAt: any;
};

export type GeocodingResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
};

const getUserPlacesCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "places");
const getUserPlaceDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "places", id);

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    const q = query(getUserPlacesCol(), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
      setPlaces(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  return { places, loading };
}

export async function createPlace(
  name: string, 
  lat: number, 
  lng: number, 
  radiusMeters: number = 500, 
  type: PlaceType = "CUSTOM",
  address?: string,
  icon?: string
) {
  if (!auth.currentUser) return;
  return addDoc(getUserPlacesCol(), {
    name: name.trim(),
    address: address?.trim() || null,
    lat,
    lng,
    radiusMeters: Number(radiusMeters) || 500,
    type,
    icon: icon || null,
    createdAt: serverTimestamp()
  });
}

export async function updatePlace(id: string, data: Partial<Place>) {
  if (!auth.currentUser) return;
  return updateDoc(getUserPlaceDoc(id), data);
}

export async function deletePlace(id: string) {
  if (!auth.currentUser) return;
  return deleteDoc(getUserPlaceDoc(id));
}

// Funkcja pomocnicza do geokodowania adresów (OpenStreetMap Nominatim)
export async function searchAddressNominatim(searchQuery: string): Promise<GeocodingResult[]> {
  const clean = searchQuery.trim();
  if (!clean || clean.length < 2) return [];
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&addressdetails=1&limit=5&countrycodes=pl,de,cz,sk,ua,gb,us`;
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "pl,en"
      }
    });
    if (!response.ok) return [];
    return (await response.json()) as GeocodingResult[];
  } catch (error) {
    console.error("Błąd podczas wyszukiwania adresu Nominatim:", error);
    return [];
  }
}

// Funkcja pomocnicza do liczenia odległości na mapie (wzór Haversine'a w metrach)
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Promień Ziemi w metrach
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // w metrach
}
