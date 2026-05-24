export interface Sector {
  value: string
  label: string
  color: string
  text: string
}

export const SECTORS: Sector[] = [
  { value: 'fintech',      label: 'Fintech',      color: '#EBBD06', text: '#0C0C0A' },
  { value: 'agriculture',  label: 'Agriculture',  color: '#EBBD06', text: '#0C0C0A' },
  { value: 'music',        label: 'Music',        color: '#DD3935', text: '#fff' },
  { value: 'health',       label: 'Health',       color: '#0145F2', text: '#fff' },
  { value: 'tech',         label: 'Tech',         color: '#0C0C0A', text: '#fff' },
  { value: 'education',    label: 'Education',    color: '#EBBD06', text: '#0C0C0A' },
  { value: 'climate',      label: 'Climate',      color: '#0145F2', text: '#fff' },
  { value: 'media',        label: 'Media',        color: '#DD3935', text: '#fff' },
  { value: 'fashion',      label: 'Fashion',      color: '#0145F2', text: '#fff' },
  { value: 'sports',       label: 'Sports',       color: '#DD3935', text: '#fff' },
  { value: 'film',         label: 'Film',         color: '#0C0C0A', text: '#fff' },
  { value: 'policy',       label: 'Policy',       color: '#0C0C0A', text: '#fff' },
  { value: 'other',        label: 'Other',        color: '#18027a', text: '#fff' },
]

export const SECTOR_MAP = Object.fromEntries(SECTORS.map(s => [s.value, s]))

export const SECTOR_VALUES = SECTORS.map(s => s.value)

// Ticker uses only the named sectors (no "other")
export const TICKER_SECTORS = SECTOR_VALUES.filter(v => v !== 'other')
