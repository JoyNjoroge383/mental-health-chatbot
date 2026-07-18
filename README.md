# 🧠 MindCare — Mental Health Chatbot

A full-stack, AI-powered mental health support web app. Users chat with a supportive
assistant in **English or Swahili**, book counselling appointments, journal, browse
mental-health resources, and donate via mobile money. The system combines a locally
trained intent classifier, cloud/local Large Language Models, sentiment analysis,
machine translation, and a safety layer for crisis detection.

> **⚠️ Disclaimer:** This chatbot is for **educational and emotional-support purposes only**
> and is **not** a substitute for professional mental health care. It does not diagnose. If you
> are experiencing a mental health crisis, please contact a qualified professional or your local
> emergency services immediately.

---

## 📌 Features

- 💬 AI-powered conversational chatbot (LLM-driven, with an offline fallback model)
- 🌍 **Multilingual** — English and Swahili (automatic language detection + translation)
- 🛡️ **Crisis detection** — safety-first screening for self-harm / suicide language (English & Swahili)
- 😊 Sentiment analysis (positive / neutral / negative) with empathy-aware responses
- 🧠 Intent classification via a trained neural-network model (run through TFLite)
- 📅 Book and view counselling appointments
- 📓 Journaling, mental-health resources, therapist directory, and about/contact pages
- 💰 Donations via **M-Pesa STK Push** (Safaricom)
- 🌐 Responsive React frontend with a floating chat widget
- ⚡ Flask REST API backend

---

## 🛠️ Technologies Used

### Frontend (`frontend/`)
- **React 19** — UI framework (single-page app)
- **Vite 7** — build tool and dev server
- **Tailwind CSS 4** — styling
- **react-router-dom 7** — client-side routing
- **lucide-react** — icons
- Deployed on **Vercel**

### Backend (`app.py`)
- **Python 3.9** + **Flask 3** — REST API / web server
- **Flask-CORS** — origin-scoped cross-origin access
- **Gunicorn** — production WSGI server
- Deployed on **Render**

### Machine Learning & NLP
- **Keras / TensorFlow** — trains the intent classifier (`training.py`)
- **TFLite runtime** — runs inference on the converted `model.tflite` (keeps the deploy image small)
- **NLTK** — tokenization and lemmatization
- **spaCy** (`en_core_web_sm`) + **spacy-langdetect** — language detection and entity recognition
- **TextBlob** — sentiment analysis
- **HuggingFace Transformers (MarianMT)** — Swahili↔English translation
- **LLM providers** — **Groq** (default), **Google Gemini**, or **Ollama** (local), selectable via env var

### Data & Integrations
- **SQLite** — appointment storage (`appointments.db`)
- **M-Pesa (Safaricom) STK Push** — donation payments
- **HuggingFace Hub** — hosts the trained model files, downloaded at startup (`download_models.py`)

---

## 📂 Project Structure

```text
mental-health-chatbot/
│
├── app.py                  # Flask backend: API, chat pipeline, LLM, translation, M-Pesa
├── download_models.py      # Fetches model files from HuggingFace Hub at startup
├── convert_to_tflite.py    # One-time: converts model.h5 -> model.tflite (needs full TensorFlow)
├── training.py             # Trains the Keras intent classifier from intents.json
├── training.ipynb          # Notebook version of the training script
├── intents.json            # Intent tags, training patterns, and canned responses
├── model.h5 / model.tflite # Trained classifier (Keras source + TFLite for inference)
├── texts.pkl / labels.pkl  # Vocabulary and class labels for the bag-of-words model
├── requirements.txt        # Python dependencies
├── render.yaml             # Render deployment config
├── appointments.db         # SQLite database (created/used at runtime)
├── models/                 # Cached MarianMT translation models (en-sw, sw-en)
├── templates/              # Legacy Flask HTML templates (index, booking, view_bookings)
├── static/                 # Legacy static assets (js, css, img)
│
└── frontend/               # React + Vite single-page app
    ├── src/
    │   ├── App.jsx          # Routes
    │   ├── main.jsx         # Entry point
    │   ├── lib/api.js       # Resolves the backend base URL (dev vs prod)
    │   └── components/      # ChatBot, Header, Footer, BookAppointment, Donate, Journal, ...
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/JoyNjoroge383/mental-health-chatbot.git
cd mental-health-chatbot
```

### 2. Backend Setup

Create and activate a virtual environment:

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS**
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

> **Note:** The lightweight `tflite-runtime` wheel is Linux-only. On Windows/macOS the app
> falls back to the interpreter bundled with a full TensorFlow install (see the import chain
> in `app.py`). The `model.h5 → model.tflite` conversion (`convert_to_tflite.py`) is a
> one-time local step that requires full TensorFlow.

