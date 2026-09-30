"use client";

import { useEffect, useState } from "react";
import {
  getSupabaseData,
  updateSupabaseData,
} from "../lib/supabase";

type Spot = {
  id: number;
  name: string;
  organizer: string;
  area: string;
  city: string;
  address: string;
  time: string;
  date: string;
  verified: boolean;
};

export default function AdminPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPendingSpots() {
      try {
        const data = await getSupabaseData(
          "annadanam_spots",
          "?verified=eq.false&order=created_at.desc"
        );

        setSpots(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadPendingSpots();
  }, []);

  return (
    <main style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Admin Verification</h1>
      <p>Pending Annadanam Spots</p>

      {loading && <p>Loading...</p>}

      {!loading && spots.length === 0 && (
        <p>No pending spots.</p>
      )}

      {spots.map((spot) => (
        <div
          key={spot.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "16px",
          }}
        >
          <h2>{spot.name}</h2>
          <p>Organizer: {spot.organizer}</p>
          <p>Area: {spot.area}</p>
          <p>City: {spot.city}</p>
          <p>Address: {spot.address}</p>
          <p>Date: {spot.date}</p>
          <p>Time: {spot.time}</p>

          <button
  onClick={async () => {
    try {
      await updateSupabaseData("annadanam_spots", spot.id, {
        verified: true,
      });

      setSpots((current) =>
        current.filter((item) => item.id !== spot.id)
      );
    } catch (error) {
      console.error(error);
      alert("Unable to approve this spot.");
    }
  }}
  style={{
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  }}
>
  Approve
</button>
        </div>
      ))}
    </main>
  );
}
