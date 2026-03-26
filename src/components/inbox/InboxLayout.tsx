import { useState } from 'react'
import InboxSidebar from './InboxSidebar'
import InboxList from './InboxList'
import DetailPanel from './DetailPanel'
import InboxToast from './InboxToast'

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: string
  is_pinned?: string
  created_at: string
}

interface InboxLayoutProps {
  username: string
  messages: Message[]
  selectedId: string | null
  onSelectMessage: (id: string | null) => void
  onUpdateReply: (id: string, reply: string, isPublic: boolean) => void
  onTogglePin: (id: string, pin: boolean) => void
  onDeleteMessage: (id: string) => void
  toast: { message: string; visible: boolean }
}

type FilterType = 'all' | 'unreplied' | 'replied' | 'pinned'

export default function InboxLayout({
  username,
  messages,
  selectedId,
  onSelectMessage,
  onUpdateReply,
  onTogglePin,
  onDeleteMessage,
  toast,
}: InboxLayoutProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = messages.filter((m) => {
    if (filter === 'unreplied') return !m.reply
    if (filter === 'replied') return !!m.reply
    if (filter === 'pinned') return m.is_pinned === 'TRUE'
    return true
  })

  const pinnedCount = messages.filter((m) => m.is_pinned === 'TRUE').length

  const stats = {
    total: messages.length,
    unreplied: messages.filter((m) => !m.reply).length,
    public: messages.filter((m) => m.is_public === 'TRUE').length,
    pinned: pinnedCount,
  }

  const selectedMessage = messages.find((m) => m.id === selectedId)

  return (
    <main className="h-screen bg-[#0a0a0a] flex flex-col lg:flex-row overflow-hidden">

      {/* Sidebar */}
      <InboxSidebar
        username={username}
        stats={stats}
        filter={filter}
        onFilterChange={(f) => setFilter(f as FilterType)}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Message list */}
        <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-[#1a1a1a] overflow-hidden flex flex-col"
          style={{ height: selectedMessage ? '40%' : '100%' }}>
          <InboxList
            messages={filtered}
            selectedId={selectedId}
            onSelectMessage={onSelectMessage}
          />
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-hidden">
          {selectedMessage ? (
            <DetailPanel
              message={selectedMessage}
              pinnedCount={pinnedCount}
              onUpdateReply={onUpdateReply}
              onTogglePin={onTogglePin}
              onDeleteMessage={onDeleteMessage}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <span className="text-[#1a1a1a] text-3xl">◆</span>
              <p className="text-[12px] text-[#2a2a2a]">Pilih pesan untuk melihat detail</p>
            </div>
          )}
        </div>

      </div>

      <InboxToast message={toast.message} visible={toast.visible} />
    </main>
  )
}
