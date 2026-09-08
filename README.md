# 🎭 MIMIC PARTY

> **"Hear it. Mimic it. Beat your friends."**

An original multiplayer AI voice-mimicking party game. Players join a private room, listen to hilarious meme voices and character sound bites, mimic them into their microphone, and get scored in real-time by a measurable DSP audio engine and a comedic AI judge.

---

## ✨ Features

- **Real-Time Multiplayer**: Create or join private party rooms using 6-digit codes. Powered by Socket.IO for zero-latency synchronization across all connected players.
- **4 Game Modes**: Classic Party (5 rounds), Battle (1v1, 3 rounds), Tournament (6 rounds), and Chaos Mode (random modifiers like Chipmunk, Robot, Angry, Slow Motion).
- **Microphone Recording**: Web Audio API and MediaRecorder with a live canvas waveform visualizer, 3-2-1 countdown, timer, stop, and retry.
- **DSP Audio Analysis Engine**: Scores performances across 5 measurable audio features:
  - Voice Similarity (30%) — spectral centroid & ZCR timbre comparison
  - Pitch Accuracy (20%) — F₀ autocorrelation fundamental frequency
  - Timing & Cadence (20%) — duration and onset/offset detection
  - Speech Articulation (15%) — syllable rhythm and frequency distribution
  - Expression & Energy (15%) — RMS dynamic range and burst intensity
- **Comedic AI Judge**: Context-aware funny roasts and praise powered by Google Gemini, with an offline comedy fallback matrix.
- **Dramatic Results & Podium**: Animated score counter, 5-bar metric breakdown, dynamic badges (MASTER MIMIC, VOICE CHAMELEON, CHAOS LEGEND), and a 3D winner podium with confetti.
- **14 Curated Challenges** across Meme Voices, Character Voices, Funny Sounds, Cartoon, and Gaming categories.
- **Responsive Design**: Works on Desktop, Laptop, Tablet, and Mobile.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Web Audio API, MediaRecorder, Canvas API, Lucide Icons, Canvas Confetti |
| **Game Server** | Node.js, Express, Socket.IO, TypeScript |
| **AI Audio Engine** | Python 3, FastAPI, Uvicorn, NumPy, SciPy, Google Gemini API |

---

## 📁 Project Structure

```
mimic-party/
├── client/                         # React frontend (Vite)
│   ├── src/
│   │   ├── components/             # WaveformCanvas, ScoreCounter, Navbar, Modals
│   │   ├── utils/                  # audioRecorder, challengeSynthesizer, soundEffects
│   │   ├── views/                  # Landing, Lobby, GameRound, Result, Leaderboard, Podium
│   │   ├── types.ts                # Shared TypeScript types
│   │   └── App.tsx                 # Root app with Socket.IO client & view router
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                         # Node.js game server
│   ├── src/
│   │   ├── challenges/             # Challenge catalog & chaos modifiers
│   │   ├── rooms/                  # Multiplayer room manager & state machine
│   │   ├── scoring/                # Python service bridge & fallback evaluator
│   │   ├── socket/                 # Socket.IO event handlers
│   │   ├── types.ts
│   │   └── index.ts                # Express + Socket.IO entry point
│   ├── tsconfig.json
│   └── package.json
├── audio-service/                  # Python FastAPI audio analysis
│   ├── main.py                     # DSP feature extraction & Gemini AI judge
│   └── requirements.txt
├── .env.example                    # Environment variable template
├── .gitignore
├── package.json                    # Root orchestration scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** v3.10+ (for the AI audio service)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/mimic-party.git
cd mimic-party
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and optionally add your `GEMINI_API_KEY` for dynamic AI judge commentary. The game works without it using a built-in comedy fallback matrix.

### 3. Install & run the Game Server

```bash
cd server
npm install
npm run dev
```

Runs at `http://localhost:3001`.

### 4. Install & run the Python Audio Service

```bash
cd audio-service
python -m venv venv

# Windows
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# macOS/Linux
./venv/bin/pip install -r requirements.txt
./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Runs at `http://localhost:8000`.

### 5. Install & run the Frontend

```bash
cd client
npm install
npm run dev
```

Opens at `http://localhost:5173`.

---

## 🎮 How to Play

1. Open the frontend in your browser.
2. Click **CREATE PARTY**, enter your name, and pick an avatar.
3. Share the 6-digit room code with friends.
4. Friends click **JOIN PARTY** and enter the code.
5. The host selects a game mode and clicks **START PARTY GAME**.
6. Listen to the target voice challenge, then mimic it into your microphone.
7. The AI evaluates your performance and delivers a hilarious verdict.
8. After all rounds, the leaderboard crowns the winner with a confetti-filled podium!

---

## 🔧 Environment Variables

| Variable | Used By | Description |
| :--- | :--- | :--- |
| `PORT` | Server | Game server port (default: `3001`) |
| `CLIENT_URL` | Server | Allowed CORS origin for frontend |
| `AUDIO_SERVICE_URL` | Server | URL to the Python audio analysis service |
| `GEMINI_API_KEY` | Audio Service | Google Gemini API key (optional) |
| `VITE_SERVER_URL` | Client | URL to the game server for production builds |

---

## 📦 Building for Production

### Frontend

```bash
cd client
npm run build
```

Output: `client/dist/` — deploy this as a static site (Vercel, Netlify, etc.).

### Server

```bash
cd server
npm run build
npm start
```

Output: `server/dist/` — deploy to any Node.js host (Railway, Render, Fly.io, etc.).

---

## 🌐 Deployment Architecture

```
┌────────────────────────────────────────┐
│  Vercel (Static Frontend)              │
│  client/dist/                          │
│  Env: VITE_SERVER_URL=https://...      │
└──────────────┬─────────────────────────┘
               │ Socket.IO / HTTPS
               ▼
┌────────────────────────────────────────┐
│  Railway/Render (Game Server)          │
│  Node.js + Express + Socket.IO        │
│  Env: PORT, CLIENT_URL,               │
│       AUDIO_SERVICE_URL               │
└──────────────┬─────────────────────────┘
               │ HTTP POST /analyze
               ▼
┌────────────────────────────────────────┐
│  Railway/Render (Audio Service)        │
│  Python FastAPI + NumPy/SciPy         │
│  Env: GEMINI_API_KEY                  │
└────────────────────────────────────────┘
```

> **Important**: The game server uses WebSockets (Socket.IO) for real-time multiplayer. The Python audio service is a stateful DSP engine. Neither can run as a Vercel serverless function. They must be deployed to a platform that supports persistent processes (Railway, Render, Fly.io, etc.).

---

## ⚠️ Known Limitations

- **No persistent database**: Game state is in-memory. Rooms are lost on server restart.
- **Audio analysis accuracy**: The DSP engine uses genuine feature extraction but does not include pre-trained ML models. Scoring is based on measurable signal characteristics with tuned randomization to keep party gameplay exciting.
- **Challenge audio**: Target challenges are synthesized via the browser's Web Speech/Audio API rather than pre-recorded audio files. Voice quality depends on the browser's TTS engine.
- **WebSocket requirement**: The multiplayer game server requires a host that supports persistent WebSocket connections.

---

## 📄 License

MIT
