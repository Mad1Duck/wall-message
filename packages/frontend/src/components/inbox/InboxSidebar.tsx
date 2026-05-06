import { Link, useNavigate } from '@tanstack/react-router'
import { useClerk } from '@clerk/clerk-react'
import { clearCachedProfile } from '#/lib/walls'

interface MiniWall {
  id: string
  name: string
  slug: string
  description: string
}

interface InboxSidebarProps {
  username: string
  stats: { total: number; unreplied: number; public: number; pinned: number }
  filter: 'all' | 'unreplied' | 'replied' | 'pinned'
  onFilterChange: (filter: 'all' | 'unreplied' | 'replied' | 'pinned') => void
  miniWalls?: MiniWall[]
  onCreateMiniWall?: () => void
  onDeleteMiniWall?: (id: string) => void
  view?: 'messages' | 'embed'
  onViewChange?: (view: 'messages' | 'embed') => void
}

export default function InboxSidebar({ username, stats, filter, onFilterChange, miniWalls = [], onCreateMiniWall, onDeleteMiniWall, view = 'messages', onViewChange }: InboxSidebarProps) {
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    clearCachedProfile()
    await signOut()
    navigate({ to: '/' })
  }

  const filters: Array<{ id: 'all' | 'unreplied' | 'replied' | 'pinned'; label: string; count: number }> = [
    { id: 'all',       label: 'Semua',      count: stats.total },
    { id: 'unreplied', label: 'Belum',      count: stats.unreplied },
    { id: 'replied',   label: 'Sudah',      count: stats.public },
    { id: 'pinned',    label: 'Disematkan', count: stats.pinned },
  ]

  return (
    <aside className="w-full lg:w-56 bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-[#1a1a1a] flex flex-col shrink-0">

      {/* Top nav */}
      <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <Link
          to="/"
          className="text-[10px] text-[#444444] hover:text-[#aaaaaa] uppercase tracking-[0.14em] transition-colors"
        >
          ← Wall
        </Link>
        <button
          onClick={handleSignOut}
          className="text-[10px] text-[#333333] hover:text-[#777777] uppercase tracking-[0.14em] transition-colors"
        >
          Keluar
        </button>
      </div>

      {/* Main */}
      <div className="px-4 lg:px-5 py-4 lg:py-6 flex-1 flex flex-col gap-5 lg:gap-8 overflow-y-auto">

        {/* Title */}
        <div>
          <p className="text-[10px] text-[#444444] uppercase tracking-[0.18em] mb-2">@{username}</p>
          <h1 className="display-title italic text-[22px] lg:text-[26px] text-[#ffffff] font-normal leading-tight">
            Kotak Masuk
          </h1>
          <div className="flex items-center gap-3 mt-3 lg:mt-4">
            <div className="flex-1 h-px bg-[#1a1a1a]" />
            <span className="text-[#222222] text-[9px]">◆</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>
        </div>

        {/* Stats — horizontal, more human */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="text-center">
            <div className="text-[18px] lg:text-[20px] font-medium leading-none text-[#aaaaaa]">{stats.total}</div>
            <div className="text-[9px] text-[#444444] uppercase tracking-[0.12em] mt-1">Total</div>
          </div>
          <div className="w-px h-5 lg:h-6 bg-[#1a1a1a]" />
          <div className="text-center">
            <div className={`text-[18px] lg:text-[20px] font-medium leading-none ${stats.unreplied > 0 ? 'text-[#ffffff]' : 'text-[#555555]'}`}>
              {stats.unreplied}
            </div>
            <div className="text-[9px] text-[#444444] uppercase tracking-[0.12em] mt-1">Belum</div>
          </div>
          <div className="w-px h-5 lg:h-6 bg-[#1a1a1a]" />
          <div className="text-center">
            <div className="text-[18px] lg:text-[20px] font-medium leading-none text-[#555555]">{stats.pinned}</div>
            <div className="text-[9px] text-[#444444] uppercase tracking-[0.12em] mt-1">Pin</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex lg:flex-col gap-2">
          <button
            onClick={() => onViewChange?.('messages')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
              view === 'messages'
                ? 'bg-[#ffffff] text-[#0a0a0a]'
                : 'text-[#555555] hover:text-[#aaaaaa] border border-[#2a2a2a] hover:border-[#444444]'
            }`}
          >
            <span>Pesan</span>
          </button>
          <button
            onClick={() => onViewChange?.('embed')}
            className={`flex-1 lg:flex-none flex items-center justify-center px-4 py-2 rounded-xl text-[11px] font-medium uppercase tracking-[0.04em] transition-all ${
              view === 'embed'
                ? 'bg-[#ffffff] text-[#0a0a0a]'
                : 'text-[#555555] hover:text-[#aaaaaa] border border-[#2a2a2a] hover:border-[#444444]'
            }`}
          >
            <span>Embed</span>
          </button>
        </div>

        {/* Filters — Only show in messages view */}
        {view === 'messages' && (
          <div>
            <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em] mb-2 lg:mb-3">Filter</p>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
              {filters.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onFilterChange(opt.id)}
                  className={`flex-1 lg:flex-none flex items-center justify-between px-3 py-1.5 lg:py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.04em] transition-all whitespace-nowrap ${
                    filter === opt.id
                      ? 'bg-[#111111] text-[#ffffff] border border-[#2a2a2a]'
                      : 'text-[#555555] hover:text-[#aaaaaa] hover:bg-[#111111]'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] ml-2 ${filter === opt.id ? 'text-[#777777]' : 'text-[#444444]'}`}>
                    {opt.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mini Walls */}
        <div className="flex flex-col gap-2 lg:gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-[#444444] uppercase tracking-[0.18em]">Mini Walls</p>
            {onCreateMiniWall && (
              <button
                onClick={onCreateMiniWall}
                className="text-[10px] text-[#777777] hover:text-[#aaaaaa] uppercase tracking-[0.14em] transition-colors"
              >
                + Baru
              </button>
            )}
          </div>
          {miniWalls.length === 0 ? (
            <p className="text-[10px] text-[#333333] italic">Belum ada mini wall</p>
          ) : (
            <div className="flex flex-col gap-1.5 lg:gap-2">
              {miniWalls.map((mw) => (
                <div
                  key={mw.id}
                  className="bg-[#111111] border border-[#1e1e1e] rounded-xl px-3 py-2 flex lg:py-2.5 items-center justify-between hover:border-[#2a2a2a] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#aaaaaa] truncate">{mw.name}</p>
                    <p className="text-[9px] text-[#444444] truncate">/{username}/{mw.slug}</p>
                  </div>
                  {onDeleteMiniWall && (
                    <button
                      onClick={() => onDeleteMiniWall(mw.id)}
                      className="ml-2 text-[10px] text-[#333333] hover:text-[#ff6b6b] transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 lg:px-5 py-3 lg:py-4 border-t border-[#1a1a1a]">
        <p className="text-[9px] text-[#222222] uppercase tracking-[0.16em]">◆ wall message</p>
      </div>
    </aside>
  )
}
