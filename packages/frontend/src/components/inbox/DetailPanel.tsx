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
    <div className="h-full flex flex-col overflow-y-auto bg-[#0a0a0a]">

      {/* Message card */}
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-5 mb-4">
          <p className="display-title italic text-[16px] text-[#aaaaaa] leading-[1.7] mb-4">
            &ldquo;{message.content}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#444444] italic font-serif">dari {message.alias}</p>
            <p className="text-[10px] text-[#555555]">{relativeTime(message.created_at)}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] px-2.5 py-1 rounded-full border uppercase tracking-widest ${
            message.reply
              ? 'border-[#2a2a2a] text-[#555555]'
              : 'border-[#444444] text-[#aaaaaa]'
          }`}>
            {message.reply ? 'Sudah dibalas' : 'Belum dibalas'}
          </span>
          {message.is_public && (
            <span className="text-[9px] px-2.5 py-1 rounded-full border border-[#2a2a2a] text-[#555555] uppercase tracking-widest">
              Publik
            </span>
          )}
          {message.is_pinned && (
            <span className="text-[9px] px-2.5 py-1 rounded-full border border-[#2a2a2a] text-[#444444] uppercase tracking-widest">
              ◆ Disematkan
            </span>
          )}
        </div>
      </div>

      {/* Reply section */}
      <div className="p-6 flex-1 flex flex-col gap-5">

        {/* Existing reply (read state) */}
        {message.reply && !isEditing && (
          <div>
            <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em] mb-3">Balasanmu</p>
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-5">
              <p className="text-[14px] text-[#aaaaaa] italic leading-relaxed font-serif">{message.reply}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 text-[10px] text-[#555555] hover:text-[#aaaaaa] uppercase tracking-widest transition-colors"
            >
              Edit →
            </button>
          </div>
        )}

        {/* Reply form */}
        {isEditing && (
          <>
            <div>
              <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em] mb-3">
                {message.reply ? 'Edit Balasan' : 'Tulis Balasan'}
              </p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Tulis balasanmu..."
                className="w-full bg-[#111111] border border-[#1e1e1e] rounded-xl px-4 py-3 text-[13px] text-[#aaaaaa] placeholder-[#444444] focus:outline-none focus:border-[#2a2a2a] resize-none transition-colors"
                style={{ minHeight: '100px' }}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between bg-[#111111] border border-[#1e1e1e] rounded-xl px-4 py-3.5">
              <div>
                <p className="text-[12px] text-[#aaaaaa] font-medium">Tampilkan di Wall</p>
                <p className="text-[10px] text-[#555555] mt-0.5">Pesan &amp; balasan terlihat publik</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                style={{ width: 44, height: 24, background: isPublic ? '#ffffff' : '#2a2a2a' }}
                className="relative rounded-full transition-colors shrink-0"
              >
                <div
                  className="absolute w-4 h-4 bg-[#0a0a0a] rounded-full transition-transform"
                  style={{ top: 4, left: isPublic ? 22 : 4 }}
                />
              </button>
            </div>

            {/* Pin button — only for public messages */}
            {message.is_public && (
              <div>
                {pinnedCount >= 3 && !message.is_pinned && (
                  <p className="text-[10px] text-[#555555] mb-2">
                    Maksimal 3 pesan disematkan. Lepas pin salah satu dulu.
                  </p>
                )}
                <button
                  onClick={() => onTogglePin(message.id, !message.is_pinned)}
                  disabled={pinnedCount >= 3 && !message.is_pinned}
                  className={`w-full py-2.5 rounded-xl text-[12px] border transition-all ${
                    message.is_pinned
                      ? 'bg-[#0a0a0a] border-[#2a2a2a] text-[#555555] hover:border-[#444444]'
                      : pinnedCount >= 3
                        ? 'bg-[#0a0a0a] border-[#444444] text-[#aaaaaa] opacity-40 cursor-not-allowed'
                        : 'bg-[#0a0a0a] border-[#ffffff] text-[#ffffff] hover:bg-[#111111]'
                  }`}
                >
                  {message.is_pinned ? '◆ Lepas Sematkan' : '◆ Sematkan ke Atas'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#ffffff] text-[#0a0a0a] py-2.5 rounded-xl text-[12px] font-medium uppercase tracking-[0.04em] hover:bg-[#e0e0e0] transition-colors"
              >
                Simpan
              </button>
              {message.reply && (
                <button
                  onClick={() => { setIsEditing(false); setReply(message.reply || ''); setIsPublic(message.is_public) }}
                  className="px-5 border border-[#2a2a2a] text-[#555555] py-2.5 rounded-xl text-[12px] hover:border-[#444444] hover:text-[#aaaaaa] transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </>
        )}

        {/* Embed — only for public messages */}
        {message.is_public && (
          <div className="border-t border-[#1a1a1a] pt-5">
            <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em] mb-3">Embed</p>
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-3 flex items-start gap-2 mb-2">
              <code className="flex-1 text-[9px] text-[#777777] break-all leading-relaxed font-mono">
                {embedCode}
              </code>
              <button
                onClick={handleCopyEmbed}
                className="shrink-0 text-[10px] text-[#555555] hover:text-[#aaaaaa] transition-colors whitespace-nowrap"
              >
                {embedCopied ? '✓' : 'Salin'}
              </button>
            </div>
            <div className="mt-2">
              <a href={embedUrl} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[#555555] hover:text-[#aaaaaa] transition-colors"
              >
                Preview →
              </a>
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="border-t border-[#1a1a1a] pt-5 mt-auto">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-[10px] text-[#444444] hover:text-[#ff6b6b] uppercase tracking-widest transition-colors w-full text-center py-2"
            >
              Hapus pesan ini
            </button>
          ) : (
            <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-5">
              <p className="text-[11px] text-[#555555] text-center mb-4">Yakin ingin menghapus pesan ini?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => onDeleteMessage(message.id)}
                  className="flex-1 bg-[#1a1a1a] text-[#ff6b6b] border border-[#2a2a2a] py-2 rounded-xl text-[11px] hover:bg-[#2a2a2a] transition-colors"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 border border-[#2a2a2a] text-[#555555] py-2 rounded-xl text-[11px] hover:text-[#aaaaaa] hover:border-[#444444] transition-colors"
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
