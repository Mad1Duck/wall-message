import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSendMessage } from '#/features/messages'
import { applyThemeMode, type ThemeMode } from '#/lib/theme'
import { Sun, Moon, Monitor } from 'lucide-react'

export const Route = createFileRoute('/embed/form/mini-wall')({
  validateSearch: (s: Record<string, unknown>) => ({
    miniWallId: s.miniWallId as string,
    wallId: s.wallId as string,
    theme: (s.theme as string) || 'auto',
    recipient: (s.recipient as string) || '',
  }),
  component: MiniWallFormEmbed,
})

function MiniWallFormEmbed() {
  const { miniWallId, wallId, theme, recipient } = Route.useSearch()
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('auto')
  const [content, setContent] = useState('')
  const [alias, setAlias] = useState('')
  const [useAlias, setUseAlias] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const send = useSendMessage()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Pesan tidak boleh kosong')
      return
    }
    if (!wallId) {
      setError('Wall ID tidak ditemukan')
      return
    }
    if (!miniWallId) {
      setError('Mini Wall ID tidak ditemukan')
      return
    }
    setError('')
    send.mutate(
      {
        wall_id: wallId,
        recipient: recipient || '',
        content: content.trim(),
        alias: useAlias && alias.trim() ? alias.trim() : 'Seseorang yang peduli 🌙',
        mini_wall_id: miniWallId,
      },
      {
        onSuccess: () => {
          setContent('')
          setAlias('')
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        },
        onError: () => {
          setError('Gagal mengirim pesan')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--w-surface)] border border-[var(--w-border)] rounded-2xl overflow-hidden shadow-lg">

        {/* Header */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-between">
          <span className="text-[9px] text-[var(--w-text-dim)] uppercase tracking-[0.2em]">◆ Kirim ke Mini Wall</span>
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

        {/* Form */}
        <div className="px-5 py-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis pesanmu di sini..."
              className="w-full min-h-24 px-3 py-2 bg-[var(--w-bg)] border border-[var(--w-border-mid)] rounded-lg text-[13px] text-[var(--w-text)] placeholder:text-[var(--w-text-dim)] resize-none focus:outline-none focus:border-[var(--w-text-muted)] transition-colors"
              maxLength={500}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAlias"
                checked={useAlias}
                onChange={(e) => setUseAlias(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--w-border-mid)] accent-[var(--w-text)]"
              />
              <label htmlFor="useAlias" className="text-[11px] text-[var(--w-text-muted)]">
                Gunakan nama lain
              </label>
            </div>

            {useAlias && (
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Nama kamu (opsional)"
                className="w-full px-3 py-2 bg-[var(--w-bg)] border border-[var(--w-border-mid)] rounded-lg text-[13px] text-[var(--w-text)] placeholder:text-[var(--w-text-dim)] focus:outline-none focus:border-[var(--w-text-muted)] transition-colors"
                maxLength={100}
              />
            )}

            <button
              type="submit"
              disabled={send.isPending}
              className="w-full px-4 py-2.5 bg-[var(--w-text)] text-[var(--w-bg)] rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {send.isPending ? 'Mengirim...' : 'Kirim Pesan'}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-[11px] text-red-500 text-center">{error}</p>
          )}

          {success && (
            <p className="mt-3 text-[11px] text-green-500 text-center">Pesan berhasil dikirim!</p>
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
