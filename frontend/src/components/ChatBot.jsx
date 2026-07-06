import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from '../lib/api'

const BOOKING_KEYWORDS = [
  "book", "appointment", "schedule", "session",
  "meet", "therapist", "psychiatrist", "consultation", "visit",
];

const QUICK_REPLIES = [
  "How are you?",
  "I'm feeling anxious",
  "I need help",
  "Book an appointment",
];

function isBookingIntent(text) {
  const lower = text.toLowerCase();
  return BOOKING_KEYWORDS.some((kw) => lower.includes(kw));
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
      <svg className="w-4 h-4 text-white" viewBox="0 0 640 512" fill="currentColor">
        <path d="M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z" />
      </svg>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi, I'm MindCare 💙 A safe, supportive space to share what's on your mind, no judgement. How are you feeling today?",
      showBooking: true,
      time: now(),
    },
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, loading]);

  const pushMessage = (msg) =>
    setMessages((prev) => [...prev, { time: now(), ...msg }]);

  const send = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || loading) return;

    pushMessage({ from: "user", text });
    setInput("");

    if (isBookingIntent(text)) {
      pushMessage({
        from: "bot",
        text: "It sounds like you'd like to book an appointment. You can do that here:",
        showBooking: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/get?msg=${encodeURIComponent(text)}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reply = await res.text();
      pushMessage({ from: "bot", text: reply });
    } catch {
      pushMessage({
        from: "bot",
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
        >
          💬
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse-slow" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="w-[22rem] max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)] bg-gray-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-black/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <BotAvatar />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold leading-tight">MindCare Assistant</p>
              <p className="text-[11px] text-white/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                Online, here to listen
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition text-lg"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => {
              const isBot = msg.from === "bot";
              return (
                <div
                  key={i}
                  className={`flex items-end gap-2 animate-fade-in ${
                    isBot ? "justify-start" : "justify-end flex-row-reverse"
                  }`}
                >
                  {isBot ? (
                    <BotAvatar />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 text-white text-xs font-bold shadow-sm">
                      You
                    </div>
                  )}
                  <div className="max-w-[78%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isBot
                          ? `bg-white text-gray-800 rounded-bl-md border ${
                              msg.isError ? "border-red-200 bg-red-50 text-red-700" : "border-gray-100"
                            }`
                          : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md"
                      }`}
                    >
                      {msg.text}
                      {isBot && msg.showBooking && (
                        <div className="mt-3">
                          <Link to="/booking" onClick={() => setOpen(false)}>
                            <button className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full hover:shadow-md hover:scale-105 transition">
                              📅 Book Appointment
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                    <p className={`text-[10px] text-gray-400 mt-1 ${isBot ? "text-left" : "text-right"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-end gap-2 animate-fade-in">
                <BotAvatar />
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="typing-indicator flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies (only at the start of a conversation) */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="px-3 py-1.5 text-xs bg-white text-indigo-600 border border-indigo-100 rounded-full hover:bg-indigo-50 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-11 h-11 flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}