# 🌱 Smart Irrigation System

A full-stack IoT web application for automated plant irrigation using an **Arduino Uno R4 WiFi** and soil moisture sensors. The system monitors soil moisture in real time, controls a water pump automatically or manually, and displays live weather data on a modern dashboard.

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js, WebSockets (ws) |
| Database | MongoDB (Atlas) |
| Auth | JWT + bcrypt |
| Weather | OpenWeatherMap API |
| Hardware | Arduino Uno R4 WiFi, Soil Moisture Sensor, Relay Module |

---

## 📁 Project Structure

```
smart-irrigation/
│
├── frontend/                        # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertBanner.jsx      # Dry soil alert banner
│   │   │   ├── Layout.jsx           # Navbar + page wrapper
│   │   │   ├── MoistureGauge.jsx    # SVG circular gauge
│   │   │   ├── StatCard.jsx         # Dashboard stat cards
│   │   │   └── WeatherCard.jsx      # Live weather widget
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state (login/logout)
│   │   ├── hooks/
│   │   │   └── useWeather.js        # OpenWeatherMap API hook
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Main dashboard page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Plants.jsx           # Plant profiles page
│   │   │   └── Signup.jsx           # Signup page
│   │   ├── App.jsx                  # Routes + auth guard
│   │   ├── index.css                # Tailwind base styles
│   │   └── main.jsx                 # React entry point
│   ├── .env                         # ⚠️ Not committed (see .env.example)
│   ├── .env.example                 # Environment variable template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                  # Vercel SPA routing config
│   └── vite.config.js               # Vite + proxy config
│
├── backend/                         # Node.js + Express API
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── PlantProfile.js          # Plant profile schema
│   │   ├── SensorData.js            # Moisture reading schema
│   │   └── User.js                  # User schema + bcrypt
│   ├── routes/
│   │   ├── auth.js                  # POST /signup, POST /login
│   │   ├── plants.js                # CRUD plant profiles
│   │   └── sensor.js                # Sensor data + pump control
│   ├── .env                         # ⚠️ Not committed (see .env.example)
│   ├── .env.example                 # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Express app + WebSocket server
│
└── arduino/                         # Arduino Uno R4 WiFi firmware
    └── irrigation/
        └── irrigation.ino           # Main Arduino sketch
```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart-irrigation
JWT_SECRET=your_long_random_secret
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key
```
---

## 🚀 Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-irrigation.git
cd smart-irrigation
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env       # Fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                # Runs on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env       # Fill in API keys
npm install
npm run dev                # Runs on http://localhost:5173
```

---

## 🌐 REST API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |

### Sensor & Pump

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/sensor-data` | Latest sensor reading | No |
| POST | `/api/sensor-data` | Arduino pushes data | No |
| POST | `/api/pump-control` | Manual pump toggle | No |
| GET | `/api/history` | Paginated history | No |

### Plant Profiles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/plants` | List all profiles | No |
| POST | `/api/plants` | Add new profile | JWT |
| PUT | `/api/plants/:id` | Update profile | JWT |
| DELETE | `/api/plants/:id` | Delete profile | JWT |

---

## 🔌 WebSocket Events

The backend broadcasts real-time events to all connected clients.

| Event type | Payload | Trigger |
|------------|---------|---------|
| `sensor` | `{ data, pump }` | New reading from Arduino |
| `pump` | `{ pump }` | Pump state changed |
| `alert` | `{ message, moisture }` | Moisture drops below 20% |

---

## 🔧 Arduino Uno R4 WiFi — Setup

### Required Libraries (Arduino Library Manager)

- `WiFiS3` — bundled with Arduino UNO R4 board package
- `ArduinoHttpClient` by Arduino
- `ArduinoJson` by Benoit Blanchon (v7+)

### Board Setup

```
Tools → Board Manager → search "Arduino UNO R4" → Install
```

### Wiring

```
Soil Moisture Sensor AO  →  A0   (14-bit ADC)
Water Pump Relay IN      →  D7   (Digital Output)
Sensor VCC               →  3.3V or 5V
Sensor GND               →  GND
Relay VCC                →  5V
Relay GND                →  GND
```

### Configuration (irrigation.ino)

```cpp
const char WIFI_SSID[]   = "YOUR_WIFI_SSID";
const char WIFI_PASSWORD[] = "YOUR_WIFI_PASSWORD";
const char SERVER_HOST[] = "your-backend.onrender.com";
const int  SERVER_PORT   = 443;
const char PLANT_TYPE[]  = "Tomato";
```

---

## 🧪 Test Without Arduino

Send mock sensor data via curl to populate the dashboard and graph:

```bash
# Windows CMD
for %i in (65 58 50 43 38 32 27 22 18 25 33 41 48 55 62) do curl -X POST http://localhost:5000/api/sensor-data -H "Content-Type: application/json" -d "{\"moisture\": %i, \"temperature\": 28, \"plantType\": \"Tomato\"}"
```

```bash
# macOS / Linux
for val in 65 58 50 43 38 32 27 22 18 25 33 41 48 55 62; do
  curl -X POST http://localhost:5000/api/sensor-data \
    -H "Content-Type: application/json" \
    -d "{\"moisture\": $val, \"temperature\": 28, \"plantType\": \"Tomato\"}"
done
```

---

## 📸 Features

- Live soil moisture gauge with color-coded status
- Real-time moisture history chart (Recharts)
- Manual and automatic pump control
- Dry soil alerts via WebSocket
- Live weather widget (OpenWeatherMap) with irrigation advice
- Plant profile management (add/delete custom profiles)
- JWT-based user authentication
- Fully mobile responsive (Tailwind CSS)
"# IOT" 
