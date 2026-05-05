import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import SendForm from '#/components/SendForm'
import MessageWall from '#/components/MessageWall'
import Toast from '#/components/toast'
import Header from '#/components/Header'
import { getCachedProfile, setCachedProfile } from '#/lib/walls'
import { useWall, useWallByClerk } from '#/features/walls'
import { useMessages, useSendMessage } from '#/features/messages'

export const Route = createFileRoute('/message/$username/')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { username } = Route.useParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })
  const toastTimeoutRef = useRef<NodeJS.Timeout>(null)

  const { data: wallProfile } = useWall(username)
  const { data: messages = [] } = useMessages(wallProfile?.id)
  const sendMutation = useSendMessage()

  const isOwner = (() => {
    if (!isLoaded || !isSignedIn || !user) return false
    const cached = getCachedProfile()
    if (cached && cached.clerk_uid === user.id) return cached.username === username
    return false
  })()

  const { data: clerkWall } = useWallByClerk(isSignedIn ? user?.id : undefined)
  useEffect(() => {
    if (clerkWall) setCachedProfile(clerkWall)
  }, [clerkWall])

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
          displayName={wallProfile?.display_name}
          bio={wallProfile?.bio}
          isOwner={isOwner}
        />
        <div className="flex-1 px-4 py-8">
          <SendForm
            onMessageSent={handleMessageSent}
            recipient={username}
            wallId={wallProfile?.id}
            mutation={sendMutation}
          />
          <MessageWall messages={messages} wallId={wallProfile?.id} />
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </main>
  )
}
