import { useState } from "react";
import { Link } from "react-router-dom";

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function Donate() {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const amount = custom ? parseInt(custom) : selected;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      setStatus({ type: "error", message: "Please select or enter a valid amount." });
      return;
    }
    if (!phone || phone.length < 10) {
      setStatus({ type: "error", message: "Please enter a valid M-Pesa phone number." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/mpesa/stk_push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: data.message });
        setPhone("");
        setCustom("");
        setSelected(null);
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💚</div>
          <h2 className="text-2xl font-bold text-gray-800">Support MindCare</h2>
          <p className="text-gray-500 text-sm mt-1">
            Your donation helps us provide free mental health support to those who need it most.
          </p>
        </div>

        {status && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium text-center ${
            status.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Preset amounts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Amount (Ksh)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setSelected(amt); setCustom(""); }}
                  className={`py-2 rounded-lg text-sm font-semibold border transition ${
                    selected === amt && !custom
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  Ksh {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or Enter Custom Amount (Ksh)
            </label>
            <input
              type="number"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
              placeholder="e.g. 250"
              min="1"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              You will receive an M-Pesa prompt on this number to complete the payment.
            </p>
          </div>

          {/* Selected amount summary */}
          {amount > 0 && (
            <div className="bg-indigo-50 rounded-lg px-4 py-3 text-sm text-indigo-700 font-medium text-center">
              You are donating Ksh {amount?.toLocaleString()}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Donate via M-Pesa"}
          </button>

          <div className="text-center">
            <Link to="/" className="text-sm text-indigo-600 hover:underline">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}