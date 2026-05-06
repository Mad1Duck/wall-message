import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useMessages } from '#/features/messages'
import { applyThemeMode, type ThemeMode } from '#/lib/theme'
import { Sun, Moon, Monitor } from 'lucide-react'

export const Route = createFileRoute('/embed/display/wall')({
  validateSearch: (s: Record<string, unknown>) => ({
    wallId: s.wallId as string,
    theme: (s.theme as string) || 'auto',
    limit: Number(s.limit || 10),
  }),
  component: WallDisplayEmbed,
})

function WallDisplayEmbed() {
  const { wallId, theme, limit } = Route.useSearch()
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('auto')

  const { data: messages, isLoading, error } = useMessages(wallId)

  useEffect(() => {
    const t = theme === 'dark' || theme === 'light' ? theme : 'auto'
    setCurrentTheme(t)
    applyThemeMode(t)
  }, [theme])

  const toggleTheme = () => {
    const newTheme: ThemeMode = currentTheme === 'auto' ? 'dark' : currentTheme === 'dark' ? 'light' : 'auto'
    setCurrentTheme(newTheme)
    applyThemeMode(newTheme)
  }

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

  const displayMessages = messages?.slice(0, limit) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
        <div className="w-4 h-4 border-2 border-[var(--w-text)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
        <p className="text-[13px] text-[var(--w-text-muted)]">Gagal memuat pesan.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--w-surface)] border border-[var(--w-border)] rounded-2xl overflow-hidden shadow-lg">

        {/* Header */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-between">
          <span className="text-[9px] text-[var(--w-text-dim)] uppercase tracking-[0.2em]">◆ Pesan</span>
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

        {/* Messages */}
        <div className="px-5 py-4 space-y-3 max-h-96 overflow-y-auto">
          {displayMessages.length === 0 ? (
            <p className="text-[13px] text-[var(--w-text-muted)] text-center py-8">
              Belum ada pesan
            </p>
          ) : (
            displayMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 bg-[var(--w-bg)] border border-[var(--w-border-mid)] rounded-lg"
              >
                <p className="font-serif italic text-[13px] text-[var(--w-text-2)] leading-relaxed mb-2">
                  {msg.content}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[var(--w-text-muted)]">
                    — {msg.alias}
                  </p>
                  <p className="text-[9px] text-[var(--w-text-dim)]">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
                {msg.reply && (
                  <div className="mt-2 pt-2 border-t border-[var(--w-border-mid)]">
                    <p className="text-[11px] text-[var(--w-text-3)] italic">
                      {msg.reply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--w-border)]">
          <p className="text-[9px] text-[var(--w-text-dim)] text-center">
            Powered by Wall Message
          </p>
        </div>
      </div>
    </div>
  )
}
