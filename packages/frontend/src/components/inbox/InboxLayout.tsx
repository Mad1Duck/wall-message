import { useState } from 'react'
import InboxSidebar from './InboxSidebar'
import InboxList from './InboxList'
import DetailPanel from './DetailPanel'
import InboxToast from './InboxToast'
import EmbedPanel from './EmbedPanel'

interface Message {
  id: string
  wall_id: string
  mini_wall_id?: string
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
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[#ffffff]"
            style={{
              left: `${(i * 5.2) % 100}%`,
              animation: `drift-up ${14 + (i * 1.2) % 9}s linear ${(i * 0.6) % 6}s infinite`,
              fontSize: '6px',
              opacity: 0.06,
            }}
          >
            ◆
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row w-full lg:h-screen lg:overflow-hidden">
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
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">

          {view === 'messages' ? (
            <>
              {/* Message list */}
              <div className={`lg:w-80 overflow-hidden flex flex-col ${selectedMessage ? 'h-[45vh] lg:h-auto' : 'h-[60vh] lg:h-auto'}`}>
                <InboxList
                  messages={filtered}
                  miniWalls={miniWalls}
                  selectedId={selectedId}
                  onSelectMessage={onSelectMessage}
                />
              </div>

              {/* Detail */}
              <div className="flex-1 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#1a1a1a] min-h-[40vh] lg:min-h-0">
                {selectedMessage ? (
                  <DetailPanel
                    message={selectedMessage}
                    miniWalls={miniWalls}
                    pinnedCount={pinnedCount}
                    onUpdateReply={onUpdateReply}
                    onTogglePin={onTogglePin}
                    onDeleteMessage={onDeleteMessage}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
                    <span className="text-[#1a1a1a] text-3xl">◆</span>
                    <p className="text-[12px] text-[#444444]">Pilih pesan untuk melihat detail</p>
                    <div className="flex items-center gap-3 mt-4 w-full max-w-48">
                      <div className="flex-1 h-px bg-[#1a1a1a]" />
                      <span className="text-[#222222] text-[9px]">◆</span>
                      <div className="flex-1 h-px bg-[#1a1a1a]" />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Embed Panel */
            <div className="flex-1 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#1a1a1a]">
              {wallId ? (
                <EmbedPanel
                  wallId={wallId}
                  miniWalls={miniWalls}
                  username={username}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
                  <span className="text-[#1a1a1a] text-3xl">◆</span>
                  <p className="text-[12px] text-[#444444]">Wall ID tidak ditemukan</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <InboxToast message={toast.message} visible={toast.visible} />
    </main>
  )
}
