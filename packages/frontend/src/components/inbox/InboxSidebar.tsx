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
    <aside className="w-full lg:w-52 bg-[var(--w-bg)] border-b lg:border-b-0 lg:border-r border-[var(--w-border-mid)] flex flex-col shrink-0">

      {/* Top nav */}
      <div className="px-4 py-3.5 border-b border-[var(--w-border-mid)] flex items-center justify-between">
        <Link
          to="/"
          params={{ username }}
          className="text-[10px] text-[var(--w-text-dim)] hover:text-[var(--w-text)] uppercase tracking-[0.14em] transition-colors"
        >
          ← Wall
        </Link>
        <button
          onClick={handleSignOut}
          className="text-[10px] text-[var(--w-text-muted)] hover:text-[var(--w-text)] uppercase tracking-[0.14em] transition-colors"
        >
          Keluar
        </button>
      </div>

      {/* Main */}
      <div className="p-5 flex-1 flex flex-col gap-7">

        {/* Title */}
        <div>
          <p className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.18em] mb-1">@{username}</p>
          <h1 className="display-title italic text-[22px] text-[var(--w-text)] font-normal leading-tight">
            Kotak Masuk
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <StatBlock label="Total" value={stats.total} />
          <StatBlock label="Belum Dibalas" value={stats.unreplied} accent={stats.unreplied > 0} />
          <StatBlock label="Tampil di Wall" value={stats.public} />
          <StatBlock label="Disematkan" value={stats.pinned} />
        </div>

        {/* View Toggle */}
        <div className="flex lg:flex-col gap-1.5">
          <button
            onClick={() => onViewChange?.('messages')}
            className={`flex-1 lg:flex-none flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.04em] transition-colors ${
              view === 'messages'
                ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                : 'text-[var(--w-text-muted)] hover:text-[var(--w-text)] hover:bg-[var(--w-surface-2)]'
            }`}
          >
            <span>Pesan</span>
          </button>
          <button
            onClick={() => onViewChange?.('embed')}
            className={`flex-1 lg:flex-none flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.04em] transition-colors ${
              view === 'embed'
                ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                : 'text-[var(--w-text-muted)] hover:text-[var(--w-text)] hover:bg-[var(--w-surface-2)]'
            }`}
          >
            <span>Embed</span>
          </button>
        </div>

        {/* Filters - Only show in messages view */}
        {view === 'messages' && (
          <div className="flex lg:flex-col gap-1.5">
            {filters.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFilterChange(opt.id)}
                className={`flex-1 lg:flex-none flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.04em] transition-colors ${
                  filter === opt.id
                    ? 'bg-[var(--w-text)] text-[var(--w-bg)]'
                    : 'text-[var(--w-text-muted)] hover:text-[var(--w-text)] hover:bg-[var(--w-surface-2)]'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] ${filter === opt.id ? 'text-[var(--w-bg)]' : 'text-[var(--w-text-muted)]'}`}>
                  {opt.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Mini Walls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.18em]">Mini Walls</p>
            {onCreateMiniWall && (
              <button
                onClick={onCreateMiniWall}
                className="text-[10px] text-[var(--w-text)] hover:text-[var(--w-text-2)] uppercase tracking-[0.14em] transition-colors"
              >
                + Baru
              </button>
            )}
          </div>
          {miniWalls.length === 0 ? (
            <p className="text-[10px] text-[var(--w-text-muted)] italic">Belum ada mini wall</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {miniWalls.map((mw) => (
                <div
                  key={mw.id}
                  className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--w-text)] truncate">{mw.name}</p>
                    <p className="text-[9px] text-[var(--w-text-muted)] truncate">/{username}/{mw.slug}</p>
                  </div>
                  {onDeleteMiniWall && (
                    <button
                      onClick={() => onDeleteMiniWall(mw.id)}
                      className="ml-2 text-[10px] text-[var(--w-text-dim)] hover:text-[var(--w-text)] transition-colors"
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
      <div className="px-5 py-4 border-t border-[var(--w-border-mid)]">
        <p className="text-[9px] text-[var(--w-text-ghost)] uppercase tracking-[0.16em]">◆ wall message</p>
      </div>
    </aside>
  )
}

function StatBlock({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2.5">
      <div className={`text-[22px] font-medium leading-none mb-0.5 ${accent && value > 0 ? 'text-[var(--w-text)]' : 'text-[var(--w-text-muted)]'}`}>
        {value}
      </div>
      <div className="text-[9px] text-[var(--w-text-muted)] uppercase tracking-[0.12em]">{label}</div>
    </div>
  )
}
