import { Link } from 'react-router-dom'
import PageLayout from './PageLayout'
import { SectionHeading } from './SectionHeading'

const channels = [
  { icon: '✉️', label: 'Email', value: 'njorogejoywairimu@gmail.com', href: 'mailto:njorogejoywairimu@gmail.com' },
  { icon: '📱', label: 'Phone', value: '0743 111 688', href: 'tel:+254743111688' },
  { icon: '📍', label: 'Location', value: 'Nairobi, Kenya', href: null },
]

export default function Contact() {
  return (
    <PageLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Contact"
            title="We're here to help"
            subtitle="Have a question or need support? Reach out and we usually respond within 24 hours."
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
    </PageLayout>
  )
}
