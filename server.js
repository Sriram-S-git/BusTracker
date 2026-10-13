const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "buses.json");

app.use(express.json());
const PUBLIC_DIR = path.join(__dirname, "public");
app.use(express.static(PUBLIC_DIR));

// Explicit page routes make the intended entry points clear.
app.get("/", (_req, res) => res.sendFile(path.join(PUBLIC_DIR, "index.html")));
app.get("/admin.html", (_req, res) => res.sendFile(path.join(PUBLIC_DIR, "admin.html")));

function readBuses() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function saveBuses(buses) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(buses, null, 2));
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "BusTracker API" }));

app.get("/api/locations", (_req, res) => {
  const buses = readBuses();
  const locations = [...new Set(buses.flatMap(b => [b.source, b.destination]))].sort();
  res.json(locations);
});

app.get("/api/buses", (req, res) => {
  const { source, destination, date } = req.query;
  if (!source || !destination) {
    return res.status(400).json({ message: "Please provide source and destination." });
  }
  if (source.toLowerCase() === destination.toLowerCase()) {
    return res.status(400).json({ message: "Source and destination must be different." });
  }
  const buses = readBuses().filter(bus =>
    bus.source.toLowerCase() === source.toLowerCase() &&
    bus.destination.toLowerCase() === destination.toLowerCase() &&
    (!date || bus.serviceDates.includes(date))
  );
  res.json({ date: date || null, count: buses.length, buses });
});

app.post("/api/bookings", (req, res) => {
  const { busId, date, passengerName, phone, seatType, quantity } = req.body || {};
  const count = Number(quantity);
  if (!busId || !date || !passengerName || !phone || !["seat", "standing"].includes(seatType) ||
      !Number.isInteger(count) || count < 1 || count > 6) {
    return res.status(400).json({ message: "Enter valid passenger details and choose 1–6 places." });
  }

  const buses = readBuses();
  const bus = buses.find(item => item.id === busId);
  if (!bus) return res.status(404).json({ message: "Bus not found." });
  if (!bus.serviceDates.includes(date)) {
    return res.status(400).json({ message: "This bus is not scheduled for the selected date." });
  }

  const capacityKey = seatType === "seat" ? "seatsAvailable" : "standingAvailable";
  if (bus[capacityKey] < count) {
    return res.status(409).json({ message: `Only ${bus[capacityKey]} ${seatType === "seat" ? "seats" : "standing places"} are available.` });
  }

  bus[capacityKey] -= count;
  bus[seatType === "seat" ? "seatsBooked" : "standingBooked"] += count;
  saveBuses(buses);

  const booking = {
    bookingId: "BT" + Date.now().toString().slice(-8),
    busId, busName: bus.name, date, passengerName, phone,
    seatType, quantity: count, total: bus.fare * count,
    remainingSeats: bus.seatsAvailable,
    remainingStanding: bus.standingAvailable,
    createdAt: new Date().toISOString()
  };
  res.status(201).json({ message: "Booking confirmed!", booking });
});

app.get("/api/admin/buses", (_req, res) => {
  // Admin endpoint; add authentication before using this outside localhost.
  res.json(readBuses());
});

app.listen(PORT, () => {
  console.log(`BusTracker running at http://localhost:${PORT}`);
});
