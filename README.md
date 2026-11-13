# PingME Care / LifeMesh 🚑⚡🏥
### Crash-to-Clinic Emergency Telemetry & Fast-Track Hospital Queue Suite

PingME Care (LifeMesh) addresses **Problem Statement 4 (Crash & Emergency Response)**: bridging the critical golden-hour gap between roadside vehicle accidents, bystander assistance, paramedic field triage, and hospital emergency trauma bay readiness.

---

## 🌟 Key Features

1. **Public Bystander Emergency HUD (`/emergency/:tagId`)**
   - **Zero-Knowledge Privacy Vault**: Phone numbers masked, emergency contacts notified via automated masked relays.
   - **Good Samaritan Legal Protection**: Section 134A Motor Vehicles Act immunity banner explicitly reassuring bystanders against police harassment.
   - **Multi-Traveler Photo Recognition**: Instantly identify who was traveling (e.g. Ramesh, Sunita, Aarav) with one tap to reveal critical blood group and severe allergies.
   - **Direct 108 Emergency Dispatch**: Geo-tagged crash coordinate dispatch with live status updates.

2. **Authorized Paramedic Field Triage (`/paramedic/triage`)**
   - Secured with access PIN `PARAMEDIC-108`.
   - Real-time Glasgow Coma Scale (GCS) scoring.
   - Anatomic injury localization with severe crash mechanism indicators.
   - Crash scene photo capture & fast triage upload.
   - Destination Trauma Center selection with live socket telemetry streaming.

3. **Hospital Fast-Track OPD Check-In (`/hospital/checkin`)**
   - 1-Tap ABHA & Family Profile verification.
   - Instant token issuance & queue wait-time estimation.
   - Direct integration into clinical consultation pipeline.

4. **Clinical Emergency Trauma Bay & Doctor Dashboard (`/doctor`)**
   - Preserved institutional clinical consultation cockpit.
   - **Live Incoming Ambulance Telemetry Banner**: Shows real-time ETA, GCS, blood type requirement, and pre-arrival autonomous order protocol (O-neg blood standby, CT trauma series, intubation kit).
   - Real-time OPD and Emergency Queue management.

5. **Phygital Emergency Tag Studio (`/studio`)**
   - 3M reflective vehicle decal generation.
   - Dynamic high-contrast QR generation.
   - NFC 1-Tap touchpoint simulation for helmets and windshields.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Server
```bash
cd backend
npm install
node server.js
```
Runs on `http://localhost:5000` with WebSocket telemetry.

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

---

## 🔑 Demo Access Credentials

| Role | Route | Access Key / Credentials |
| :--- | :--- | :--- |
| **Paramedic 108 Triage** | `/paramedic/triage` | PIN: `PARAMEDIC-108` |
| **Emergency QR HUD** | `/emergency/PING-HLM-882` | Public / Scan-to-view |
| **Hospital Check-In** | `/hospital/checkin` | ABHA / Family 1-Tap |
| **Doctor Console** | `/doctor` | Pre-authenticated Hospital Staff |
| **Decal Studio** | `/studio` | Open Studio |

---

## 🛠 Tech Stack
- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Lucide Icons, Socket.io-client
- **Backend**: Node.js, Express, Socket.io (real-time telemetry broadcast), Multer
- **Architecture**: Privacy-preserving Zero-Knowledge relays, ABHA tokenization, ESI (Emergency Severity Index) triage automation
