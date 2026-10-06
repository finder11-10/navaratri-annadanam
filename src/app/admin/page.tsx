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
  const [verifiedSpots, setVerifiedSpots] = useState<Spot[]>([]);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPendingSpots() {
  try {
    setLoading(true);

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

async function loadVerifiedSpots() {
  try {
    const data = await getSupabaseData(
      "annadanam_spots",
      "?verified=eq.true&order=created_at.desc"
    );

    setVerifiedSpots(data);
  } catch (error) {
    console.error(error);
  }
}
async function saveEditedSpot() {
  if (!editingSpot) return;

  try {
    await updateSupabaseData(
      "annadanam_spots",
      editingSpot.id,
      {
        name: editingSpot.name,
        organizer: editingSpot.organizer,
        area: editingSpot.area,
        city: editingSpot.city,
        address: editingSpot.address,
        date: editingSpot.date,
        time: editingSpot.time,
      },
      accessToken
    );

    setSpots((current) =>
      current.map((spot) =>
        spot.id === editingSpot.id ? editingSpot : spot
      )
    );

    setEditingSpot(null);
  } catch (error) {
    console.error(error);
    alert(
      error instanceof Error
        ? error.message
        : "Unable to save changes."
    );
  }
}
useEffect(() => {
  if (!loggedIn) return;

  loadPendingSpots();
  loadVerifiedSpots();
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

<p>Pending Annadanam Spots ({spots.length})</p>
       <button
  onClick={loadPendingSpots}
  style={{
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #2f2925",
    background: "#fff",
    color: "#2f2925",
    cursor: "pointer",
    marginBottom: "20px",
  }}
>
  Refresh
</button>

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
  onClick={() => setEditingSpot(spot)}
  style={{
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #2f2925",
    background: "#fff",
    color: "#2f2925",
    cursor: "pointer",
    marginRight: "10px",
    marginBottom: "20px",
  }}
>
  Edit
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
       <div style={{ marginTop: "40px" }}>
  <h2>Verified Spots ({verifiedSpots.length})</h2>

  {verifiedSpots.length === 0 ? (
    <p>No verified spots.</p>
  ) : (
    verifiedSpots.map((spot) => (
      <div
        key={spot.id}
        style={{
          border: "1px solid #cfe3d3",
          borderRadius: "12px",
          padding: "20px",
          marginTop: "16px",
          background: "#f8fff9",
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
              await deleteSupabaseData(
                "annadanam_spots",
                spot.id,
                accessToken
              );

              setVerifiedSpots((current) =>
                current.filter((item) => item.id !== spot.id)
              );
            } catch (error) {
              console.error(error);
              alert("Unable to delete this verified spot.");
            }
          }}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "1px solid #c62828",
            background: "#fff",
            color: "#c62828",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    ))
  )}
</div>
       {editingSpot && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      background: "#fff",
    }}
  >
    <h2>Edit Spot</h2>

    <input
      value={editingSpot.name}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, name: e.target.value })
      }
      placeholder="Annadanam Name"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <input
      value={editingSpot.organizer}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, organizer: e.target.value })
      }
      placeholder="Organizer"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <input
      value={editingSpot.area}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, area: e.target.value })
      }
      placeholder="Area"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <input
      value={editingSpot.city}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, city: e.target.value })
      }
      placeholder="City"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <input
      value={editingSpot.address}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, address: e.target.value })
      }
      placeholder="Address"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <input
      value={editingSpot.date}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, date: e.target.value })
      }
      placeholder="Date"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <input
      value={editingSpot.time}
      onChange={(e) =>
        setEditingSpot({ ...editingSpot, time: e.target.value })
      }
      placeholder="Time"
      style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
    />

    <button
      onClick={saveEditedSpot}
      style={{
        padding: "10px 24px",
        borderRadius: "8px",
        border: "1px solid #2f2925",
        background: "#2f2925",
        color: "#fff",
        cursor: "pointer",
        marginRight: "10px",
      }}
    >
      Save Changes
    </button>

    <button
      onClick={() => setEditingSpot(null)}
      style={{
        padding: "10px 24px",
        borderRadius: "8px",
        border: "1px solid #2f2925",
        background: "#fff",
        color: "#2f2925",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>
  </div>
)}
    </main>
  );
}
