"use client";

import { useEffect, useState } from "react";
import {
  getSupabaseData,
  updateSupabaseData,
  signInWithPassword,
  deleteSupabaseData,
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
  const [loggedIn, setLoggedIn] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [accessToken, setAccessToken] = useState("");
const [loginError, setLoginError] = useState("");
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) return;
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
  }, [loggedIn]);
async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setLoginError("");

  try {
    const result = await signInWithPassword(email, password);

    setAccessToken(result.access_token);
    setLoggedIn(true);
  } catch (error) {
    console.error(error);
    setLoginError("Invalid email or password.");
  }
}
  
if (!loggedIn) {
  return (
    <main style={{ padding: "30px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Admin Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "12px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "12px" }}
        />

        {loginError && <p>{loginError}</p>}

        <button
  type="submit"
  style={{
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #2f2925",
    background: "#fff",
    color: "#2f2925",
    cursor: "pointer",
    transition: "all 0.15s ease",
  }}
  onMouseDown={(e) => {
    e.currentTarget.style.background = "#2f2925";
    e.currentTarget.style.color = "#fff";
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.color = "#2f2925";
  }}
>
  Login
</button>
      </form>
    </main>
  );
}

return (
     <main style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  }}
>
  <h1 style={{ margin: 0 }}>Admin Verification</h1>
</div>

<p>Pending Annadanam Spots</p>
       <button
  onClick={() => {
    setLoggedIn(false);
    setAccessToken("");
    setEmail("");
    setPassword("");
    setSpots([]);
  }}
  style={{
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #2f2925",
    background: "#fff",
    color: "#2f2925",
    cursor: "pointer",
    transition: "all 0.15s ease",
    marginBottom: "20px",
  }}
  onMouseDown={(e) => {
    e.currentTarget.style.background = "#2f2925";
    e.currentTarget.style.color = "#fff";
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.color = "#2f2925";
  }}
>
  Logout
</button>

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
}, accessToken);

      setSpots((current) =>
        current.filter((item) => item.id !== spot.id)
      );
    } catch (error) {
  console.error(error);
  alert(error instanceof Error ? error.message : "Unable to approve this spot.");
}
  }}
  style={{
  padding: "10px 24px",
  borderRadius: "8px",
  border: "1px solid #2f2925",
  background: "#fff",
  color: "#2f2925",
  cursor: "pointer",
  transition: "all 0.15s ease",
  marginBottom: "20px",
}}
>
  Approve
</button>
      <button
  onClick={async () => {
    try {
      await deleteSupabaseData(
        "annadanam_spots",
        spot.id,
        accessToken
      );

      setSpots((current) =>
        current.filter((item) => item.id !== spot.id)
      );
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to reject this spot."
      );
    }
  }}
  style={{
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #2f2925",
    background: "#fff",
    color: "#2f2925",
    cursor: "pointer",
    transition: "all 0.15s ease",
    marginLeft: "10px",
    marginBottom: "20px",
  }}
  onMouseDown={(e) => {
    e.currentTarget.style.background = "#2f2925";
    e.currentTarget.style.color = "#fff";
  }}
  onMouseUp={(e) => {
    e.currentTarget.style.background = "#fff";
    e.currentTarget.style.color = "#2f2925";
  }}
>
  Reject
</button>
        </div>
      ))}
    </main>
  );
}
