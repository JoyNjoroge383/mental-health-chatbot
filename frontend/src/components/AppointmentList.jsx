import { useState, useEffect } from "react";
import { apiUrl } from "../lib/api";
import PageLayout from "./PageLayout";

export default function AppointmentList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/bookings_json"))
      .then((r) => r.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      });
  }, []);

  return (
    <PageLayout>
      <div className="px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Booked Appointments</h2>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading appointments...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">No appointments booked yet.</p>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr
                    key={b.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-indigo-50"}
                  >
                    <td className="px-4 py-3">{b.id}</td>
                    <td className="px-4 py-3">{b.name}</td>
                    <td className="px-4 py-3">{b.email}</td>
                    <td className="px-4 py-3">{b.date}</td>
                    <td className="px-4 py-3">{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
    </PageLayout>
  );
}