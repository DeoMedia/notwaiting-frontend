// Visually hidden honeypot field. Bots fill every input; real users never
// touch this. The backend's abuseGuard middleware silently rejects any
// submission where this field is non-empty.
type Props = {
  value: string
  onChange: (v: string) => void
  name?: string
}

export function Honeypot({ value, onChange, name = 'company' }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      <label htmlFor={`hp-${name}`}>Leave this field empty</label>
      <input
        id={`hp-${name}`}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
