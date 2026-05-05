import { useCallback, useEffect, useState } from 'react'

export type ThemeMode = 'dark' | 'light' | 'auto'

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode
  root.classList.remove('dark', 'light')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  if (mode === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', mode)
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'auto'
    const stored = localStorage.getItem('theme')
    return (stored === 'dark' || stored === 'light' || stored === 'auto') ? stored : 'auto'
  })

  useEffect(() => {
    applyTheme(mode)
    localStorage.setItem('theme', mode)
  }, [mode])

  const cycle = useCallback(() => {
    setMode((prev) => prev === 'dark' ? 'light' : prev === 'light' ? 'auto' : 'dark')
  }, [])

  return { mode, setMode, cycle }
}
