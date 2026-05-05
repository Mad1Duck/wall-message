import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export const Route = createFileRoute('/embed/$messageId')({
  component: EmbedPage,
})

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: string
  created_at: string
  recipient?: string
}

function EmbedPage() {
  const { messageId } = Route.useParams()
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const url = import.meta.env.VITE_SHEETDB_MESSAGES_URL
    if (!url) { setNotFound(true); setLoading(false); return }

    fetch(`${url}/search?id=${encodeURIComponent(messageId)}`)
      .then((r) => r.json())
      .then((raw) => {
        const items = Array.isArray(raw) ? raw : (raw.data || [])
        const msg = items[0]
        if (msg && msg.is_public === 'TRUE') {
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !message) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[13px] text-[#444444]">Pesan tidak tersedia.</p>
      </div>
    )
  }

  const wallUrl = message.recipient
    ? `${window.location.origin}/message/${message.recipient}`
    : window.location.origin

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] bg-[#111111] border border-[#1e1e1e] rounded-2xl overflow-hidden">

        {/* Top branding strip */}
        <div className="px-5 pt-4 pb-0 flex items-center gap-2">
          <span className="text-[9px] text-[#2a2a2a] uppercase tracking-[0.2em]">◆ wall message</span>
        </div>

        {/* Message body */}
        <div className="px-5 py-4">
          <p className="font-serif italic text-[15px] text-[#cccccc] leading-[1.65] mb-3">
            {message.content}
          </p>
          <p className="text-[11px] text-[#444444]">
            — {message.alias}
          </p>
        </div>

        {/* Reply block */}
        {message.reply && (
          <div className="mx-5 mb-4 border-l-2 border-[#2a2a2a] pl-3">
            <p className="text-[12px] text-[#888888] italic leading-relaxed">
              {message.reply}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1a1a1a] flex items-center justify-between">
          <span className="text-[10px] text-[#333333]">
            {formatTime(message.created_at)}
          </span>
          <a
            href={wallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#333333] hover:text-[#555555] transition-colors"
          >
            Kirim pesan anonim →
          </a>
        </div>
      </div>
    </div>
  )
}
