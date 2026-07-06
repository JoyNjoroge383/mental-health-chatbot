import { Routes, Route, Link } from 'react-router-dom'
import ChatBot from './components/ChatBot'
import Header from './components/Header'
import AnimatedBackground from './components/AnimatedBackground'
import BookAppointment from './components/BookAppointment'
import AppointmentList from './components/AppointmentList'
import Donate from './components/Donate'
import Journal from './components/Journal'
import Therapists from './components/Therapists'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/booking" element={<BookAppointment />} />
      <Route path="/appointments" element={<AppointmentList />} />
      <Route path="/donate" element={<Donate />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/therapists" element={<Therapists />} />
    </Routes>
  )
}

function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden scroll-smooth">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />

        {/* Hero */}
        <main className="container mx-auto px-4 pt-16 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-indigo-700 text-sm font-medium shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></span>
              Support available 24/7
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Mental Health <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Support</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A safe space to share your thoughts and feelings without judgment.
              Our AI-powered assistant is here to listen and support you.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <FeatureCard icon="🛡️" title="Safe & Private" description="Your conversations are confidential and secure" />
              <FeatureCard icon="🤖" title="AI-Powered" description="Advanced NLP for better understanding" />
              <FeatureCard icon="🌍" title="Multilingual" description="Supports English and Swahili" />
            </div>
            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <QuickLink to="/booking" color="bg-green-600 hover:bg-green-700">Book Appointment</QuickLink>
              <QuickLink to="/appointments" color="bg-indigo-600 hover:bg-indigo-700">View Appointments</QuickLink>
              <QuickLink to="/donate" color="bg-purple-600 hover:bg-purple-700">💚 Donate</QuickLink>
              <QuickLink to="/journal" color="bg-pink-500 hover:bg-pink-600">📓 Journal</QuickLink>
              <QuickLink to="/therapists" color="bg-teal-500 hover:bg-teal-600">🏥 Find Therapist</QuickLink>
            </div>
          </div>
        </main>

        <About />
        <Resources />
        <Contact />
        <Footer />
      </div>
      <ChatBot />
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function QuickLink({ to, color, children }) {
  return (
    <Link
      to={to}
      className={`px-8 py-4 ${color} text-white text-lg font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
    >
      {children}
    </Link>
  )
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
    </div>
  )
}

function About() {
  const stats = [
    { value: '10k+', label: 'Conversations' },
    { value: '24/7', label: 'Availability' },
    { value: '2', label: 'Languages' },
    { value: '100%', label: 'Confidential' },
  ]
  return (
    <section id="about" className="scroll-mt-24 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="About Us"
          title="Compassionate care, powered by technology"
          subtitle="MindCare blends empathetic conversation with clinical resources to make mental health support accessible to everyone."
        />
        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/60">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h3>
            <p className="text-gray-600 mb-4">
              We believe no one should face their struggles alone. MindCare offers a
              judgment-free space where you can talk through anxiety, stress, or
              simply a difficult day — anytime you need it.
            </p>
            <p className="text-gray-600">
              When you need more, we help you book a session with a qualified
              therapist and connect you to trusted mental health resources.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Resources() {
  const resources = [
    {
      icon: '📞',
      title: 'Crisis Helplines',
      description: 'Immediate, confidential support when you need someone to talk to right now.',
      link: { label: 'View helplines', to: '/therapists' },
    },
    {
      icon: '🏥',
      title: 'Find a Therapist',
      description: 'Browse qualified mental health professionals and book a session.',
      link: { label: 'Find a therapist', to: '/therapists' },
    },
    {
      icon: '📓',
      title: 'Guided Journaling',
      description: 'Track your mood and reflect with prompts designed to build self-awareness.',
      link: { label: 'Start journaling', to: '/journal' },
    },
    {
      icon: '🧘',
      title: 'Self-Care Tools',
      description: 'Breathing exercises, grounding techniques, and coping strategies you can use anytime.',
      link: { label: 'Chat with MindCare', to: null },
    },
  ]
  return (
    <section id="resources" className="scroll-mt-24 py-20 bg-white/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Resources"
          title="Tools and support, in one place"
          subtitle="Whether you're in crisis or just want to check in with yourself, we've got resources for every step."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {resources.map((r) => (
            <div key={r.title} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-4">{r.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{r.title}</h3>
              <p className="text-gray-600 text-sm flex-1">{r.description}</p>
              {r.link.to ? (
                <Link to={r.link.to} className="mt-4 text-indigo-600 font-medium text-sm hover:underline">
                  {r.link.label} →
                </Link>
              ) : (
                <span className="mt-4 text-gray-400 font-medium text-sm">{r.link.label} →</span>
              )}
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto mt-10 bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-semibold">In an emergency?</p>
          <p className="text-red-600 text-sm mt-1">
            If you or someone you know is in immediate danger, call your local emergency number,
            or reach Kenya's Befrienders line at <a href="tel:+254722178177" className="font-semibold underline">+254 722 178 177</a>.
          </p>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const channels = [
    { icon: '✉️', label: 'Email', value: 'support@mindcare.health', href: 'mailto:support@mindcare.health' },
    { icon: '📱', label: 'Phone', value: '+254 722 178 177', href: 'tel:+254722178177' },
    { icon: '📍', label: 'Location', value: 'Nairobi, Kenya', href: null },
  ]
  return (
    <section id="contact" className="scroll-mt-24 py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Contact"
          title="We're here to help"
          subtitle="Have a question or need support? Reach out — we usually respond within 24 hours."
        />
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {channels.map((c) => (
            <div key={c.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-sm text-gray-500">{c.label}</div>
              {c.href ? (
                <a href={c.href} className="text-gray-800 font-semibold hover:text-indigo-600 transition-colors break-all">{c.value}</a>
              ) : (
                <div className="text-gray-800 font-semibold">{c.value}</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">Prefer to talk it through right now?</p>
          <Link
            to="/booking"
            className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200"
          >
            Book an Appointment
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800">MindCare</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="#resources" className="hover:text-indigo-600 transition-colors">Resources</a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">Contact</a>
          </nav>
          <p className="text-sm text-gray-500">© 2026 MindCare. You are not alone.</p>
        </div>
      </div>
    </footer>
  )
}

export default App
