interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: string
  is_pinned?: string
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between shrink-0">
        <span className="text-[9px] text-[#333333] uppercase tracking-[0.18em]">Pesan</span>
        <span className="text-[9px] text-[#333333]">{messages.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
            <span className="text-[#1e1e1e] text-2xl">◆</span>
            <p className="text-[12px] text-[#333333]">Tidak ada pesan</p>
          </div>
        ) : (
          messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left px-4 py-3 border-b border-[#111111] transition-colors ${
                selectedId === msg.id
                  ? 'bg-[#111111] border-l-2 border-l-[#ffffff]'
                  : msg.is_pinned === 'TRUE'
                    ? 'hover:bg-[#0d0d0d] border-l-2 border-l-[#444444]'
                    : 'hover:bg-[#0d0d0d] border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Unread dot */}
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  msg.reply ? 'bg-[#2a2a2a]' : 'bg-[#ffffff]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.is_pinned === 'TRUE' && (
                      <span className="shrink-0 text-[7px] bg-[#0a0a0a] text-[#ffffff] border border-[#333333] px-1 py-0.5 rounded-sm uppercase tracking-wider">
                        ◆ Pin
                      </span>
                    )}
                    <p className={`text-[12px] leading-snug truncate ${
                      selectedId === msg.id ? 'text-[#ffffff]' : msg.reply ? 'text-[#555555]' : 'text-[#aaaaaa]'
                    }`}>
                      {msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#333333] italic truncate max-w-24">
                      {msg.alias}
                    </span>
                    <span className="text-[10px] text-[#2a2a2a]">·</span>
                    <span className="text-[10px] text-[#2a2a2a]">{relativeTime(msg.created_at)}</span>
                    {msg.is_public === 'TRUE' && (
                      <span className="text-[9px] text-[#2a2a2a] uppercase tracking-wider ml-auto">publik</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
