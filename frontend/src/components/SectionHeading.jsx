export function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
    </div>
  )
}

export default SectionHeading
