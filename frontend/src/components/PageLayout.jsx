import Header from './Header'
import Footer from './Footer'
import AnimatedBackground from './AnimatedBackground'

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col flex-1">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
