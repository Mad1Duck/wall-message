import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import SendForm from '#/components/SendForm'
import MessageWall from '#/components/MessageWall'
import Toast from '#/components/toast'
import Header from '#/components/Header'
import { getCachedProfile } from '#/lib/walls'
import { useWall } from '#/features/walls'
import { useMessagesByMiniWall, useSendMessage } from '#/features/messages'
import { useMiniWallBySlug } from '#/features/mini-walls'

export const Route = createFileRoute('/message/$username/$slug')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { username, slug } = Route.useParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })
  const toastTimeoutRef = useRef<NodeJS.Timeout>(null)

  const { data: wallProfile } = useWall(username)
  const { data: miniWall } = useMiniWallBySlug(wallProfile?.id, slug)
  const { data: messages = [] } = useMessagesByMiniWall(miniWall?.id)
  const sendMutation = useSendMessage()

  const isOwner = (() => {
    if (!isLoaded || !isSignedIn || !user) return false
    const cached = getCachedProfile()
    if (cached && cached.clerk_uid === user.id) return cached.username === username
    return false
  })()

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message: '', visible: false })
    }, 3000)
  }

  const handleMessageSent = () => {
    showToast('◆ Pesanmu sudah terkirim')
  }

  // Loading state
  if (!wallProfile || !miniWall) {
    return (
      <main className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center">
        <p className="text-[var(--w-text-muted)]">Memuat...</p>
      </main>
    )
  }

  // Mini wall not found
  if (!miniWall) {
    return (
      <main className="min-h-screen bg-[var(--w-bg)] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[13px] text-[var(--w-text-muted)]">Mini wall tidak ditemukan</p>
        <Link
          to="/message/$username"
          params={{ username }}
          className="text-[11px] text-[var(--w-text)] uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          ← Kembali
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--w-bg)] overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-[#ffffff]"
            style={{
              left: `${(i * 5.2) % 100}%`,
              animation: `drift-up ${12 + (i * 1.1) % 10}s linear ${(i * 0.4) % 5}s infinite`,
              fontSize: '6px',
              opacity: 0.08,
            }}
          >
            ◆
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          displayName={miniWall.name}
          bio={miniWall.description}
          isOwner={isOwner}
        />
        <div className="flex-1 px-4 py-8">
          <SendForm
            onMessageSent={handleMessageSent}
            recipient={username}
            wallId={wallProfile.id}
            miniWallId={miniWall.id}
            mutation={sendMutation}
          />
          <MessageWall messages={messages} wallId={wallProfile.id} />
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </main>
  )
}
