import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "./PageLayout";

const THERAPISTS = [
  {
    id: 1,
    name: "Dr. Amina Oduya",
    title: "Clinical Psychologist",
    specialization: ["Depression", "Anxiety", "Trauma"],
    location: "Nairobi, Westlands",
    phone: "+254 700 000 001",
    email: "amina.oduya@mindcare.ke",
    available: "Mon - Fri, 8am - 5pm",
    languages: ["English", "Swahili"],
    image: "👩🏾‍⚕️",
    verified: true,
  },
  {
    id: 2,
    name: "Dr. James Kariuki",
    title: "Psychiatrist",
    specialization: ["Bipolar Disorder", "Schizophrenia", "PTSD"],
    location: "Nairobi, Karen",
    phone: "+254 700 000 002",
    email: "james.kariuki@mindcare.ke",
    available: "Mon - Sat, 9am - 6pm",
    languages: ["English", "Swahili", "Kikuyu"],
    image: "👨🏾‍⚕️",
    verified: true,
  },
  {
    id: 3,
    name: "Ms. Grace Wanjiku",
    title: "Counselling Psychologist",
    specialization: ["Relationships", "Grief", "Self-esteem"],
    location: "Nairobi, Kilimani",
    phone: "+254 700 000 003",
    email: "grace.wanjiku@mindcare.ke",
    available: "Tue - Sat, 10am - 7pm",
    languages: ["English", "Swahili"],
    image: "👩🏾‍⚕️",
    verified: true,
  },
  {
    id: 4,
    name: "Mr. Brian Otieno",
    title: "Addiction Counsellor",
    specialization: ["Addiction", "Substance Abuse", "Anxiety"],
    location: "Kisumu, Milimani",
    phone: "+254 700 000 004",
    email: "brian.otieno@mindcare.ke",
    available: "Mon - Fri, 8am - 4pm",
    languages: ["English", "Swahili", "Dholuo"],
    image: "👨🏾‍⚕️",
    verified: true,
  },
  {
    id: 5,
    name: "Dr. Fatuma Hassan",
    title: "Child & Adolescent Psychiatrist",
    specialization: ["ADHD", "Autism", "Childhood Trauma"],
    location: "Mombasa, Nyali",
    phone: "+254 700 000 005",
    email: "fatuma.hassan@mindcare.ke",
    available: "Mon - Fri, 9am - 5pm",
    languages: ["English", "Swahili", "Arabic"],
    image: "👩🏾‍⚕️",
    verified: true,
  },
  {
    id: 6,
    name: "Mr. Peter Mutua",
    title: "Cognitive Behavioral Therapist",
    specialization: ["OCD", "Phobias", "Depression"],
    location: "Nairobi, Upperhill",
    phone: "+254 700 000 006",
    email: "peter.mutua@mindcare.ke",
    available: "Mon - Sat, 8am - 6pm",
    languages: ["English", "Swahili", "Kamba"],
    image: "👨🏾‍⚕️",
    verified: true,
  },
];

const ALL_SPECIALIZATIONS = [
  "All",
  "Depression",
  "Anxiety",
  "Trauma",
  "Bipolar Disorder",
  "Schizophrenia",
  "PTSD",
  "Relationships",
  "Grief",
  "Addiction",
  "ADHD",
  "Autism",
  "OCD",
  "Phobias",
];

const ALL_LOCATIONS = ["All", "Nairobi", "Kisumu", "Mombasa"];

export default function Therapists() {
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = THERAPISTS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    const matchesSpec =
      specFilter === "All" || t.specialization.includes(specFilter);
    const matchesLocation =
      locationFilter === "All" || t.location.includes(locationFilter);
    return matchesSearch && matchesSpec && matchesLocation;
  });

  return (
    <PageLayout>
      <div className="px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-3xl font-bold text-gray-800">Find a Therapist</h1>
          <p className="text-gray-500 mt-2">
            Connect with verified mental health professionals across Kenya.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-4 mb-6 space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, or specialization..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 mb-1 block">Specialization</label>
              <select
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {ALL_SPECIALIZATIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 mb-1 block">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {ALL_LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} therapist{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p>No therapists found matching your search.</p>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{t.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-lg">{t.name}</h3>
                      {t.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-indigo-600 text-sm font-medium">{t.title}</p>
                    <p className="text-gray-500 text-sm mt-1">📍 {t.location}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {t.specialization.map((s) => (
                        <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelected(selected === t.id ? null : t.id)}
                      className="text-xs text-indigo-600 hover:underline mt-2"
                    >
                      {selected === t.id ? "Hide details ▲" : "View details ▼"}
                    </button>
                    {selected === t.id && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <p className="text-sm text-gray-600">
                          🕐 <span className="font-medium">Available:</span> {t.available}
                        </p>
                        <p className="text-sm text-gray-600">
                          🌐 <span className="font-medium">Languages:</span> {t.languages.join(", ")}
                        </p>
                        <p className="text-sm text-gray-600">
                          📞 <span className="font-medium">Phone:</span>{" "}
                          <a href={`tel:${t.phone}`} className="text-indigo-600 hover:underline">
                            {t.phone}
                          </a>
                        </p>
                        <p className="text-sm text-gray-600">
                          ✉️ <span className="font-medium">Email:</span>{" "}
                          <a href={`mailto:${t.email}`} className="text-indigo-600 hover:underline">
                            {t.email}
                          </a>
                        </p>
                        <Link
                          to="/booking"
                          className="inline-block mt-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full hover:bg-green-700 transition"
                        >
                          Book Appointment
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        </div>
      </div>
    </PageLayout>
  );
}