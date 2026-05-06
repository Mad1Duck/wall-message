import { useState } from 'react'
import InboxSidebar from './InboxSidebar'
import InboxList from './InboxList'
import DetailPanel from './DetailPanel'
import InboxToast from './InboxToast'
import EmbedPanel from './EmbedPanel'

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: boolean
  is_pinned: boolean
  created_at: string
}

interface MiniWall {
  id: string
  name: string
  slug: string
  description: string
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
  miniWalls?: MiniWall[]
  onCreateMiniWall?: () => void
  onDeleteMiniWall?: (id: string) => void
  wallId?: string
}

type FilterType = 'all' | 'unreplied' | 'replied' | 'pinned'
type ViewType = 'messages' | 'embed'

export default function InboxLayout({
  username,
  messages,
  selectedId,
  onSelectMessage,
  onUpdateReply,
  onTogglePin,
  onDeleteMessage,
  toast,
  miniWalls = [],
  onCreateMiniWall,
  onDeleteMiniWall,
  wallId,
}: InboxLayoutProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [view, setView] = useState<ViewType>('messages')

  const filtered = messages.filter((m) => {
    if (filter === 'unreplied') return !m.reply
    if (filter === 'replied') return !!m.reply
    if (filter === 'pinned') return m.is_pinned
    return true
  })

  const pinnedCount = messages.filter((m) => m.is_pinned).length

  const stats = {
    total: messages.length,
    unreplied: messages.filter((m) => !m.reply).length,
    public: messages.filter((m) => m.is_public).length,
    pinned: pinnedCount,
  }

  const selectedMessage = messages.find((m) => m.id === selectedId)

  return (
    <main className="h-screen bg-[var(--w-bg)] flex flex-col lg:flex-row overflow-hidden">

      {/* Sidebar */}
      <InboxSidebar
        username={username}
        stats={stats}
        filter={filter}
        onFilterChange={(f) => setFilter(f as FilterType)}
        miniWalls={miniWalls}
        onCreateMiniWall={onCreateMiniWall}
        onDeleteMiniWall={onDeleteMiniWall}
        view={view}
        onViewChange={setView}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {view === 'messages' ? (
          <>
            {/* Message list */}
            <div className="lg:w-72 overflow-hidden flex flex-col"
              style={{ height: selectedMessage ? '40%' : '100%' }}>
              <InboxList
                messages={filtered}
                selectedId={selectedId}
                onSelectMessage={onSelectMessage}
              />
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-hidden border-b lg:border-b-0 lg:border-l border-[var(--w-border-mid)] ">
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
                  <span className="text-[var(--w-border-mid)] text-3xl">◆</span>
                  <p className="text-[12px] text-[var(--w-text-muted)]">Pilih pesan untuk melihat detail</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Embed Panel */
          <div className="flex-1 overflow-hidden border-b lg:border-b-0 lg:border-l border-[var(--w-border-mid)]">
            {wallId ? (
              <EmbedPanel
                wallId={wallId}
                miniWalls={miniWalls}
                username={username}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <span className="text-[var(--w-border-mid)] text-3xl">◆</span>
                <p className="text-[12px] text-[var(--w-text-muted)]">Wall ID tidak ditemukan</p>
              </div>
            )}
          </div>
        )}

      </div>

      <InboxToast message={toast.message} visible={toast.visible} />
    </main>
  )
}
