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

export type PlaceType = "CITY" | "POINT";

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  type: PlaceType;
  createdAt: any;
};

const getUserPlacesCol = () => collection(db, "users", auth.currentUser?.uid || "unauth", "places");
const getUserPlaceDoc = (id: string) => doc(db, "users", auth.currentUser?.uid || "unauth", "places", id);

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(getUserPlacesCol(), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
      setPlaces(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { places, loading };
}

export async function createPlace(name: string, lat: number, lng: number, radiusMeters: number = 500, type: PlaceType = "POINT") {
  if (!auth.currentUser) return;
  return addDoc(getUserPlacesCol(), {
    name,
    lat,
    lng,
    radiusMeters,
    type,
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

// Funkcja pomocnicza do liczenia odległości na mapie (wzór Haversine'a)
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Ziemia w metrach
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
