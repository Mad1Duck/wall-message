import { useState } from 'react'

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: string
  is_pinned?: string
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
  const [isPublic, setIsPublic] = useState(message.is_public === 'TRUE')
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
    <div className="h-full flex flex-col overflow-y-auto">

      {/* Message card */}
      <div className="p-5 border-b border-[#1a1a1a]">
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4 mb-3">
          <p className="display-title italic text-[15px] text-[#cccccc] leading-[1.65] mb-3">
            {message.content}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#444444] italic">{message.alias}</p>
            <p className="text-[10px] text-[#2a2a2a]">{relativeTime(message.created_at)}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-widest ${
            message.reply
              ? 'border-[#2a2a2a] text-[#555555]'
              : 'border-[#444444] text-[#888888]'
          }`}>
            {message.reply ? 'Sudah dibalas' : 'Belum dibalas'}
          </span>
          {message.is_public === 'TRUE' && (
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-[#2a2a2a] text-[#555555] uppercase tracking-widest">
              Publik
            </span>
          )}
          {message.is_pinned === 'TRUE' && (
            <span className="text-[9px] px-2 py-0.5 rounded-full border border-[#2a2a2a] text-[#444444] uppercase tracking-widest">
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
            <p className="text-[9px] text-[#333333] uppercase tracking-[0.18em] mb-2">Balasanmu</p>
            <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-[13px] text-[#888888] italic leading-relaxed">{message.reply}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-[10px] text-[#333333] hover:text-[#ffffff] uppercase tracking-widest transition-colors"
            >
              Edit →
            </button>
          </div>
        )}

        {/* Reply form */}
        {isEditing && (
          <>
            <div>
              <p className="text-[9px] text-[#333333] uppercase tracking-[0.18em] mb-2">
                {message.reply ? 'Edit Balasan' : 'Tulis Balasan'}
              </p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Tulis balasanmu..."
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[13px] text-[#aaaaaa] placeholder-[#333333] focus:outline-none focus:border-[#555555] resize-none transition-colors"
                style={{ minHeight: '80px' }}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3">
              <div>
                <p className="text-[12px] text-[#aaaaaa] font-medium">Tampilkan di Wall</p>
                <p className="text-[10px] text-[#333333] mt-0.5">Pesan &amp; balasan terlihat publik</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                style={{ width: 40, height: 22, background: isPublic ? '#ffffff' : '#2a2a2a' }}
                className="relative rounded-full transition-colors shrink-0"
              >
                <div
                  className="absolute w-4 h-4 bg-[#0a0a0a] rounded-full transition-transform"
                  style={{ top: 3, left: isPublic ? 20 : 3 }}
                />
              </button>
            </div>

            {/* Pin button — only for public messages */}
            {message.is_public === 'TRUE' && (
              <div>
                {pinnedCount >= 3 && message.is_pinned !== 'TRUE' && (
                  <p className="text-[10px] text-[#555555] mb-2">
                    Maksimal 3 pesan disematkan. Lepas pin salah satu dulu.
                  </p>
                )}
                <button
                  onClick={() => onTogglePin(message.id, message.is_pinned !== 'TRUE')}
                  disabled={pinnedCount >= 3 && message.is_pinned !== 'TRUE'}
                  className={`w-full py-2.5 rounded-lg text-[12px] border transition-colors ${
                    message.is_pinned === 'TRUE'
                      ? 'bg-[#f5f5f5] border-[#e0e0e0] text-[#666666] hover:bg-[#ebebeb]'
                      : pinnedCount >= 3
                        ? 'bg-white border-black text-black opacity-40 cursor-not-allowed'
                        : 'bg-white border-black text-black hover:bg-[#f5f5f5]'
                  }`}
                >
                  {message.is_pinned === 'TRUE' ? '◆ Lepas Sematkan' : '◆ Sematkan ke Atas'}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#ffffff] text-[#0a0a0a] py-2.5 rounded-lg text-[12px] font-medium uppercase tracking-[0.04em] hover:bg-[#e0e0e0] transition-colors"
              >
                Simpan
              </button>
              {message.reply && (
                <button
                  onClick={() => { setIsEditing(false); setReply(message.reply || ''); setIsPublic(message.is_public === 'TRUE') }}
                  className="px-4 border border-[#2a2a2a] text-[#555555] py-2.5 rounded-lg text-[12px] hover:border-[#444444] hover:text-[#aaaaaa] transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </>
        )}

        {/* Embed — only for public messages */}
        {message.is_public === 'TRUE' && (
          <div className="border-t border-[#1a1a1a] pt-4">
            <p className="text-[9px] text-[#333333] uppercase tracking-[0.18em] mb-2">Embed</p>
            <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg p-3 flex items-start gap-2 mb-2">
              <code className="flex-1 text-[9px] text-[#444444] break-all leading-relaxed font-mono">
                {embedCode}
              </code>
              <button
                onClick={handleCopyEmbed}
                className="shrink-0 text-[10px] text-[#333333] hover:text-[#ffffff] transition-colors whitespace-nowrap"
              >
                {embedCopied ? '✓' : 'Salin'}
              </button>
            </div>
            <div className="mt-2">
              <a href={embedUrl} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-[#333333] hover:text-[#555555] transition-colors"
              >
                Preview →
              </a>
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="border-t border-[#1a1a1a] pt-4 mt-auto">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="text-[10px] text-[#2a2a2a] hover:text-[#ff6b6b] uppercase tracking-widest transition-colors w-full text-center"
            >
              Hapus pesan ini
            </button>
          ) : (
            <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-[11px] text-[#555555] text-center mb-3">Yakin ingin menghapus?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDeleteMessage(message.id)}
                  className="flex-1 bg-[#1a1a1a] text-[#ff6b6b] border border-[#2a2a2a] py-2 rounded-lg text-[11px] hover:bg-[#2a2a2a] transition-colors"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="flex-1 border border-[#2a2a2a] text-[#555555] py-2 rounded-lg text-[11px] hover:text-[#aaaaaa] transition-colors"
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