Configure environment variables (see [Configuration](#-configuration) below):

```bash
cp .env.example .env
# then edit .env and add your GROQ_API_KEY (or configure Gemini/Ollama)
```

Start the Flask server (model files are downloaded from HuggingFace on first run):

```bash
python app.py
```

The backend runs on `http://127.0.0.1:5000`.

### 3. Frontend Setup

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. In development it automatically talks to the
Flask backend at `http://127.0.0.1:5000`; override with `VITE_API_BASE_URL` (see `frontend/.env.example`).

---

## ⚙️ Configuration

Backend configuration is via environment variables (`.env`). Key settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_LLM` | Enable the LLM responder (falls back to the local model if `false` or on failure) | `true` |
| `LLM_PROVIDER` | `groq`, `gemini`, or `ollama` | `groq` |
| `GROQ_API_KEY` | Groq API key ([console.groq.com](https://console.groq.com)) | — |
| `GROQ_MODEL` | Groq model id | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Google Gemini config | — |
| `OLLAMA_MODEL` / `OLLAMA_CHAT_URL` | Local Ollama config | `qwen2.5:14b-instruct` |
| `LLM_TEMPERATURE` / `LLM_TOP_P` | Sampling parameters | `0.5` / `0.9` |
| `RESPONSE_STYLE` | `concise`, `balanced`, or `therapeutic` | `balanced` |
| `FRONTEND_URL` | Frontend origin allowed by CORS | `https://joyhealth.vercel.app` |
| `DATABASE_PATH` | SQLite database path | `appointments.db` |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` / `MPESA_SHORTCODE` / `MPESA_PASSKEY` / `MPESA_CALLBACK_URL` | M-Pesa (Safaricom sandbox) credentials | — |

Frontend configuration (`frontend/.env`):

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the Flask backend to call |

---

## 🧠 How It Works

The chat request flows through a layered pipeline in `app.py`:

1. The React chat widget sends the message to the Flask API (`GET /get?msg=...`).
2. **Language detection** (spaCy) determines English vs Swahili.
3. If Swahili, the message is **translated to English** (MarianMT) for processing.
4. **Sentiment analysis** (TextBlob) determines emotional tone.
5. **Crisis screening** — regex patterns (English & Swahili) plus intent-confidence check.
   High-risk messages return an immediate safety response and bypass the model.
6. **Response generation**:
   - **Primary:** the configured LLM (Groq / Gemini / Ollama), guided by a mental-health system prompt.
   - **Fallback:** if the LLM is disabled or fails, the locally trained **TFLite intent classifier**
     picks the best intent and returns a response from `intents.json`.
7. If the original message was Swahili, the reply is **translated back to Swahili** (MarianMT).
8. The response is rendered in the chat widget.

This layered fallback means the app always responds — even without an internet connection or API key.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serves the legacy Flask index page |
| `GET` | `/get?msg=...&style=...` | Main chat endpoint (full pipeline above); returns plain text |
| `GET` | `/analyze?msg=...` | Returns NLP analysis: sentiment, entities, predicted intent |
| `GET` | `/health` | Health check for Flask + the configured LLM provider |
| `GET`/`POST` | `/booking` | Create an appointment (JSON or form) / render booking page |
| `GET` | `/bookings_json` | List appointments as JSON |
| `GET` | `/view_bookings` | Render appointments as an HTML page |
| `POST` | `/mpesa/stk_push` | Initiate an M-Pesa STK Push donation |
| `POST` | `/mpesa/callback` | M-Pesa payment callback |

### Example — Chat

```http
GET /get?msg=I feel anxious today
```

Returns a plain-text supportive response.

### Example — Book Appointment

```http
POST /booking
Content-Type: application/json

{ "name": "Jane Doe", "email": "jane@example.com", "date": "2026-08-01", "time": "10:00" }
```

---

## 🤖 Retraining the Model

The intent classifier is trained from `intents.json`:

```bash
python training.py          # trains and saves model.h5 (+ texts.pkl, labels.pkl)
python convert_to_tflite.py # converts model.h5 -> model.tflite for inference
```

The trained artifacts are hosted on HuggingFace (`Tamara254/mindcare-models`) and pulled at
startup by `download_models.py`, so they don't need to be committed to Git.

---

## 📈 Future Improvements

- User authentication and protected booking data
- Persistent, managed database (e.g. PostgreSQL) instead of ephemeral SQLite
- Conversation memory / context passed to the LLM
- Email appointment confirmations
- Admin dashboard and therapist portal
- Production M-Pesa credentials
- Voice interaction and a mobile app
- Additional languages

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push: `git push origin feature-name`
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Joy Njoroge** — [github.com/JoyNjoroge383](https://github.com/JoyNjoroge383)

---

## 🙏 Acknowledgements

Flask · React · Vite · Tailwind CSS · TensorFlow/Keras · NLTK · spaCy · TextBlob ·
HuggingFace Transformers · Groq · the Python & open-source community.

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
