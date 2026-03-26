import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { useState, useEffect, useRef } from 'react'
import {
  checkUsernameAvailable,
  createWallProfile,
  setCachedProfile,
} from '#/lib/walls'

export const Route = createFileRoute('/setup')({
  component: SetupPage,
})

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

function SetupPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successProfile, setSuccessProfile] = useState<{ username: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate({ to: '/' })
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (user) {
      setDisplayName(user.fullName || user.firstName || '')
    }
  }, [user])

  useEffect(() => {
    if (!username) { setUsernameStatus('idle'); return }
    if (!USERNAME_REGEX.test(username)) { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(username)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [username])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(val)
  }

  const canSubmit =
    usernameStatus === 'available' &&
    displayName.trim().length > 0 &&
    !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !user) return

    setSubmitting(true)
    setSubmitError('')

    const available = await checkUsernameAvailable(username)
    if (!available) {
      setUsernameStatus('taken')
      setUsername('')
      setSubmitting(false)
      return
    }

    const profile = await createWallProfile({
      clerk_uid: user.id,
      username,
      display_name: displayName.trim(),
      bio: bio.trim(),
      avatar_url: user.imageUrl || '',
    })

    if (profile) {
      setCachedProfile(profile)
      setSuccessProfile({ username: profile.username })
    } else {
      setSubmitError('Gagal membuat wall, coba lagi.')
    }
    setSubmitting(false)
  }

  const wallUrl = successProfile
    ? `${window.location.origin}/message/${successProfile.username}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(wallUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Success screen
  if (successProfile) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[400px] space-y-6 text-center">
          {/* Checkmark */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-[#ffffff] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="font-serif italic text-[28px] text-[#ffffff] mb-2">Wallmu sudah siap!</h1>
            <p className="text-[13px] text-[#555555]">Bagikan link ini ke teman-temanmu:</p>
          </div>

          {/* URL chip */}
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl px-4 py-3">
            <p className="text-[12px] text-[#888888] font-mono break-all">{wallUrl}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full bg-[#ffffff] text-[#0a0a0a] font-medium py-3 rounded-xl text-[13px] uppercase tracking-[0.04em] hover:bg-[#e0e0e0] transition-colors"
            >
              {copied ? 'Tersalin! ◆' : 'Salin Link ◆'}
            </button>
            <button
              onClick={() =>
                navigate({
                  to: '/message/$username/inbox',
                  params: { username: successProfile.username },
                })
              }
              className="w-full border border-[#2a2a2a] text-[#ffffff] font-medium py-3 rounded-xl text-[13px] uppercase tracking-[0.04em] hover:border-[#555555] transition-colors"
            >
              Buka Inboxku →
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Avatar initials
  const initials = displayName
    ? displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const borderColor = {
    idle: '#2a2a2a',
    checking: '#2a2a2a',
    available: '#1D9E75',
    taken: '#E24B4A',
    invalid: '#E24B4A',
  }[usernameStatus]

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === 1 ? '#ffffff' : i === 0 ? '#555555' : '#222222' }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="avatar"
                className="w-14 h-14 rounded-full border-2 border-[#333333] object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-[#888888] text-[16px] font-medium">
                {initials}
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#444444]">
            Foto &amp; nama diambil dari akunmu. Bisa diubah.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-[11px] text-[#555555] uppercase tracking-[0.12em] mb-2">
              Username wallmu
            </label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="contoh: budi_santoso"
              maxLength={20}
              className="w-full bg-[#111111] rounded-lg px-3 py-2.5 text-[13px] text-[#aaaaaa] placeholder-[#333333] focus:outline-none transition-colors"
              style={{ border: `1px solid ${borderColor}` }}
            />
            {/* Status */}
            <div className="mt-1.5 h-4 flex items-center gap-1.5">
              {usernameStatus === 'checking' && (
                <>
                  <div className="w-3 h-3 border border-[#888888] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] text-[#888888]">Mengecek...</span>
                </>
              )}
              {usernameStatus === 'available' && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                  <span className="text-[11px] text-[#1D9E75]">@{username} tersedia!</span>
                </>
              )}
              {usernameStatus === 'taken' && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E24B4A]" />
                  <span className="text-[11px] text-[#E24B4A]">Sudah dipakai, coba yang lain</span>
                </>
              )}
              {usernameStatus === 'invalid' && username.length > 0 && (
                <span className="text-[11px] text-[#E24B4A]">Hanya huruf kecil, angka, dan underscore</span>
              )}
            </div>
            {username && (
              <p className="text-[11px] text-[#444444] mt-1">
                Wall kamu: {window.location.origin}/message/{username}
              </p>
            )}
          </div>

          {/* Display name */}
          <div>
            <label className="block text-[11px] text-[#555555] uppercase tracking-[0.12em] mb-2">
              Nama tampilan
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 40))}
              placeholder="Nama kamu"
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[13px] text-[#aaaaaa] placeholder-[#333333] focus:outline-none focus:border-[#555555] transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] text-[#555555] uppercase tracking-[0.12em] mb-2">
              Bio <span className="normal-case tracking-normal text-[#333333]">(opsional)</span>
            </label>
            <div className="relative">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                placeholder="Ceritain sedikit tentang kamu..."
                rows={3}
                className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[13px] text-[#aaaaaa] placeholder-[#333333] focus:outline-none focus:border-[#555555] transition-colors resize-none"
              />
              <span
                className={`absolute bottom-2 right-2 text-[10px] ${bio.length > 90 ? 'text-[#E24B4A]' : 'text-[#333333]'}`}
              >
                {bio.length} / 100
              </span>
            </div>
          </div>

          {submitError && (
            <p className="text-[11px] text-[#E24B4A] text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#ffffff] text-[#0a0a0a] font-medium py-3 rounded-xl text-[13px] uppercase tracking-[0.04em] hover:bg-[#e0e0e0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                Membuat wall...
              </>
            ) : (
              'Buat Wallku →'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
