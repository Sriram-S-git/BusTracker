# BusTracker — Full-stack VS Code project

A responsive Chennai-inspired bus search prototype built with HTML, CSS, vanilla JavaScript, Node.js and Express.

## Requirements
- Node.js LTS installed
- Visual Studio Code

## Run in VS Code
1. Extract the `BusTracker.zip` folder.
2. Open the `BusTracker` folder in VS Code (`File → Open Folder`).
3. Open Terminal → New Terminal.
4. Run `npm install`.
5. Run `npm start`.
6. Open **http://localhost:3000** in your browser.

**Important:** Do not open `public/index.html` directly and do not use Live Server for this full-stack version. The Express server serves the page and provides the `/api` backend routes.

## Features
- Source, destination and travel-date search.
- 10 sample bus services across Chennai routes.
- Per-bus fare, departure/arrival time, journey duration and bus type.
- Capacity model: 50 seated places and 15 standing places per bus.
- Booking flow with passenger name, phone, place type and quantity.
- Backend validates capacity and updates `buses.json` when a booking succeeds.
- Capacity remains updated after restarting the server because the application data is saved in `buses.json`.

## Backend API
- `GET /api/health` — health check
- `GET /api/locations` — route locations
- `GET /api/buses?source=...&destination=...&date=YYYY-MM-DD` — search services
- `POST /api/bookings` — validate and create a booking

Example booking JSON:
```json
{
  "busId": "BT101",
  "date": "2026-10-13",
  "passengerName": "Sample Passenger",
  "phone": "9876543210",
  "seatType": "seat",
  "quantity": 1
}
```

## How it works
1. The browser loads locations from `GET /api/locations`.
2. The user chooses a route and date.
3. Frontend JavaScript calls `GET /api/buses`.
4. Express reads `buses.json`, filters matching services and returns bus/capacity details.
5. A booking is sent to `POST /api/bookings`.
6. The backend checks remaining capacity, updates the JSON data file and returns a booking confirmation.

## Project structure
```text
BusTracker/
├── server.js
├── buses.json
├── package.json
├── README.md
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Honest project limitation
The “live” capacity is live **within this prototype**: it changes when bookings are made through this app and is stored by its backend. It is not connected to actual MTC/Chennai One buses, ticketing, GPS, or operator data. For a real service, capacity and schedules must come from an authorised transport/operator API or database, with authentication, concurrency-safe booking, and payment integration.
