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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Mental Health Support</h1>
            <p className="text-xl text-gray-600 mb-8">
              A safe space to share your thoughts and feelings without judgment.
              Our AI-powered assistant is here to listen and support you.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <FeatureCard icon="🛡️" title="Safe & Private" description="Your conversations are confidential and secure" />
              <FeatureCard icon="🤖" title="AI-Powered" description="Advanced NLP for better understanding" />
              <FeatureCard icon="🌍" title="Multilingual" description="Supports English and Swahili" />
            </div>
            <div className="mt-12 flex justify-center gap-4 flex-wrap">
              <Link
                to="/booking"
                className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-full"
              >
                Book Appointment
              </Link>
              <Link
                to="/appointments"
                className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-full"
              >
                View Appointments
              </Link>
              <Link
                to="/donate"
                className="px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-full"
              >
                💚 Donate
              </Link>
              <Link
                to="/journal"
                className="px-8 py-4 bg-pink-500 text-white text-lg font-semibold rounded-full"
              >
                📓 Journal
              </Link>
              <Link
                to="/therapists"
                className="px-8 py-4 bg-teal-500 text-white text-lg font-semibold rounded-full"
              >
                🏥 Find Therapist
              </Link>
            </div>
          </div>
        </main>
      </div>
      <ChatBot />
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

export default App