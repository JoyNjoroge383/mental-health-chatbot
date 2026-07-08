import { useState, useEffect, useRef } from "react";
import { Menu, X, MessageCircle, Calendar, HeartHandshake, Compass, Info } from "lucide-react";

/**
 * MindCare Navbar
 * -----------------------------------------------------------------------
 * Design tokens (kept here so the whole thing is copy-pasteable as one file)
 *
 * Color:
 *   --ink-deep    #0B3D3A   deep teal — navbar surface, grounds the calm/trust feel
 *   --ink-deeper  #082B29   scrolled/backdrop shade
 *   --ivory       #F4F1EB   primary text on dark
 *   --sage        #8FBFAF   secondary text / hover state
 *   --coral       #FF8B66   single warm accent — reserved for the donate CTA + breathing dot
 *   --hairline    rgba(244,241,235,0.12)
 *
 * Type:
 *   Display  — Fraunces (italic accent on wordmark)
 *   UI/body  — Inter
 *
 * Signature element: the small dot beside the wordmark "breathes" — a slow
 * 4s scale pulse that nods to breathing/grounding exercises common in
 * mental health apps, without leaning on a generic gradient-blob look.
 * -----------------------------------------------------------------------
 */

const NAV_LINKS = [
  { label: "Home", href: "#home", icon: Compass },
  { label: "Chat", href: "#chat", icon: MessageCircle },
  { label: "Appointments", href: "#appointments", icon: Calendar },
  { label: "About", href: "#about", icon: Info },
];

export default function MindCareNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  // Shrink / darken the bar slightly once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + close on Escape while the mobile panel is open
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

  return (
    <div className="min-h-[560px] w-full bg-[#0E1613]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap');
        .mc-display { font-family: 'Fraunces', serif; }
        .mc-ui { font-family: 'Inter', sans-serif; }
        @keyframes mc-breathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        .mc-dot { animation: mc-breathe 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mc-dot { animation: none; }
        }
        .mc-link-underline {
          position: relative;
        }
        .mc-link-underline::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 1px;
          width: 0%;
          background: #FF8B66;
          transition: width 0.25s ease;
        }
        .mc-link-underline:hover::after,
        .mc-link-underline:focus-visible::after {
          width: 100%;
        }
      `}</style>

      <header
        className={`mc-ui fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-[#082B29]/95 backdrop-blur-sm border-white/10 py-2"
            : "bg-[#0B3D3A] border-transparent py-4"
        }`}
      >
        <nav className="mx-auto max-w-6xl px-5 flex items-center justify-between">
          {/* Wordmark */}
          <a
            href="#home"
            className="flex items-center gap-2.5 shrink-0 group"
            onClick={() => setOpen(false)}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="mc-dot absolute inline-flex h-full w-full rounded-full bg-[#FF8B66]" />
            </span>
            <span className="mc-display text-[1.35rem] leading-none text-[#F4F1EB]">
              Mind<em className="text-[#FF8B66] not-italic font-medium italic">Care</em>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="mc-link-underline text-sm text-[#EAE7E0]/85 hover:text-[#F4F1EB] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#donate"
              className="flex items-center gap-1.5 rounded-full bg-[#FF8B66] text-[#0B3D3A] text-sm font-semibold px-4 py-2 hover:bg-[#ffa483] transition-colors"
            >
              <HeartHandshake size={16} strokeWidth={2.5} />
              Donate
            </a>
          </div>

          {/* Hamburger — small devices only */}
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mc-mobile-panel"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden relative z-50 flex h-9 w-9 items-center justify-center rounded-full text-[#F4F1EB] hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF8B66]"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile slide-in panel */}
      <div
        id="mc-mobile-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`md:hidden fixed top-0 right-0 z-40 h-full w-[78%] max-w-xs bg-[#0B3D3A] border-l border-white/10 pt-20 px-6 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href, icon: Icon }, i) => (
            <li
              key={label}
              className="transition-all duration-300"
              style={{
                transitionDelay: open ? `${i * 60}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(12px)",
              }}
            >
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-3.5 border-b border-white/10 text-[#F4F1EB] mc-ui text-base"
              >
                <Icon size={18} className="text-[#8FBFAF]" strokeWidth={2} />
                {label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#donate"
          onClick={() => setOpen(false)}
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#FF8B66] text-[#0B3D3A] font-semibold py-3 text-sm"
        >
          <HeartHandshake size={16} strokeWidth={2.5} />
          Donate via M-Pesa
        </a>

        <p className="mc-ui mt-8 text-xs leading-relaxed text-[#8FBFAF]/70">
          A safe, supportive space — available whenever you need to talk.
        </p>
      </div>

      {/* ---- demo page content so the fixed navbar has something to sit above ---- */}
      <main className="pt-32 px-6 max-w-3xl mx-auto text-[#EAE7E0]">
        <h1 className="mc-display text-3xl text-[#F4F1EB] mb-3">
          Try resizing the window
        </h1>
        <p className="mc-ui text-[#8FBFAF] leading-relaxed">
          Above ~768px you'll see the full desktop nav. Shrink the viewport
          (or view on a phone) and the links collapse behind the hamburger
          icon in the top right, opening a slide-in panel.
        </p>
      </main>
    </div>
  );
}
