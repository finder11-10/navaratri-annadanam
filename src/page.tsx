"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  getSupabaseData,
  insertSupabaseData,
} from "./lib/supabase";

type Status = "Active Now" | "Upcoming" | "Ended";

type EventItem = {
  id: number;
  name: string;
  organizer: string;
  area: string;
  city: string;
  address: string;
  time: string;
  date: string;
  status: Status;
  distance: string;
  interested: number;
};

const initialEvents: EventItem[] = [
  {
    id: 1,
    name: "Durga Bhavi Navratri Annadanam",
    organizer: "Durga Bhavi Youth",
    area: "Kukatpally",
    city: "Hyderabad",
    address: "Durga Bhavi, Kukatpally, Hyderabad",
    time: "11:00 AM - 3:00 PM",
    date: "Today",
    status: "Active Now",
    distance: "2.1 km",
    interested: 128,
  },
  {
    id: 2,
    name: "Navratri Anna Seva",
    organizer: "Navratri Seva Committee",
    area: "Miyapur",
    city: "Hyderabad",
    address: "Miyapur Main Road, Hyderabad",
    time: "12:00 PM - 2:30 PM",
    date: "Today",
    status: "Active Now",
    distance: "4.5 km",
    interested: 94,
  },
  {
    id: 3,
    name: "Maa Durga Annadanam",
    organizer: "Maa Durga Seva Trust",
    area: "Chandanagar",
    city: "Hyderabad",
    address: "Chandanagar Community Hall, Hyderabad",
    time: "12:00 PM - 4:00 PM",
    date: "Tomorrow",
    status: "Upcoming",
    distance: "7.2 km",
    interested: 76,
  },
  {
    id: 4,
    name: "Navaratri Community Annadhanam",
    organizer: "Bachupally Youth",
    area: "Bachupally",
    city: "Hyderabad",
    address: "Bachupally Community Ground, Hyderabad",
    time: "11:30 AM - 3:30 PM",
    date: "Tomorrow",
    status: "Upcoming",
    distance: "9.4 km",
    interested: 61,
  },
];

function statusClass(status: Status) {
  if (status === "Active Now") return "active";
  if (status === "Upcoming") return "upcoming";
  return "ended";
}

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    organizer: "",
    area: "",
    city: "",
    address: "",
    time: "",
    date: "",
    });
    
    const [showMapPicker, setShowMapPicker] = useState(false);
