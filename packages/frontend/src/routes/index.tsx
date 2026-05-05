import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useUser, useSignIn, useClerk } from '@clerk/clerk-react'
import { useState, useEffect, useRef } from 'react'
import { getWallByClerkUid, getRecentWalls, getCachedProfile, setCachedProfile } from '#/lib/walls'
import type { WallProfile } from '#/lib/walls'

export const Route = createFileRoute('/')({ component: LandingPage })

const SSO_REDIRECT = '/sso-callback'
const AUTH_CALLBACK = '/auth/callback'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.2 13.2 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
    </svg>
  )
}

function WallCard({ wall }: { wall: WallProfile }) {
  const navigate = useNavigate()
  const initials = wall.display_name
    ? wall.display_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : wall.username.slice(0, 2).toUpperCase()

  return (
    <button
      onClick={() => navigate({ to: '/message/$username', params: { username: wall.username } })}
      className="flex items-center gap-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-3 py-2.5 hover:border-[#2a2a2a] transition-colors text-left w-full"
    >
      {wall.avatar_url ? (
        <img
          src={wall.avatar_url}
          alt={wall.display_name}
          className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#2a2a2a]"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[11px] text-[#555555] font-medium shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#aaaaaa] font-medium truncate">{wall.display_name || wall.username}</p>
        <p className="text-[10px] text-[#444444] truncate">@{wall.username}</p>
      </div>
      <span className="text-[#333333] text-[12px] shrink-0">→</span>
    </button>
  )
}

function SendToUser() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [checking, setChecking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleGo = async () => {
    const username = value.trim().toLowerCase().replace(/^@/, '')
    if (!username) return
    setChecking(true)
    setNotFound(false)
    try {
      const wallsUrl = import.meta.env.VITE_SHEETDB_WALLS_URL
      if (wallsUrl) {
        const res = await fetch(`${wallsUrl}/search?username=${encodeURIComponent(username)}`)
        const raw = await res.json()
        const items = Array.isArray(raw) ? raw : (raw.data || [])
        if (!items.length || raw.error) {
          setNotFound(true)
          setChecking(false)
          return
        }
      }
      navigate({ to: '/message/$username', params: { username } })
    } catch {
      navigate({ to: '/message/$username', params: { username } })
    }
    setChecking(false)
  }

  return (
    <section className="w-full max-w-110">
      <p className="text-[10px] text-[#333333] uppercase tracking-[0.18em] mb-4 text-center">
        Kirim pesan ke seseorang
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333] text-[13px] pointer-events-none">
            @
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); setNotFound(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            placeholder="username"
            className="w-full h-11 bg-[#111111] border border-[#2a2a2a] rounded-lg pl-7 pr-3 text-[13px] text-[#aaaaaa] placeholder-[#333333] focus:outline-none focus:border-[#444444] transition-colors"
          />
        </div>
        <button
          onClick={handleGo}
          disabled={!value.trim() || checking}
          className="h-11 px-5 bg-[#ffffff] text-[#0a0a0a] rounded-lg text-[12px] font-medium uppercase tracking-[0.04em] hover:bg-[#e0e0e0] disabled:opacity-30 transition-colors shrink-0"
        >
          {checking ? (
            <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
          ) : (
            'Kirim →'
          )}
        </button>
      </div>
      {notFound && (
        <p className="text-[11px] text-[#555555] mt-2 text-center">
          Username tidak ditemukan.
        </p>
      )}
    </section>
  )
}

function LandingPage() {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signIn, isLoaded: signInLoaded } = useSignIn()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const [oauthLoading, setOauthLoading] = useState<'google' | 'discord' | null>(null)
  const [recentWalls, setRecentWalls] = useState<WallProfile[]>([])
  const [checkingProfile, setCheckingProfile] = useState(false)
  const [wallProfile, setWallProfile] = useState<WallProfile | null>(null)
  const [wallsCopied, setWallsCopied] = useState(false)

  // Load recent walls
  useEffect(() => {
    getRecentWalls(6).then(setRecentWalls)
  }, [])

  // If signed in, check/load wall profile
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return

    const cached = getCachedProfile()
    if (cached && cached.clerk_uid === user.id) {
      setWallProfile(cached)
      return
    }

    setCheckingProfile(true)
    getWallByClerkUid(user.id).then((wall) => {
      if (wall) {
        setCachedProfile(wall)
        setWallProfile(wall)
      } else {
        navigate({ to: '/setup' })
      }
      setCheckingProfile(false)
    })
  }, [isLoaded, isSignedIn, user])

  const handleGoogleSignIn = async () => {
    if (!signIn || !signInLoaded) return
    setOauthLoading('google')
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}${SSO_REDIRECT}`,
        redirectUrlComplete: `${window.location.origin}${AUTH_CALLBACK}`,
      })
    } catch {
      setOauthLoading(null)
    }
  }

  const handleDiscordSignIn = async () => {
    if (!signIn || !signInLoaded) return
    setOauthLoading('discord')
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_discord',
        redirectUrl: `${window.location.origin}${SSO_REDIRECT}`,
        redirectUrlComplete: `${window.location.origin}${AUTH_CALLBACK}`,
      })
    } catch {
      setOauthLoading(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setWallProfile(null)
  }

  const wallUrl = wallProfile ? `${window.location.origin}/message/${wallProfile.username}` : ''
  const handleCopyWall = () => {
    navigator.clipboard.writeText(wallUrl)
    setWallsCopied(true)
    setTimeout(() => setWallsCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[#ffffff]"
            style={{
              left: `${(i * 6.4) % 100}%`,
              animation: `drift-up ${14 + (i * 1.2) % 9}s linear ${(i * 0.6) % 6}s infinite`,
              fontSize: '6px',
              opacity: 0.04,
            }}
          >
            ◆
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 py-16 gap-14">

        {/* ── HERO ── */}
        <section className="w-full max-w-110 text-center">

          {/* Top nav — signed in */}
          {isSignedIn && wallProfile && (
            <div className="flex items-center justify-between mb-10 text-[11px]">
              <Link
                to="/message/$username/inbox"
                params={{ username: wallProfile.username }}
                className="text-[#444444] hover:text-[#ffffff] uppercase tracking-widest transition-colors"
              >
                Inbox
              </Link>
              <button
                onClick={handleSignOut}
                className="text-[#333333] hover:text-[#ffffff] uppercase tracking-widest transition-colors"
              >
                Keluar
              </button>
            </div>
          )}

          <p className="font-serif italic text-[12px] text-[#333333] mb-6 tracking-widest">
            ◆ Titipkan
          </p>

          <h1 className="font-serif italic text-[40px] leading-[1.1] text-[#ffffff] mb-4">
            Buat Wallmu<br />Sendiri
          </h1>

          <p className="text-[13px] text-[#555555] leading-relaxed mb-10">
            Terima pesan anonim dari siapa saja.<br />Gratis, selamanya.
          </p>

          {/* ◆ divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-[#1a1a1a]" />
            <span className="text-[#222222] text-[10px]">◆</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>

          {/* Loading profile check */}
          {isLoaded && isSignedIn && (checkingProfile || !wallProfile) ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-[#444444]">Memuat profil...</span>
            </div>
          ) : isSignedIn && wallProfile ? (
            /* Signed in — show wall link */
            <div className="space-y-3 text-left">
              <p className="text-[10px] text-[#444444] uppercase tracking-widest text-center">
                Link wallmu
              </p>
              <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-3 flex items-center gap-3">
                <span className="flex-1 text-[12px] text-[#777777] truncate font-mono">
                  /message/{wallProfile.username}
                </span>
                <button
                  onClick={handleCopyWall}
                  className="text-[11px] text-[#555555] hover:text-[#ffffff] transition-colors whitespace-nowrap shrink-0"
                >
                  {wallsCopied ? '✓ Disalin' : 'Salin'}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/message/$username"
                  params={{ username: wallProfile.username }}
                  className="flex-1 text-center border border-[#2a2a2a] text-[#ffffff] font-medium py-2.5 rounded-lg text-[12px] uppercase tracking-[0.04em] hover:border-[#555555] transition-colors"
                >
                  Lihat Wall
                </Link>
                <Link
                  to="/message/$username/inbox"
                  params={{ username: wallProfile.username }}
                  className="flex-1 text-center border border-[#1e1e1e] text-[#555555] font-medium py-2.5 rounded-lg text-[12px] uppercase tracking-[0.04em] hover:border-[#2a2a2a] hover:text-[#aaa] transition-colors"
                >
                  Inbox
                </Link>
              </div>
            </div>
          ) : !isLoaded ? (
            /* Still loading Clerk */
            <div className="h-24" />
          ) : (
            /* Not signed in — show OAuth buttons */
            <div className="space-y-3">
              <p className="text-[10px] text-[#555555] uppercase tracking-[0.18em] mb-4">
                Masuk atau daftar dengan
              </p>

              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={oauthLoading !== null}
                className="w-full h-11 bg-white text-[#1a1a1a] rounded-[10px] flex items-center justify-center gap-3 text-[13px] font-medium hover:bg-[#f5f5f5] disabled:opacity-60 transition-colors"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Lanjutkan dengan Google
              </button>

              {/* Discord */}
              <button
                onClick={handleDiscordSignIn}
                disabled={oauthLoading !== null}
                className="w-full h-11 bg-[#5865F2] text-white rounded-[10px] flex items-center justify-center gap-3 text-[13px] font-medium hover:bg-[#4752c4] disabled:opacity-60 transition-colors"
              >
                {oauthLoading === 'discord' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <DiscordIcon />
                )}
                Lanjutkan dengan Discord
              </button>

              <p className="text-[11px] text-[#444444] text-center pt-1">
                Tidak perlu password. Akun langsung aktif.
              </p>
            </div>
          )}
        </section>

        {/* ◆ divider */}
        <div className="w-full max-w-110 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#1a1a1a]" />
          <span className="text-[#222222] text-[10px]">◆</span>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
        </div>

        {/* ── KIRIM KE USER ── */}
        <SendToUser />

        {/* ◆ divider */}
        <div className="w-full max-w-110 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#1a1a1a]" />
          <span className="text-[#222222] text-[10px]">◆</span>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
        </div>

        {/* ── WALL SHOWCASE ── */}
        <section className="w-full max-w-110">
          <p className="text-[10px] text-[#333333] uppercase tracking-[0.18em] mb-5 text-center">
            Wall yang Baru Dibuat
          </p>

          {recentWalls.length === 0 ? (
            <p className="text-center text-[12px] text-[#2a2a2a]">Belum ada wall.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {recentWalls.map((wall) => (
                <WallCard key={wall.id} wall={wall} />
              ))}
            </div>
          )}

          <div className="mt-5 text-center">
            <Link
              to="/explore"
              className="text-[11px] text-[#444444] hover:text-[#aaaaaa] uppercase tracking-widest transition-colors"
            >
              Jelajahi Wall →
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}
