// ── Shared UI primitives for sidebar sub-components ──────────────

export function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>
}

export function Divider() {
  return <div className="border-t border-dash-600 my-4" />
}

export function Toggle({ checked, onChange, color = '#FFCD00' }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ backgroundColor: checked ? color : '#3A1E24' }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
      />
    </button>
  )
}
