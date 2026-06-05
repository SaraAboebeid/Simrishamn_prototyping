// ── Shared UI primitives for sidebar sub-components ──────────────

export function SectionLabel({ children }) {
  return <p className="section-label">{children}</p>
}

export function Divider() {
  return <div className="border-t border-dash-600 my-4" />
}

export function Toggle({ checked, onChange, color = '#FF6B35', disabled = false }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ backgroundColor: checked ? color : '#2D3A52' }}
      aria-pressed={checked}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}
