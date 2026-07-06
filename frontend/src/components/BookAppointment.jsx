import { useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

export default function BookAppointment() {
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append("name", form.name);
      body.append("email", form.email);
      body.append("date", form.date);
      body.append("time", form.time);

      const res = await fetch(apiUrl("/booking"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (res.ok) {
        setConfirmed({ ...form });
        setForm({ name: "", email: "", date: "", time: "" });
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const h12 = ((hour + 11) % 12) + 1;
    return `${h12}:${m} ${suffix}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
            🗓️
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Book an Appointment</h2>
          <p className="text-gray-500 text-sm mt-1">
            Schedule a session with one of our counselors.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium text-center bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Jane Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Booking...
              </>
            ) : (
              "Book Appointment"
            )}
          </button>

          <div className="text-center">
            <Link to="/" className="text-sm text-indigo-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </form>
      </div>

      {confirmed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in"
          onClick={() => setConfirmed(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-9 h-9 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Appointment Confirmed!</h3>
            <p className="text-gray-500 text-sm mt-1">
              Thanks, {confirmed.name.split(" ")[0]}. We've booked your session.
            </p>

            <div className="mt-5 text-left bg-indigo-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-800 text-right">{formatDate(confirmed.date)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-800">{formatTime(confirmed.time)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Confirmation</span>
                <span className="font-medium text-gray-800 text-right break-all">{confirmed.email}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              A confirmation has been sent to your email.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/appointments"
                className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition"
              >
                View My Appointments
              </Link>
              <button
                onClick={() => setConfirmed(null)}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
