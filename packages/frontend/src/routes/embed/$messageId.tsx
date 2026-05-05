import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { messagesApi } from '#/features/messages'
import { applyThemeMode } from '#/lib/theme'

export const Route = createFileRoute('/embed/$messageId')({
  validateSearch: (s: Record<string, unknown>) => ({ theme: (s.theme as string) || 'auto' }),
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
  const { theme } = Route.useSearch()
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const t = theme === 'dark' || theme === 'light' ? theme : 'auto'
    applyThemeMode(t)
  }, [theme])

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
      <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[var(--w-text)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !message) {
    return (
      <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center">
        <p className="text-[13px] text-[var(--w-text-muted)]">Pesan tidak tersedia.</p>
      </div>
    )
  }

  const wallUrl = message.recipient
    ? `${window.location.origin}/message/${message.recipient}`
    : window.location.origin

  return (
    <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-130 bg-[var(--w-surface)] border border-[var(--w-border)] rounded-2xl overflow-hidden">

        {/* Top branding strip */}
        <div className="px-5 pt-4 pb-0 flex items-center gap-2">
          <span className="text-[9px] text-[var(--w-text-dim)] uppercase tracking-[0.2em]">◆ wall message</span>
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
