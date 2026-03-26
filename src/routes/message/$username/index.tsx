import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import SendForm from '#/components/SendForm'
import MessageWall from '#/components/MessageWall'
import Toast from '#/components/toast'
import Header from '#/components/Header'
import { getCachedProfile, getWallByClerkUid, setCachedProfile, getWallByUsername } from '#/lib/walls'
import type { WallProfile } from '#/lib/walls'

export const Route = createFileRoute('/message/$username/')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { username } = Route.useParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const [messages, setMessages] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })
  const [sheetdbUrl, setSheetdbUrl] = useState<string>('')
  const toastTimeoutRef = useRef<NodeJS.Timeout>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [wallProfile, setWallProfile] = useState<WallProfile | null>(null)

  // Owner check via wall profile
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    const cached = getCachedProfile()
    if (cached && cached.clerk_uid === user.id) {
      setIsOwner(cached.username === username)
      return
    }
    getWallByClerkUid(user.id).then((wall) => {
      if (wall) {
        setCachedProfile(wall)
        setIsOwner(wall.username === username)
      }
    })
  }, [isLoaded, isSignedIn, user, username])

  // Load wall profile for display (display_name, bio)
  useEffect(() => {
    getWallByUsername(username).then((wall) => {
      if (wall) setWallProfile(wall)
    })
  }, [username])

  useEffect(() => {
    const url = import.meta.env.VITE_SHEETDB_MESSAGES_URL
    if (url) {
      setSheetdbUrl(url)
      fetchMessages(url)
      const interval = setInterval(() => fetchMessages(url), 30000)
      return () => clearInterval(interval)
    }
  }, [username])

  const fetchMessages = async (url: string) => {
    try {
      const response = await fetch(
        `${url}/search?recipient=${encodeURIComponent(username)}`
      )
      if (response.ok) {
        const raw = await response.json()
        const items = Array.isArray(raw) ? raw : (raw.data || [])
        const sorted = items.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setMessages(sorted)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message: '', visible: false })
    }, 3000)
  }

  const handleMessageSent = async () => {
    showToast('◆ Pesanmu sudah terkirim')
    if (sheetdbUrl) {
      setTimeout(() => fetchMessages(sheetdbUrl), 500)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
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
            sheetdbUrl={sheetdbUrl}
            recipient={username}
          />
          <MessageWall messages={messages} />
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </main>
  )
}
