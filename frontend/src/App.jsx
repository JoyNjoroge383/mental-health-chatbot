import { Routes, Route, Link } from 'react-router-dom'
import ChatBot from './components/ChatBot'
import Header from './components/Header'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import BookAppointment from './components/BookAppointment'
import AppointmentList from './components/AppointmentList'
import Donate from './components/Donate'
import Journal from './components/Journal'
import Therapists from './components/Therapists'
import About from './components/About'
import Resources from './components/Resources'
import Contact from './components/Contact'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<About />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />

        {/* Hero — pt-24 clears the fixed header (h-16) with room to breathe */}
        <main className="container mx-auto px-4 pt-24 pb-12">
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

export default App
