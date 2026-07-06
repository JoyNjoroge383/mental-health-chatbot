# 🧠 MindCare — Mental Health Chatbot

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.9+-green" alt="Python">
  <img src="https://img.shields.io/badge/Flask-3.0-black" alt="Flask">
  <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646CFF" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC" alt="Tailwind">
</p>

## 📖 What is this project?

**MindCare** is an AI-powered mental health chatbot that offers a safe, judgment-free
space to talk through anxiety, stress, or a difficult day — any time. It pairs an
empathetic conversational AI with practical tools: appointment booking, a mood
journal, a therapist directory, and donation support.

It is a full-stack web app:

- **Backend** — a Flask API that generates responses through a Large Language Model
  (Groq by default, with Google Gemini and Ollama as alternatives) and falls back to
  a local TensorFlow-Lite intent-classification model plus an NLP pipeline whenever
  the LLM is unavailable.
- **Frontend** — a React + Vite single-page app (Tailwind CSS) with a floating chat
  widget and pages for booking, appointments, journaling, therapists, and donations.

### How the chatbot understands you

- **LLM responses** — context-aware, supportive replies from Groq / Gemini / Ollama.
- **Intent classification** — a local TFLite model trained on `intents.json`.
- **Sentiment analysis** — detects emotional tone (TextBlob).
- **Entity & language detection** — spaCy + `langdetect`.
- **Multilingual** — English ↔ Swahili translation via Hugging Face `transformers`.
- **Safety first** — crisis / self-harm phrases are caught and answered with a
  safety-first response *before* any LLM generation.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗣️ **Conversational AI** | LLM-backed replies with a local NLP fallback |
| 🧠 **Sentiment & intent** | Detects mood and classifies user intent |
| 🌍 **Multilingual** | English and Swahili with automatic translation |
| 🗓️ **Appointment booking** | Book a session; get a confirmation modal (stored in SQLite) |
| 💚 **Donations** | M-Pesa STK-push integration |
| 📓 **Journal & therapists** | Mood journaling and a therapist directory |
| 🎨 **Modern UI** | React 19 + Tailwind CSS v4, Vite-powered |

---

## 📋 Requirements

| Requirement | Version | Check |
|-------------|---------|-------|
| **Python** | 3.9+ | `python --version` |
| **pip** | Latest | `pip --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | Latest | `git --version` |

### Backend Python dependencies (`requirements.txt`)

- **Web:** Flask, flask-cors, gunicorn, python-dotenv
- **ML / NLP:** numpy, scikit-learn, nltk, textblob, spaCy (+ `en_core_web_sm`),
  langdetect, transformers, sentencepiece, sacremoses, huggingface_hub
- **Inference:** `tflite-runtime` (Linux only — see note below)

> **TensorFlow note:** production inference uses the lightweight `tflite-runtime`
> (~5 MB), whose wheels are published for **Linux only**. On Windows/macOS local dev,
> inference falls back to the interpreter bundled with a full TensorFlow install. The
> `model.h5 → model.tflite` conversion (`convert_to_tflite.py`) is a one-time local
> step that requires full TensorFlow and is **not** part of `requirements.txt`.

### An LLM provider (optional but recommended)

Set one up so the bot gives richer responses (otherwise it uses the local NLP fallback):

- **Groq** *(default)* — free, fast. Get a key at <https://console.groq.com/keys>.
- **Google Gemini** — get a key at <https://ai.google.dev>.
- **Ollama** — fully local. Install from <https://ollama.com>, then
  `ollama pull qwen2.5:14b-instruct`.

---

## 🚀 Installation

### 1. Clone

```bash
git clone <your-repo-url>
cd mental_health-chatbot
```

### 2. Backend (Flask + Python)

```bash
# Create & activate a virtual environment
python -m venv venv
source venv/bin/activate      # Linux/macOS
.\venv\Scripts\activate       # Windows

# Install dependencies (spaCy's English model is pinned in requirements.txt)
pip install -r requirements.txt

# Download the trained model files (model.h5, texts.pkl, labels.pkl, intents.json)
python download_models.py
```

### 3. Environment variables

```bash
cp .env.example .env
```

Then edit `.env` and set at least one LLM provider key (defaults to Groq):

```env
FLASK_DEBUG=1

