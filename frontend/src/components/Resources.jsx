import { Link } from 'react-router-dom'
import PageLayout from './PageLayout'
import { SectionHeading } from './SectionHeading'

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
    link: { label: 'Chat with MindCare', to: '/' },
  },
]

export default function Resources() {
  return (
    <PageLayout>
      <section className="py-20">
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
                <Link to={r.link.to} className="mt-4 text-indigo-600 font-medium text-sm hover:underline">
                  {r.link.label} →
                </Link>
              </div>
            ))}
          </div>
          <div className="max-w-3xl mx-auto mt-10 bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-semibold">In an emergency?</p>
            <p className="text-red-600 text-sm mt-1">
              If you or someone you know is in immediate danger, call your local emergency number,
              or reach us at <a href="tel:+254743111688" className="font-semibold underline">0743 111 688</a>.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
