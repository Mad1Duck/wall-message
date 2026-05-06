import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { applyThemeMode, type ThemeMode } from '#/lib/theme'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem('theme')
  return (stored === 'light' || stored === 'dark' || stored === 'auto') ? stored : 'dark'
}

const CYCLE: ThemeMode[] = ['dark', 'light', 'auto']
const LABELS: Record<ThemeMode, string> = { dark: 'Gelap', light: 'Terang', auto: 'Sistem' }
const ICONS: Record<ThemeMode, React.ReactNode> = {
  dark: <Moon size={14} />,
  light: <Sun size={14} />,
  auto: <Monitor size={14} />,
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>('auto')

  useEffect(() => {
    const m = getInitialMode()
    setMode(m)
    applyThemeMode(m)
  }, [])

  useEffect(() => {
    if (mode !== 'auto') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeMode('auto')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  function toggle() {
    const next = CYCLE[(CYCLE.indexOf(mode) + 1) % CYCLE.length]
    setMode(next)
    applyThemeMode(next)
    window.localStorage.setItem('theme', next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Mode: ${LABELS[mode]}`}
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--w-text-muted)] hover:text-[var(--w-text)] transition-colors ${className}`}
    >
      {ICONS[mode]}
      {LABELS[mode]}
    </button>
  )
}
