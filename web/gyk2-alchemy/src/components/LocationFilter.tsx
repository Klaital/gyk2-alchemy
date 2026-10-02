interface Props {
  locations: string[]
  excluded: Set<string>
  onChange: (excluded: Set<string>) => void
}

export function LocationFilter({ locations, excluded, onChange }: Props) {
  if (locations.length === 0) return null

  function toggle(loc: string) {
    const next = new Set(excluded)
    if (next.has(loc)) next.delete(loc)
    else next.add(loc)
    onChange(next)
  }

  return (
    <section className="location-filter">
      <span className="location-filter-label">Exclude locations:</span>
      <div className="location-chips">
        {locations.map(loc => (
          <button
            key={loc}
            className={`location-chip${excluded.has(loc) ? ' excluded' : ''}`}
            onClick={() => toggle(loc)}
          >
            {loc}
          </button>
        ))}
      </div>
    </section>
  )
}
