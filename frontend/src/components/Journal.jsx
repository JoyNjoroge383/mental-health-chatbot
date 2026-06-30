import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😤", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😕", label: "Confused" },
  { emoji: "💪", label: "Strong" },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState(null);
  const [view, setView] = useState("write"); // "write" or "history"

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("journal_entries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("journal_entries", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setStatus({ type: "error", message: "Please write something before saving." });
      return;
    }
    if (!mood) {
      setStatus({ type: "error", message: "Please select your mood." });
      return;
    }

    const entry = {
      id: Date.now(),
      title: title.trim() || "Untitled Entry",
      text: text.trim(),
      mood,
      date: new Date().toLocaleDateString("en-KE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: new Date().toLocaleTimeString("en-KE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setEntries((prev) => [entry, ...prev]);
    setTitle("");
    setText("");
    setMood(null);
    setStatus({ type: "success", message: "Journal entry saved!" });
    setTimeout(() => setStatus(null), 3000);
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📓</div>
          <h1 className="text-3xl font-bold text-gray-800">My Journal</h1>
          <p className="text-gray-500 mt-2">
            A private space to write your thoughts and track your progress.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/80 rounded-xl p-1 mb-6 shadow-sm">
          <button
            onClick={() => setView("write")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              view === "write"
                ? "bg-indigo-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✍️ Write Entry
          </button>
          <button
            onClick={() => setView("history")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              view === "history"
                ? "bg-indigo-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📚 Past Entries ({entries.length})
          </button>
        </div>

        {/* Write Entry */}
        {view === "write" && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            {status && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium text-center ${
                status.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A tough day at work..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Mood selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition text-xs font-medium ${
                        mood?.label === m.label
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      <span className="text-2xl mb-1">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What's on your mind?
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write freely — this is your private space..."
                  rows={6}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Save Entry
              </button>
            </form>
          </div>
        )}

        {/* Past Entries */}
        {view === "history" && (
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p>No journal entries yet. Start writing!</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{entry.mood.emoji}</span>
                        <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {entry.date} at {entry.time}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.text}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                      {entry.mood.label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Back to home */}
        <div className="text-center mt-8">
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}