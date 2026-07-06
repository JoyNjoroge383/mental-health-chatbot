function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-white/40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#top" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">MindCare</h1>
              <p className="text-xs text-gray-500">Mental Health Chatbot</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">About</a>
            <a href="#resources" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Resources</a>
            <a href="#contact" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