# LLM (choose provider: groq | gemini | ollama)
USE_LLM=true
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# CORS: the frontend origin allowed to call this backend (production)
FRONTEND_URL=https://your-frontend.vercel.app

# M-Pesa (only needed for donations)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://your-domain/api/mpesa/callback
```

### 4. Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env        # optional: overrides the backend URL
```

The frontend talks to the backend over **absolute URLs with CORS** (see
`frontend/src/lib/api.js`) — no dev proxy is used. The backend URL resolves in this
order:

1. `VITE_API_BASE_URL` (from a frontend `.env` / host env var)
2. `http://127.0.0.1:5000` in dev, or the deployed Render URL in a production build

---

## 🏃 Running the app

Run the **backend** and **frontend** in two terminals.

**Terminal 1 — backend** (from the project root):

```bash
source venv/bin/activate      # or .\venv\Scripts\activate on Windows
python app.py
```

→ Backend at **http://127.0.0.1:5000**

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

→ Frontend at **http://localhost:5173** — open this in your browser.

To create a production build of the frontend:

```bash
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # preview the production build locally
```

---

## 📁 Project structure

```
mental_health-chatbot/
├── app.py                  # Flask API: chat, NLP, booking, M-Pesa, health
├── training.py             # Model training script
├── convert_to_tflite.py    # One-time model.h5 -> model.tflite conversion
├── download_models.py      # Fetch model files from Hugging Face
├── intents.json            # Intent patterns & responses
├── model.h5 / model.tflite # Trained intent-classification model
├── texts.pkl / labels.pkl  # Vocabulary & label encoders
├── appointments.db         # SQLite store for bookings
├── requirements.txt        # Python dependencies
├── render.yaml             # Render deployment config (gunicorn)
├── .env.example            # Backend environment template
│
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/      # ChatBot, Header, BookAppointment, Donate,
│   │   │                    # Journal, Therapists, AppointmentList, ...
│   │   ├── lib/api.js       # Backend URL resolution (env-driven)
│   │   ├── App.jsx          # Routes + landing page
│   │   └── main.jsx         # Entry point
│   ├── vite.config.js
│   └── .env.example         # VITE_API_BASE_URL template
│
├── static/ & templates/    # Legacy Flask HTML interface
└── venv/                   # Virtual environment (not in git)
```

---

## 🛠️ Tech stack

**Backend:** Flask · Flask-CORS · Gunicorn · TensorFlow Lite · spaCy · TextBlob ·
Hugging Face Transformers (MarianMT translation) · langdetect · SQLite

**LLM:** Groq (default) · Google Gemini · Ollama — with a local NLP fallback

**Frontend:** React 19 · React Router · Vite 7 · Tailwind CSS v4

---

## 📝 API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Legacy HTML interface |
| `/get?msg=<message>` | GET | Chatbot response (`&style=` to override tone) |
| `/analyze?msg=<message>` | GET | NLP analysis (sentiment, entities) |
| `/health` | GET | Flask + LLM provider status |
| `/booking` | GET/POST | Create / list appointments |
| `/bookings_json` | GET | Appointments as JSON |
| `/mpesa/stk_push` | POST | Initiate an M-Pesa donation |
| `/mpesa/callback` | POST | M-Pesa payment callback |

### Response-style tuning

Set a global tone in `.env` — `RESPONSE_STYLE=concise | balanced | therapeutic` — or
override per request:

```text
/get?msg=I%20feel%20overwhelmed&style=therapeutic
```

Sampling is controlled by `LLM_TEMPERATURE` (creativity) and `LLM_TOP_P` (nucleus).

### Health check

```bash
curl http://127.0.0.1:5000/health
```

Reports Flask status, LLM provider reachability, model availability, and the active
style/sampling settings.

---

## ☁️ Deployment

The backend deploys to **Render** via `render.yaml` (gunicorn). On the host, set the
same environment variables as your `.env` (LLM key, `FRONTEND_URL`, M-Pesa keys). The
frontend can be deployed to any static host (e.g. Vercel) — set `VITE_API_BASE_URL`
to your deployed backend URL, and make sure that host's origin matches `FRONTEND_URL`
so CORS allows it.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Open source under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for mental health awareness — you are not alone.</p>
