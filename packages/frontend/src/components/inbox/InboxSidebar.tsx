import { Link, useNavigate } from '@tanstack/react-router'
import { useClerk } from '@clerk/clerk-react'
import { clearCachedProfile } from '#/lib/walls'

interface InboxSidebarProps {
  username: string
  stats: { total: number; unreplied: number; public: number; pinned: number }
  filter: 'all' | 'unreplied' | 'replied' | 'pinned'
  onFilterChange: (filter: 'all' | 'unreplied' | 'replied' | 'pinned') => void
}

export default function InboxSidebar({ username, stats, filter, onFilterChange }: InboxSidebarProps) {
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
    <aside className="w-full lg:w-52 bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-[#1a1a1a] flex flex-col shrink-0">

      {/* Top nav */}
      <div className="px-4 py-3.5 border-b border-[#1a1a1a] flex items-center justify-between">
        <Link
          to="/"
          params={{ username }}
          className="text-[10px] text-[#444444] hover:text-[#ffffff] uppercase tracking-[0.14em] transition-colors"
        >
          ← Wall
        </Link>
        <button
          onClick={handleSignOut}
          className="text-[10px] text-[#333333] hover:text-[#ffffff] uppercase tracking-[0.14em] transition-colors"
        >
          Keluar
        </button>
      </div>

      {/* Main */}
      <div className="p-5 flex-1 flex flex-col gap-7">

        {/* Title */}
        <div>
          <p className="text-[9px] text-[#333333] uppercase tracking-[0.18em] mb-1">@{username}</p>
          <h1 className="display-title italic text-[22px] text-[#ffffff] font-normal leading-tight">
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

        {/* Filters */}
        <div className="flex lg:flex-col gap-1.5">
          {filters.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`flex-1 lg:flex-none flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.04em] transition-colors ${
                filter === opt.id
                  ? 'bg-[#ffffff] text-[#0a0a0a]'
                  : 'text-[#555555] hover:text-[#ffffff] hover:bg-[#111111]'
              }`}
            >
              <span>{opt.label}</span>
              <span className={`text-[10px] ${filter === opt.id ? 'text-[#0a0a0a]' : 'text-[#333333]'}`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1a1a1a]">
        <p className="text-[9px] text-[#222222] uppercase tracking-[0.16em]">◆ wall message</p>
      </div>
    </aside>
  )
}

function StatBlock({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-2.5">
      <div className={`text-[22px] font-medium leading-none mb-0.5 ${accent && value > 0 ? 'text-[#ffffff]' : 'text-[#555555]'}`}>
        {value}
      </div>
      <div className="text-[9px] text-[#333333] uppercase tracking-[0.12em]">{label}</div>
    </div>
  )
}
