interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: boolean
  is_pinned: boolean
  created_at: string
}

interface InboxListProps {
  messages: Message[]
  selectedId: string | null
  onSelectMessage: (id: string) => void
}

function relativeTime(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'baru saja'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}j lalu`
  return `${Math.floor(hours / 24)}h lalu`
}

export default function InboxList({ messages, selectedId, onSelectMessage }: InboxListProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between shrink-0">
        <span className="text-[10px] text-[#444444] uppercase tracking-[0.18em]">Pesan Masuk</span>
        <span className="text-[10px] text-[#333333]">{messages.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <span className="text-[#1a1a1a] text-2xl">◆</span>
            <p className="text-[12px] text-[#444444]">Tidak ada pesan</p>
            <p className="text-[10px] text-[#2a2a2a] italic">Tenang, nanti ada yang kirim</p>
          </div>
        ) : (
          <div className="divide-y divide-[#111111]">
            {messages.map((msg, index) => (
              <button
                key={msg.id}
                onClick={() => onSelectMessage(msg.id)}
                className={`w-full text-left px-5 py-4 transition-all duration-200 ${
                  selectedId === msg.id
                    ? 'bg-[#111111]'
                    : msg.is_pinned
                      ? 'hover:bg-[#0d0d0d]'
                      : 'hover:bg-[#0d0d0d]'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                    msg.reply ? 'bg-[#444444]' : 'bg-[#ffffff]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {msg.is_pinned && (
                        <span className="shrink-0 text-[8px] bg-[#ffffff] text-[#0a0a0a] px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                          ◆ Pin
                        </span>
                      )}
                      <p className={`text-[12px] leading-snug truncate ${
                        selectedId === msg.id ? 'text-[#ffffff]' : msg.reply ? 'text-[#555555]' : 'text-[#aaaaaa]'
                      }`}>
                        {msg.content.length > 55 ? msg.content.slice(0, 55) + '…' : msg.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-[#555555] italic truncate max-w-24 font-serif">
                        {msg.alias}
                      </span>
                      <span className="text-[9px] text-[#2a2a2a]">·</span>
                      <span className="text-[10px] text-[#444444]">{relativeTime(msg.created_at)}</span>
                      {msg.is_public && (
                        <span className="text-[9px] text-[#444444] uppercase tracking-wider ml-auto">publik</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