const mapRef = useRef<HTMLDivElement | null>(null);
const mapInstanceRef = useRef<any>(null);
const markerRef = useRef<any>(null);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setForm((current) => ({
          ...current,
          address: `Current location: ${latitude}, ${longitude}`,
        }));

        setMessage("Current location captured successfully.");
      },
      () => {
        setMessage("Unable to get your location. Please allow location access.");
      }
    );
  }

  useEffect(() => {
  if (!showMapPicker || !mapRef.current) return;

  const loadMap = async () => {
    if (!(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

     const script = document.createElement("script");
script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
script.async = true;
script.onload = () => {
  setTimeout(() => initializeMap(), 100);
};
script.onerror = () => {
  setMessage("Unable to load the map. Please check your internet connection.");
};
document.body.appendChild(script);
    } else {
      initializeMap();
    }
  };

  const initializeMap = () => {
    const L = (window as any).L;

    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current).setView([17.4065, 78.4772], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = L.marker([lat, lng]).addTo(map);

      setForm((current) => ({
        ...current,
        address: `Selected location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      }));

      setShowMapPicker(false);
      setMessage("Location selected successfully.");
    });

    mapInstanceRef.current = map;
  };

  loadMap();

  return () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };
}, [showMapPicker]);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesFilter = filter === "All" || event.status === filter;
      const matchesSearch =
        !term ||
        event.name.toLowerCase().includes(term) ||
        event.organizer.toLowerCase().includes(term) ||
        event.area.toLowerCase().includes(term) ||
        event.city.toLowerCase().includes(term) ||
        event.address.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [events, search, filter]);

  function directions(address: string) {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function submitSpot(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const newEvent: EventItem = {
    id: Date.now(),
    name: form.name.trim(),
    organizer: form.organizer.trim() || "Community Organizer",
    area: form.area.trim(),
    city: form.city.trim() || "Hyderabad",
    address: form.address.trim(),
    time: form.time.trim() || "Time to be announced",
    date: form.date.trim() || "Date to be announced",
    status: "Upcoming",
    distance: "—",
    interested: 0,
  };

  if (!newEvent.name || !newEvent.area || !newEvent.address) {
    setMessage("Please fill in the event name, area and address.");
    return;
  }

  try {
    const inserted = await insertSupabaseData("annadanam_spots", {
      name: newEvent.name,
      organizer: newEvent.organizer,
      area: newEvent.area,
      city: newEvent.city,
      address: newEvent.address,
      time: newEvent.time,
      date: newEvent.date,
      status: newEvent.status,
      distance: newEvent.distance,
      interested: newEvent.interested,
    });

    const savedEvent: EventItem = inserted[0] || newEvent;

    setEvents((current) => [savedEvent, ...current]);

    setForm({
      name: "",
      organizer: "",
      area: "",
      city: "Hyderabad",
      address: "",
      time: "",
      date: "",
    });         

    setShowForm(false);
    setMessage("Spot submitted successfully and saved to Supabase.");
    } catch (error) {
    console.error(error);
    setMessage("Unable to save the spot. Please try again.");
  }
}

return (
    <main className="page">
      <section className="hero">
        <div className="heroInner">
          <div className="badge">🙏 Navaratri Seva</div>
          <h1>Navaratri Annadanam Finder</h1>
          <p className="heroText">
            Find nearby Annadanam and Anna Seva spots during Navaratri.
            Share a spot so devotees can find food and service easily.
          </p>

          <div className="searchBox">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search area, location or Annadanam..."
              aria-label="Search Annadanam"
            />
            {search && (
              <button
                className="clearButton"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="content">
        <div className="toolbar">
          <div>
            <h2>Annadanam Spots</h2>
            <p>{filteredEvents.length} spots found</p>
          </div>

          <button className="primaryButton" onClick={() => setShowForm(true)}>
            + Add Spot
          </button>
        </div>

        <div className="filters" role="group" aria-label="Filter spots">
          {(["All", "Active Now", "Upcoming", "Ended"] as const).map(
            (option) => (
              <button
                key={option}
                className={filter === option ? "filter selected" : "filter"}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            )
          )}
        </div>

        {message && (
          <div className="notice">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="empty">
            <div className="emptyIcon">🍚</div>
            <h3>No Annadanam spots found</h3>
            <p>Try another area or search term.</p>
            <button
              className="primaryButton"
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
            >
              Show all spots
            </button>
          </div>
        ) : (
          <div className="cards">
            {filteredEvents.map((event) => (
              <article className="card" key={event.id}>
                <div className="cardTop">
                  <div>
                    <span className={`status ${statusClass(event.status)}`}>
                      {event.status}
                    </span>
                    <h3>{event.name}</h3>
                    <p className="organizer">{event.organizer}</p>
                  </div>
                  <div className="distance">{event.distance}</div>
                </div>

                <div className="details">
                  <div>
                    <span className="detailIcon">📍</span>
                    <span>
                      <b>{event.area}</b>, {event.city}
                      <small>{event.address}</small>
                    </span>
                  </div>
                  <div>
                    <span className="detailIcon">🕐</span>
                    <span>
                      <b>{event.date}</b>
                      <small>{event.time}</small>
                    </span>
                  </div>
                </div>

                <div className="cardBottom">
                  <span className="interested">
                    ❤️ {event.interested} interested
                  </span>
                  <button
                    className="mapButton"
                    onClick={() => directions(event.address)}
                  >
                    Get Directions
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="how">
          <div>
            <span className="step">1</span>
            <h3>Find a spot</h3>
            <p>Search by your area or location.</p>
          </div>
          <div>
            <span className="step">2</span>
            <h3>Check details</h3>
            <p>See timing and location information.</p>
          </div>
          <div>
            <span className="step">3</span>
            <h3>Share a spot</h3>
            <p>Help other devotees find Annadanam.</p>
          </div>
        </section>

        <footer>
          <p>🙏 Annadanam • Seva • Community</p>
          <small>
            This website is a community information project. Please verify
            timings with the organizer before travelling.
          </small>
        </footer>
      </section>

      {showForm && (
        <div className="overlay" onMouseDown={() => setShowForm(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <h2>Add Annadanam Spot</h2>
                <p>Share a location for community verification.</p>
              </div>
              <button
                className="closeButton"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitSpot}>
              <label>
                Annadanam Name *
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Example: Durga Bhavi Annadanam"
                  required
                />
              </label>

              <label>
                Organizer
                <input
                  value={form.organizer}
                  onChange={(e) =>
                    setForm({ ...form, organizer: e.target.value })
                  }
                  placeholder="Organizer or youth group"
                />
              </label>

              <div className="twoColumns">
                <label>
                  Area *
                  <input
                    value={form.area}
                    onChange={(e) =>
                      setForm({ ...form, area: e.target.value })
                    }
                    placeholder="Kukatpally"
                    required
                  />
                </label>

                <label>
                  City
                  <input
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    placeholder="Hyderabad"
                  />
                </label>
              </div>

              <label>
                Full Address *
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Enter the exact location"
                  rows={3}
                  required
                        />

        </label>

<button
  type="button"
  onClick={() => {
  setShowMapPicker(true);
  setMessage("Map button clicked successfully.");
}}
  className="locationButton"
>
  📍 Choose Location on Map
</button>

<div className="twoColumns">
                <label>
                  Date
                  <input
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    placeholder="11 October"
                  />
                </label>

                <label>
                  Time
                  <input
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    placeholder="11 AM - 3 PM"
                  />
                </label>
              </div>

              <div className="formNote">
                New spots are shown as <b>Upcoming</b>. Before making this a
                public production site, connect this form to Supabase and add
                admin verification.
              </div>

              <div className="modalActions">
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primaryButton">
                  Submit Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #faf8f4;
          color: #29231f;
          font-family: Arial, Helvetica, sans-serif;
        }

        .hero {
          background: linear-gradient(135deg, #fff1dc 0%, #fffaf2 55%, #f7e8cf 100%);
          border-bottom: 1px solid #eadbc8;
        }

        .heroInner,
        .content {
          width: min(1100px, calc(100% - 32px));
          margin: 0 auto;
        }

        .heroInner {
          padding: 54px 0 42px;
          text-align: center;
        }

        .badge {
          display: inline-block;
          padding: 7px 13px;
          border: 1px solid #e4c89f;
          border-radius: 999px;
          background: #fff9ef;
          color: #a04b13;
          font-size: 13px;
          font-weight: 700;
        }

        h1 {
          margin: 16px 0 10px;
          font-size: clamp(32px, 6vw, 58px);
          letter-spacing: -1.8px;
          line-height: 1.05;
        }

        .heroText {
          max-width: 680px;
          margin: 0 auto 28px;
          color: #675d54;
          font-size: 17px;
          line-height: 1.6;
        }

        .searchBox {
          display: flex;
          align-items: center;
          gap: 10px;
          width: min(720px, 100%);
          margin: auto;
          padding: 5px 12px;
          border: 1px solid #ddcfbe;
          border-radius: 14px;
          background: white;
          box-shadow: 0 8px 25px rgba(71, 48, 23, 0.07);
        }

        .searchBox > span {
          font-size: 26px;
          color: #8d8175;
        }

        .searchBox input {
          flex: 1;
          border: 0;
          outline: 0;
          padding: 14px 4px;
          font-size: 15px;
          background: transparent;
        }

        .clearButton,
        .closeButton {
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 24px;
          color: #766a60;
        }

        .content {
          padding: 38px 0 20px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .toolbar h2 {
          margin: 0 0 4px;
          font-size: 28px;
        }

        .toolbar p {
          margin: 0;
          color: #80766d;
        }

        .primaryButton,
        .mapButton,
        .secondaryButton {
          border: 0;
          border-radius: 10px;
          padding: 11px 17px;
          cursor: pointer;
          font-weight: 700;
        }

        .primaryButton {
          background: #b95118;
          color: white;
        }

        .primaryButton:hover,
        .mapButton:hover {
          opacity: 0.9;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin: 24px 0;
        }

        .filter {
          border: 1px solid #dfd3c4;
          background: white;
          color: #665c53;
          border-radius: 999px;
          padding: 9px 15px;
          cursor: pointer;
        }

        .filter.selected {
          background: #302a25;
          border-color: #302a25;
          color: white;
        }

        .notice {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid #cfe0c9;
          border-radius: 10px;
          background: #f2f8ef;
          color: #3c5735;
        }

        .notice button {
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .card {
          border: 1px solid #e3d8ca;
          border-radius: 16px;
          padding: 20px;
          background: white;
          box-shadow: 0 5px 20px rgba(50, 35, 20, 0.045);
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .status {
          display: inline-block;
          margin-bottom: 9px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }

        .status.active {
          background: #e8f6e8;
          color: #28722e;
        }

        .status.upcoming {
          background: #fff0d9;
          color: #9a5a08;
        }

        .status.ended {
          background: #eee;
          color: #666;
        }

        .card h3 {
          margin: 0 0 5px;
          font-size: 20px;
          line-height: 1.3;
        }

        .organizer {
          margin: 0;
          color: #82776d;
          font-size: 13px;
        }

        .distance {
          color: #8a7d71;
          font-size: 13px;
          white-space: nowrap;
        }

        .details {
          display: grid;
          gap: 12px;
          margin: 20px 0;
          padding: 15px 0;
          border-top: 1px solid #eee6dd;
          border-bottom: 1px solid #eee6dd;
        }

        .details > div {
          display: flex;
          gap: 10px;
          line-height: 1.4;
        }

        .detailIcon {
          width: 22px;
        }

        .details small {
          display: block;
          margin-top: 2px;
          color: #877d73;
        }

        .cardBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .interested {
          color: #7b7066;
          font-size: 13px;
        }

        .mapButton {
          background: #302a25;
          color: white;
        }

        .empty {
          text-align: center;
          padding: 70px 20px;
          border: 1px dashed #d8cabc;
          border-radius: 16px;
          background: white;
        }

        .emptyIcon {
          font-size: 42px;
        }

        .empty h3 {
          margin: 12px 0 5px;
        }

        .empty p {
          color: #7e746b;
          margin-bottom: 20px;
        }

        .how {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin: 52px 0 30px;
        }

        .how > div {
          padding: 22px;
          border: 1px solid #e5dacd;
          border-radius: 14px;
          background: #fffdf9;
        }

        .step {
          display: inline-flex;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f4dfc1;
          color: #88430f;
          font-weight: 800;
        }

        .how h3 {
          margin: 14px 0 6px;
        }

        .how p {
          margin: 0;
          color: #81776e;
          font-size: 14px;
          line-height: 1.5;
        }

        footer {
          padding: 25px 0 45px;
          text-align: center;
          color: #796f66;
        }

        footer p {
          margin-bottom: 7px;
          font-weight: 700;
        }

        footer small {
          line-height: 1.5;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(24, 19, 15, 0.55);
          overflow-y: auto;
        }

        .modal {
          width: min(600px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          border-radius: 18px;
          background: white;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .modalHeader h2 {
          margin: 0 0 5px;
        }

        .modalHeader p {
          margin: 0;
          color: #80756c;
          font-size: 13px;
        }

        form {
          display: grid;
          gap: 15px;
        }

        label {
          display: grid;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          color: #4d443c;
        }

        input,
        textarea {
          width: 100%;
          border: 1px solid #dcd0c2;
          border-radius: 9px;
          padding: 11px 12px;
          outline: 0;
          font: inherit;
          font-size: 14px;
        }

        input:focus,
        textarea:focus {
          border-color: #b95118;
        }

        textarea {
          resize: vertical;
        }

        .locationButton {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid #dcd0c2;
  border-radius: 9px;
  background: #fff;
  color: #b95118;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.locationButton:hover {
  background: #fff7f0;
}

        .twoColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .formNote {
          padding: 11px 12px;
          border-radius: 9px;
          background: #f8f4ee;
          color: #71675e;
          font-size: 12px;
          line-height: 1.5;
        }

        .modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 5px;
        }

        .secondaryButton {
          border: 1px solid #d8ccbe;
          background: white;
          color: #51483f;
        }

        @media (max-width: 760px) {
          .heroInner {
            padding-top: 38px;
          }

          .cards,
          .how {
            grid-template-columns: 1fr;
          }

          .toolbar {
            align-items: flex-start;
          }

          .cardBottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .mapButton {
            width: 100%;
          }
        }

        @media (max-width: 520px) {
          .heroInner,
          .content {
            width: min(100% - 22px, 1100px);
          }

          .toolbar {
            flex-direction: column;
          }

          .toolbar .primaryButton {
            width: 100%;
          }

          .twoColumns {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 18px;
          }
        }
      `}</style>

{showMapPicker && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    <div
      style={{
        background: "#fff",
        width: "100%",
        maxWidth: "500px",
        borderRadius: "16px",
        padding: "25px",
        textAlign: "center",
      }}
    >
      <h2>Choose Location</h2>

      <p>Map picker is opening correctly.</p>

      <button
        type="button"
        onClick={() => setShowMapPicker(false)}
        style={{
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          background: "#b95118",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

    </main>
  );
}
