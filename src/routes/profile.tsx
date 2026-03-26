import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useState } from 'react'

export const Route = createFileRoute('/profile')({ component: ProfilePage })

function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const username = user?.username || user?.firstName?.toLowerCase()
  const profileUrl =
    username ? `${window.location.origin}/message/${username}` : null

  const handleCopy = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[13px] text-[#555555]">Kamu belum masuk.</p>
        <Link
          to="/login"
          className="text-[11px] text-[#ffffff] uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          Masuk →
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[#ffffff]"
            style={{
              left: `${(i * 8.3) % 100}%`,
              animation: `drift-up ${14 + (i * 1.2) % 9}s linear ${(i * 0.6) % 6}s infinite`,
              fontSize: '6px',
              opacity: 0.04,
            }}
          >
            ◆
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-16 gap-10">
        <p className="text-[10px] text-[#333333] uppercase tracking-[0.18em]">◆ profil</p>

        <div className="w-full max-w-sm space-y-4">
          {/* User info */}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 space-y-2">
            <p className="text-[10px] text-[#333333] uppercase tracking-widest mb-3">Akun</p>
            {user?.fullName && (
              <p className="text-[14px] text-[#aaaaaa]">{user.fullName}</p>
            )}
            <p className="text-[12px] text-[#444444]">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          {/* Message wall link */}
          {username && profileUrl ? (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
              <p className="text-[10px] text-[#333333] uppercase tracking-widest mb-3">
                Link pesanmu
              </p>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-1 text-[12px] text-[#555555] truncate font-mono">
                  /message/{username}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-[11px] text-[#555555] hover:text-[#ffffff] transition-colors whitespace-nowrap shrink-0"
                >
                  {copied ? '✓ Disalin' : 'Salin'}
                </button>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/message/$username"
                  params={{ username }}
                  className="flex-1 text-center border border-[#2a2a2a] text-[#ffffff] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:border-[#555555] transition-colors"
                >
                  Lihat Wall
                </Link>
                <Link
                  to="/message/$username/inbox"
                  params={{ username }}
                  className="flex-1 text-center border border-[#1e1e1e] text-[#555555] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:border-[#333] hover:text-[#aaa] transition-colors"
                >
                  Inbox
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
              <p className="text-[12px] text-[#444444]">
                Set username di profil Clerk untuk mendapatkan link.
              </p>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full border border-[#1a1a1a] text-[#444444] font-medium py-3 rounded-xl text-[11px] uppercase tracking-[0.06em] hover:border-[#333333] hover:text-[#ffffff] transition-colors"
          >
            Keluar ◆
          </button>

          <div className="text-center">
            <Link
              to="/"
              className="text-[10px] text-[#2a2a2a] uppercase tracking-widest hover:text-[#555555] transition-colors"
            >
              ← Beranda
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
