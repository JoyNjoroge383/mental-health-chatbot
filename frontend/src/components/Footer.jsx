import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/40 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800">MindCare</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <Link to="/about" className="hover:text-indigo-600 transition-colors">About</Link>
            <Link to="/resources" className="hover:text-indigo-600 transition-colors">Resources</Link>
            <Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
          </nav>
          <p className="text-sm text-gray-500">© 2026 MindCare. You are not alone.</p>
        </div>
      </div>
    </footer>
  )
}
