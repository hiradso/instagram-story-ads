export function Spinner({ label }: { label?: string }) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-3 py-16">
      <span className="loader-dots text-lg">
        <span />
        <span />
        <span />
      </span>
      {label && <span className="text-sm text-faint">{label}</span>}
    </div>
  )
}
