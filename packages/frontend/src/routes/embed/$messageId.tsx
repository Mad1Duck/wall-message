import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { messagesApi } from '#/features/messages'
import { applyThemeMode, type ThemeMode } from '#/lib/theme'
import { Sun, Moon, Monitor } from 'lucide-react'

export const Route = createFileRoute('/embed/$messageId')({
  validateSearch: (s: Record<string, unknown>) => ({
    theme: (s.theme as string) || 'auto',
    bg: (s.bg as string) || '',
    surface: (s.surface as string) || '',
    text: (s.text as string) || '',
    border: (s.border as string) || '',
    accent: (s.accent as string) || '',
    radius: (s.radius as string) || '',
    customCss: (s.customCss as string) || '',
  }),
  component: EmbedPage,
})

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: boolean
  created_at: string
  recipient?: string
}

function EmbedPage() {
  const { messageId } = Route.useParams()
  const search = Route.useSearch()
  const { theme } = search
  const navigate = Route.useNavigate()
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('auto')

  useEffect(() => {
    const root = document.documentElement
    if (search.bg) root.style.setProperty('--w-bg', search.bg)
    if (search.surface) root.style.setProperty('--w-surface', search.surface)
    if (search.text) {
      root.style.setProperty('--w-text', search.text)
      root.style.setProperty('--w-text-2', search.text)
    }
    if (search.border) {
      root.style.setProperty('--w-border', search.border)
      root.style.setProperty('--w-border-mid', search.border)
    }
    if (search.accent) root.style.setProperty('--w-text', search.accent)
    if (search.radius) {
      document.querySelectorAll('.rounded-2xl, .rounded-lg').forEach((el) => {
        ;(el as HTMLElement).style.borderRadius = `${search.radius}px`
      })
    }
    if (search.customCss) {
      const styleId = 'custom-embed-css'
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = search.customCss
    }
  }, [search])

  useEffect(() => {
    const t = theme === 'dark' || theme === 'light' ? theme : 'auto'
    setCurrentTheme(t)
    applyThemeMode(t)
  }, [theme])

  const toggleTheme = () => {
    const newTheme: ThemeMode = currentTheme === 'auto' ? 'dark' : currentTheme === 'dark' ? 'light' : 'auto'
    setCurrentTheme(newTheme)
    applyThemeMode(newTheme)
    navigate({ search: { ...search, theme: newTheme } })
  }

  useEffect(() => {
    messagesApi.getById(messageId)
      .then((msg) => {
        if (msg.is_public) {
          setMessage(msg)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [messageId])

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: idLocale,
      })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
        <div className="w-4 h-4 border-2 border-[var(--w-text)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !message) {
    return (
      <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
        <p className="text-[13px] text-[var(--w-text-muted)]">Pesan tidak tersedia.</p>
      </div>
    )
  }

  const wallUrl = message.recipient
    ? `${window.location.origin}/message/${message.recipient}`
    : window.location.origin

  return (
    <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-130 bg-[var(--w-surface)] border border-[var(--w-border)] rounded-2xl overflow-hidden shadow-lg">

        {/* Top branding strip */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-between">
          <span className="text-[9px] text-[var(--w-text-dim)] uppercase tracking-[0.2em]">◆ wall message</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-[var(--w-surface-2)] transition-colors"
            title={currentTheme === 'auto' ? 'Mode Sistem' : currentTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {currentTheme === 'auto' ? (
              <Monitor size={14} className="text-[var(--w-text-muted)]" />
            ) : currentTheme === 'dark' ? (
              <Sun size={14} className="text-[var(--w-text-muted)]" />
            ) : (
              <Moon size={14} className="text-[var(--w-text-muted)]" />
            )}
          </button>
        </div>

        {/* Message body */}
        <div className="px-5 py-4">
          <p className="font-serif italic text-[15px] text-[var(--w-text-2)] leading-[1.65] mb-3">
            {message.content}
          </p>
          <p className="text-[11px] text-[var(--w-text-muted)]">
            — {message.alias}
          </p>
        </div>

        {/* Reply block */}
        {message.reply && (
          <div className="mx-5 mb-4 border-l-2 border-[var(--w-border-mid)] pl-3">
            <p className="text-[12px] text-[var(--w-text-3)] italic leading-relaxed">
              {message.reply}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--w-border)] flex items-center justify-between">
          <span className="text-[10px] text-[var(--w-text-dim)]">
            {formatTime(message.created_at)}
          </span>
          <a
            href={wallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[var(--w-text-dim)] hover:text-[var(--w-text-muted)] transition-colors"
          >
            Kirim pesan anonim →
          </a>
        </div>
      </div>
    </div>
  )
}
