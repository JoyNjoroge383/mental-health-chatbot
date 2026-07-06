import PageLayout from './PageLayout'
import { SectionHeading } from './SectionHeading'

const stats = [
  { value: '10k+', label: 'Conversations' },
  { value: '24/7', label: 'Availability' },
  { value: '2', label: 'Languages' },
  { value: '100%', label: 'Confidential' },
]

export default function About() {
  return (
    <PageLayout>
      <section className="py-20">
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
                simply a difficult day, anytime you need it.
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
    </PageLayout>
  )
}
