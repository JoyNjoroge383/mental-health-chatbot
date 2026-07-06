import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const BOOKING_KEYWORDS = [
  "book", "appointment", "schedule", "session",
  "meet", "therapist", "psychiatrist", "consultation", "visit",
];

function isBookingIntent(text) {
  const lower = text.toLowerCase();
  return BOOKING_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Welcome to Psychiatrist, a safe and supportive space where you can share your thoughts and feelings without fear of judgement.",
      showBooking: true,
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");

    if (isBookingIntent(text)) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "It sounds like you'd like to book an appointment. You can do that here:",
          showBooking: true,
        },
      ]);
      return;
    }

    try {
      const res = await fetch(`/get?msg=${encodeURIComponent(text)}`);
      const reply = await res.text();
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I'm having trouble connecting right now." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl shadow-lg flex items-center justify-center hover:bg-indigo-700 transition"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="absolute bottom-20 right-0 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-3 font-semibold">
            Psychiatrist Bot
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.from === "bot"
                    ? "bg-gray-100 text-gray-800 mr-auto"
                    : "bg-indigo-600 text-white ml-auto"
                }`}
              >
                {msg.text}
                {msg.from === "bot" && msg.showBooking && (
                  <div className="mt-2">
                    <Link to="/booking">
                      <button className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-700">
                        Book Appointment
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your message..."
              className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-indigo-700"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}