# 🧠Mindcare Mental Health Chatbot

A full-stack AI-powered Mental Health Chatbot developed as a project to provide users with emotional support, mental health awareness, and appointment booking services. The system uses Natural Language Processing (NLP), sentiment analysis, and a machine learning model to understand user messages and provide appropriate responses through an intuitive web interface.

> **⚠️ Disclaimer:** This chatbot is designed for educational purposes and is **not** a substitute for professional mental health care. If you are experiencing a mental health crisis, please contact a qualified mental health professional or your local emergency services immediately.

---

## 📌 Features

- 💬 AI-powered conversational chatbot
- 😊 Sentiment analysis (Positive, Neutral, Negative)
- 🧠 Intent classification using a trained machine learning model
- 📅 Book counselling appointments
- 📋 View booked appointments
- ❤️ Mental health awareness and self-care guidance
- 💰 Donation page to support mental health initiatives
- 🌐 Responsive React frontend
- ⚡ Flask REST API backend
- 🗄️ SQLite database for appointment management

---

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- HTML5
- CSS3
- JavaScript
- Axios

### Backend
- Python
- Flask
- Flask-CORS

### Machine Learning & NLP
- Scikit-learn
- NLTK
- Joblib
- NumPy
- Pandas

### Database
- SQLite

---

# 📂 Project Structure

```text
mental-health-chatbot/
│
├── backend/
│   ├── app.py
│   ├── chatbot.py
│   ├── intents.json
│   ├── appointments.db
│   ├── requirements.txt
│   ├── model.pkl
│   ├── vectorizer.pkl
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
├── README.md
└── LICENSE
```

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/JoyNjoroge383/mental-health-chatbot.git

cd mental-health-chatbot
```

---

## 2. Backend Setup

Navigate to the backend folder.

```bash
cd backend
```

Create a virtual environment.

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Start the Flask server.

```bash
python app.py
```

The backend will run on:

```
http://127.0.0.1:5000
```

---

## 3. Frontend Setup

Open another terminal.

```bash
cd frontend
```

Install packages.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

# 💬 Usage

1. Open the application in your browser.
2. Start chatting with the AI assistant.
3. Ask mental health-related questions.
4. Receive supportive responses and sentiment analysis.
5. Book counselling appointments.
6. View existing appointments.
7. Learn about mental health resources.

---

# 📸 Screenshots

## Home Page

> Add screenshot here

---

## Chat Interface

> Add screenshot here

---

## Appointment Booking

> Add screenshot here

---

## Appointment List

> Add screenshot here

---

## Donation Page

> Add screenshot here

---

# 🧠 How It Works

1. User sends a message.
2. The frontend sends the request to the Flask API.
3. The backend preprocesses the text.
4. The trained machine learning model predicts the user's intent.
5. Sentiment analysis determines the emotional tone.
6. The chatbot generates an appropriate response.
7. If the user requests an appointment, they are redirected to the booking page.
8. Appointment details are stored in the SQLite database.

---

# 📡 API Endpoints

## Chat

```http
POST /chat
```

Example Request

```json
{
    "message": "I feel anxious today."
}
```

---

## Sentiment Analysis

```http
GET /analyze?msg=I feel anxious today.
```

Returns

- Polarity
- Sentiment
- Confidence Score

---

## Book Appointment

```http
POST /booking
```

---

## View Appointments

```http
GET /appointments
```

---

# 📈 Future Improvements

- User authentication
- Email appointment confirmation
- Admin dashboard
- Therapist portal
- Live chat with professionals
- Voice interaction
- AI-powered personalized recommendations
- Mobile application
- Multi-language support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push to your branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

**Joy Njoroge**

GitHub:
https://github.com/JoyNjoroge383

---

# 🙏 Acknowledgements

- Flask
- React
- Vite
- Scikit-learn
- NLTK
- Python Community
- Open-source contributors

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.

It helps others discover the project and supports future improvements.