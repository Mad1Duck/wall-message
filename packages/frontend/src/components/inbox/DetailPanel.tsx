import { useState } from 'react'

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: boolean
  is_pinned: boolean
  created_at: string
  recipient?: string
}

interface DetailPanelProps {
  message: Message
  pinnedCount: number
  onUpdateReply: (id: string, reply: string, isPublic: boolean) => void
  onTogglePin: (id: string, pin: boolean) => void
  onDeleteMessage: (id: string) => void
}

function relativeTime(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'baru saja'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

export default function DetailPanel({ message, pinnedCount, onUpdateReply, onTogglePin, onDeleteMessage }: DetailPanelProps) {
  const [reply, setReply] = useState(message.reply || '')
  const [isPublic, setIsPublic] = useState(message.is_public)
  const [isEditing, setIsEditing] = useState(!message.reply)
  const [showDelete, setShowDelete] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)

  const embedUrl = `${window.location.origin}/embed/${message.id}`
  const embedCode = `<iframe src="${embedUrl}" width="550" height="200" frameborder="0" scrolling="no" style="border:none;border-radius:16px;overflow:hidden;"></iframe>`

  const handleSave = () => {
    onUpdateReply(message.id, reply, isPublic)
    setIsEditing(false)
  }

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto ">

      {/* Message card */}
      <div className="p-5 border-b border-[var(--w-border-mid)]">
        <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-xl p-4 mb-3">
          <p className="display-title italic text-[15px] text-[var(--w-text-2)] leading-[1.65] mb-3">
            {message.content}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[var(--w-text-dim)] italic">{message.alias}</p>
            <p className="text-[10px] text-[var(--w-text-muted)]">{relativeTime(message.created_at)}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-widest ${
            message.reply
              ? 'border-[var(--w-border-mid)] text-[var(--w-text-muted)]'
              : 'border-[var(--w-border-strong)] text-[var(--w-text-2)]'
          }`}>
            {message.reply ? 'Sudah dibalas' : 'Belum dibalas'}
          </span>
          {message.is_public && (
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-[var(--w-border-mid)] text-[var(--w-text-muted)] uppercase tracking-widest">
              Publik
            </span>
          )}
          {message.is_pinned && (
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-[var(--w-border-mid)] text-[var(--w-text-dim)] uppercase tracking-widest">
              ◆ Disematkan
            </span>
          )}
        </div>
      </div>

      {/* Reply section */}
      <div className="p-5 flex-1 flex flex-col gap-4">

        {/* Existing reply (read state) */}
        {message.reply && !isEditing && (
          <div>
            <p className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.18em] mb-2">Balasanmu</p>
            <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-xl p-4">
              <p className="text-[13px] text-[var(--w-text-2)] italic leading-relaxed">{message.reply}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-[10px] text-[var(--w-text-muted)] hover:text-[var(--w-text)] uppercase tracking-widest transition-colors"
            >
              Edit →
            </button>
          </div>
        )}

        {/* Reply form */}
        {isEditing && (
          <>
            <div>
              <p className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.18em] mb-2">
                {message.reply ? 'Edit Balasan' : 'Tulis Balasan'}
              </p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Tulis balasanmu..."
                className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-xl px-4 py-3 text-[13px] text-[var(--w-text-2)] placeholder-[var(--w-text-muted)] focus:outline-none focus:border-[var(--w-border-strong)] resize-none transition-colors"
                style={{ minHeight: '80px' }}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-xl px-4 py-3">
              <div>
                <p className="text-[12px] text-[var(--w-text-2)] font-medium">Tampilkan di Wall</p>
                <p className="text-[10px] text-[var(--w-text-muted)] mt-0.5">Pesan &amp; balasan terlihat publik</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                style={{ width: 40, height: 22, background: isPublic ? 'var(--w-text)' : 'var(--w-border-mid)' }}
                className="relative rounded-full transition-colors shrink-0"
              >
                <div
                  className="absolute w-4 h-4 bg-[var(--w-bg)] rounded-full transition-transform"
                  style={{ top: 3, left: isPublic ? 20 : 3 }}
                />
              </button>
            </div>

            {/* Pin button — only for public messages */}
            {message.is_public && (
              <div>
                {pinnedCount >= 3 && !message.is_pinned && (
                  <p className="text-[10px] text-[var(--w-text-muted)] mb-2">
                    Maksimal 3 pesan disematkan. Lepas pin salah satu dulu.
                  </p>
                )}
                <button
                  onClick={() => onTogglePin(message.id, !message.is_pinned)}
                  disabled={pinnedCount >= 3 && !message.is_pinned}
                  className={`w-full py-2.5 rounded-lg text-[12px] border transition-colors ${
                    message.is_pinned
                      ? 'bg-[var(--w-surface)] border-[var(--w-border)] text-[var(--w-text-muted)] hover:bg-[var(--w-surface-2)]'
                      : pinnedCount >= 3
                        ? 'bg-[var(--w-surface)] border-[var(--w-text)] text-[var(--w-text)] opacity-40 cursor-not-allowed'
                        : 'bg-[var(--w-surface)] border-[var(--w-text)] text-[var(--w-text)] hover:bg-[var(--w-surface-2)]'
                  }`}
                >
                  {message.is_pinned ? '◆ Lepas Sematkan' : '◆ Sematkan ke Atas'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-[var(--w-text)] text-[var(--w-bg)] py-2.5 rounded-lg text-[12px] font-medium uppercase tracking-[0.04em] hover:bg-[var(--w-text-2)] transition-colors"
              >
                Simpan
              </button>
              {message.reply && (
                <button
                  onClick={() => { setIsEditing(false); setReply(message.reply || ''); setIsPublic(message.is_public) }}
                  className="px-4 border border-[var(--w-border-mid)] text-[var(--w-text-muted)] py-2.5 rounded-lg text-[12px] hover:border-[var(--w-border-strong)] hover:text-[var(--w-text-2)] transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </>
        )}

        {/* Embed — only for public messages */}
        {message.is_public && (
          <div className="border-t border-[var(--w-border-mid)] pt-4">
            <p className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.18em] mb-2">Embed</p>
            <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg p-3 flex items-start gap-2 mb-2">
              <code className="flex-1 text-[9px] text-white break-all leading-relaxed font-mono">
                {embedCode}
              </code>
              <button
                onClick={handleCopyEmbed}
                className="shrink-0 text-[10px] text-[var(--w-text-muted)] hover:text-[var(--w-text)] transition-colors whitespace-nowrap"
              >
                {embedCopied ? '✓' : 'Salin'}
              </button>
            </div>
            <div className="mt-2">
              <a href={embedUrl} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[var(--w-text-muted)] hover:text-[var(--w-text-2)] transition-colors"
              >
                Preview →
              </a>
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="border-t border-[var(--w-border-mid)] pt-4 mt-auto">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-[10px] text-[var(--w-text-muted)] hover:text-[#ff6b6b] uppercase tracking-widest transition-colors w-full text-center"
            >
              Hapus pesan ini
            </button>
          ) : (
            <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-xl p-4">
              <p className="text-[11px] text-[var(--w-text-muted)] text-center mb-3">Yakin ingin menghapus?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDeleteMessage(message.id)}
                  className="flex-1 bg-[var(--w-surface-2)] text-[#ff6b6b] border border-[var(--w-border-mid)] py-2 rounded-lg text-[11px] hover:bg-[var(--w-border-mid)] transition-colors"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 border border-[var(--w-border-mid)] text-[var(--w-text-muted)] py-2 rounded-lg text-[11px] hover:text-[var(--w-text-2)] transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
