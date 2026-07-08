import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X, HeartHandshake } from "lucide-react";

/**
 * Header
 * -----------------------------------------------------------------------
 * Matches the app's existing look: soft indigo/purple/pink gradient world,
 * translucent "glass" surfaces (bg-white/70 + backdrop-blur), rounded-full
 * pill buttons, indigo->purple gradient wordmark.
 *
 * Fixed to the top of the viewport. Collapses to a hamburger + slide-in
 * panel below the md breakpoint.
 * -----------------------------------------------------------------------
 */

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Therapists", to: "/therapists" },
  { label: "Resources", to: "/resources" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const onKey = (e) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [open]);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-indigo-700" : "text-gray-600 hover:text-indigo-600"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md shadow-md border-b border-white/60"
            : "bg-white/60 backdrop-blur-sm border-b border-white/40"
        }`}
      >
        <nav className="container mx-auto px-4 flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="text-xl font-bold text-gray-800 shrink-0"
          >
            Mind
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Care
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <NavLink to={to} className={linkClass} end={to === "/"}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/booking"
              className="px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              Book Appointment
            </Link>
            <Link
              to="/donate"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <HeartHandshake size={16} strokeWidth={2.5} />
              Donate
            </Link>
          </div>

          {/* Hamburger — small devices only */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-panel"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden relative z-50 flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-white/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile slide-in panel */}
      <div
        id="mobile-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`md:hidden fixed top-0 right-0 z-40 h-full w-[80%] max-w-xs bg-white/95 backdrop-blur-md border-l border-white/60 pt-20 px-6 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map(({ label, to }, i) => (
            <li
              key={label}
              className="transition-all duration-300"
              style={{
                transitionDelay: open ? `${i * 60}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(12px)",
              }}
            >
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-3.5 border-b border-gray-100 text-base font-medium ${
                    isActive ? "text-indigo-700" : "text-gray-700"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/booking"
            onClick={() => setOpen(false)}
            className="text-center px-5 py-3 rounded-full bg-green-600 text-white text-sm font-semibold shadow-sm"
          >
            Book Appointment
          </Link>
          <Link
            to="/donate"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold shadow-sm"
          >
            <HeartHandshake size={16} strokeWidth={2.5} />
            Donate
          </Link>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-gray-500">
          Support available 24/7 — you don't have to face this alone.
        </p>
      </div>
    </>
  );
}
