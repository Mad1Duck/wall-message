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
    <div className="flex flex-col h-full ">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--w-border-mid)] flex items-center justify-between shrink-0">
        <span className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.18em]">Pesan</span>
        <span className="text-[9px] text-[var(--w-text-muted)]">{messages.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto h-full grow">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
            <span className="text-[var(--w-border-mid)] text-2xl">◆</span>
            <p className="text-[12px] text-[var(--w-text-muted)]">Tidak ada pesan</p>
          </div>
        ) : (
      <div className="h-full w-full" >
        {
              messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--w-surface-2)] transition-colors ${
                selectedId === msg.id
                  ? 'bg-[var(--w-surface-2)] border-l-2 border-l-[var(--w-text)]'
                  : msg.is_pinned
                    ? 'hover:bg-[var(--w-surface-2)] border-l-2 border-l-[var(--w-border-strong)]'
                    : 'hover:bg-[var(--w-surface-2)] border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Unread dot */}
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  msg.reply ? 'bg-[var(--w-text-muted)]' : 'bg-[var(--w-text)]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.is_pinned && (
                      <span className="shrink-0 text-[7px] bg-[var(--w-text)] text-[var(--w-bg)] border border-[var(--w-border-strong)] px-1 py-0.5 rounded-sm uppercase tracking-wider">
                        ◆ Pin
                      </span>
                    )}
                    <p className={`text-[12px] leading-snug truncate ${
                      selectedId === msg.id ? 'text-[var(--w-text)]' : msg.reply ? 'text-[var(--w-text-muted)]' : 'text-[var(--w-text-2)]'
                    }`}>
                      {msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--w-text-muted)] italic truncate max-w-24">
                      {msg.alias}
                    </span>
                    <span className="text-[10px] text-[var(--w-text-muted)]">·</span>
                    <span className="text-[10px] text-[var(--w-text-muted)]">{relativeTime(msg.created_at)}</span>
                    {msg.is_public && (
                      <span className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-wider ml-auto">publik</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        }
      </div>
        )}
      </div>
    </div>
  )
}
