import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import { getCachedProfile } from '#/lib/walls'
import type { WallProfile } from '#/lib/walls'

export const Route = createFileRoute('/explore')({ component: ExplorePage })

const PAGE_SIZE = 12

function relativeJoin(dateString: string): string {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000)
  if (days === 0) return 'hari ini'
  if (days === 1) return '1 hari lalu'
  return `${days} hari lalu`
}

function parseItems(raw: unknown): any[] {
  if (!raw || typeof raw !== 'object') return []
  if (Array.isArray(raw)) return raw
  const r = raw as Record<string, unknown>
  if (r.error) return []
  return Array.isArray(r.data) ? r.data : []
}

function WallExploreCard({
  wall,
  msgCount,
  index,
}: {
  wall: WallProfile
  msgCount: number
  index: number
}) {
  const navigate = useNavigate()
  const initials = wall.display_name
    ? wall.display_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : wall.username.slice(0, 2).toUpperCase()

  return (
    <div
      onClick={() =>
        navigate({ to: '/message/$username', params: { username: wall.username } })
      }
      className="flex items-center gap-3 bg-[#111111] border border-[#1a1a1a] rounded-[10px] px-[14px] py-3 hover:bg-[#161616] hover:border-[#2a2a2a] cursor-pointer transition-colors"
      style={{
        animation: `stagger-in 0.3s ease forwards`,
        animationDelay: `${Math.min(index, 11) * 50}ms`,
        opacity: 0,
      }}
    >
      {wall.avatar_url ? (
        <img
          src={wall.avatar_url}
          alt={wall.display_name}
          className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#2a2a2a]"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[11px] text-[#888888] font-medium shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-[#dddddd] font-medium truncate">
          {wall.display_name || wall.username}
        </p>
        <p className="text-[11px] text-[#555555] truncate">@{wall.username}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[10px] text-[#444444]">{msgCount} pesan publik</span>
          <span className="text-[10px] text-[#333333]">·</span>
          <span className="text-[10px] text-[#333333]">
            bergabung {relativeJoin(wall.created_at)}
          </span>
        </div>
      </div>
      <span className="text-[#333333] text-[14px] shrink-0">→</span>
    </div>
  )
}

function ExplorePage() {
  const { user, isSignedIn, isLoaded } = useUser()
  const [walls, setWalls] = useState<WallProfile[]>([])
  const [msgCounts, setMsgCounts] = useState<Record<string, number>>({})
  const [lastMsgAt, setLastMsgAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'terbaru' | 'terpopuler' | 'teraktif'>('terbaru')
  const [page, setPage] = useState(1)
  const [myUsername, setMyUsername] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user) {
      const cached = getCachedProfile()
      if (cached && cached.clerk_uid === user.id) {
        setMyUsername(cached.username)
      }
    }
  }, [isLoaded, isSignedIn, user])

  useEffect(() => {
    const wallsUrl = import.meta.env.VITE_SHEETDB_WALLS_URL
    const msgsUrl = import.meta.env.VITE_SHEETDB_MESSAGES_URL

    Promise.all([
      wallsUrl
        ? fetch(wallsUrl)
            .then((r) => r.json())
            .then(parseItems)
            .catch(() => [])
        : Promise.resolve([]),
      msgsUrl
        ? fetch(msgsUrl)
            .then((r) => r.json())
            .then(parseItems)
            .catch(() => [])
        : Promise.resolve([]),
    ]).then(([wallData, msgData]) => {
      setWalls(wallData)

      const counts: Record<string, number> = {}
      const lastAt: Record<string, string> = {}
      for (const m of msgData) {
        if (!m.recipient) continue
        if (m.is_public === 'TRUE') {
          counts[m.recipient] = (counts[m.recipient] || 0) + 1
        }
        if (
          !lastAt[m.recipient] ||
          new Date(m.created_at) > new Date(lastAt[m.recipient])
        ) {
          lastAt[m.recipient] = m.created_at
        }
      }
      setMsgCounts(counts)
      setLastMsgAt(lastAt)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let result = walls
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (w) =>
          w.username.toLowerCase().includes(q) ||
          (w.display_name || '').toLowerCase().includes(q),
      )
    }
    const sorted = [...result]
    if (sort === 'terbaru') {
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    } else if (sort === 'terpopuler') {
      sorted.sort((a, b) => (msgCounts[b.username] || 0) - (msgCounts[a.username] || 0))
    } else {
      sorted.sort((a, b) => {
        const aTime = lastMsgAt[a.username]
          ? new Date(lastMsgAt[a.username]).getTime()
          : 0
        const bTime = lastMsgAt[b.username]
          ? new Date(lastMsgAt[b.username]).getTime()
          : 0
        return bTime - aTime
      })
    }
    return sorted
  }, [walls, search, sort, msgCounts, lastMsgAt])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[560px] mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="font-serif italic text-[12px] text-[#333333] hover:text-[#ffffff] transition-colors tracking-widest"
          >
            ◆ Titipkan
          </Link>
          {isLoaded && isSignedIn && myUsername ? (
            <Link
              to="/message/$username/inbox"
              params={{ username: myUsername }}
              className="text-[11px] text-[#444444] hover:text-[#ffffff] transition-colors uppercase tracking-widest"
            >
              ← Wallku
            </Link>
          ) : (
            <Link
              to="/"
              className="text-[11px] text-[#444444] hover:text-[#ffffff] transition-colors uppercase tracking-widest"
            >
              Buat Wallmu →
            </Link>
          )}
        </div>

        <h1 className="font-serif italic text-[28px] text-[#ffffff] mb-1">Jelajahi Wall</h1>
        <p className="text-[12px] text-[#555555] mb-8">
          Temukan dan kirim pesan ke wall orang lain.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari username atau nama..."
            className="w-full h-10 bg-[#111111] border border-[#2a2a2a] rounded-lg pl-9 pr-8 text-[13px] text-[#aaaaaa] placeholder-[#444444] focus:outline-none focus:border-[#444444] transition-colors"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('')
                setPage(1)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#aaaaaa] transition-colors leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1.5 mb-4">
          {(['terbaru', 'terpopuler', 'teraktif'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSort(tab)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-full text-[11px] transition-colors ${
                sort === tab
                  ? 'bg-[#ffffff] text-[#0a0a0a] font-medium'
                  : 'text-[#555555] hover:text-[#aaaaaa]'
              }`}
            >
              {tab === 'terbaru' ? 'Terbaru' : tab === 'terpopuler' ? 'Terpopuler' : 'Teraktif'}
            </button>
          ))}
        </div>

        {/* Wall count */}
        {!loading && (
          <p className="text-[11px] text-[#444444] mb-4">
            Menampilkan {filtered.length} wall
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-4 h-4 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-[#444444] mb-1">
              Tidak ada wall dengan nama itu.
            </p>
            <p className="text-[12px] text-[#333333]">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((wall, i) => (
              <WallExploreCard
                key={wall.id}
                wall={wall}
                msgCount={msgCounts[wall.username] || 0}
                index={i}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="w-full mt-5 text-[12px] text-[#555555] hover:text-[#aaaaaa] hover:underline py-2 transition-colors"
          >
            Tampilkan lebih banyak
          </button>
        )}
      </div>
    </main>
  )
}
