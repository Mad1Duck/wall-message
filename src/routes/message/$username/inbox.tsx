import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useUser, SignIn } from '@clerk/clerk-react'
import InboxLayout from '#/components/inbox/InboxLayout'
import { getCachedProfile, getWallByClerkUid, setCachedProfile } from '#/lib/walls'

export const Route = createFileRoute('/message/$username/inbox')({
  component: RouteComponent,
})

interface Message {
  id: string
  content: string
  alias: string
  reply?: string
  is_public: string
  is_pinned?: string
  created_at: string
  recipient?: string
}

export default function RouteComponent() {
  const { username } = Route.useParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetdbUrl, setSheetdbUrl] = useState<string>('')
  const [wallId, setWallId] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })
  const toastTimeoutRef = useRef<NodeJS.Timeout>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [ownerChecked, setOwnerChecked] = useState(false)

  // Check ownership via wall profile (not Clerk username)
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !user) { setOwnerChecked(true); return }

    
    const cached = getCachedProfile()
    if (cached && cached.clerk_uid === user.id) {
      setIsOwner(cached.username === username)
      if (cached.username === username) setWallId(cached.id)
      setOwnerChecked(true)
      return
    }

    getWallByClerkUid(user.id).then((wall) => {
      if (wall) {
        setCachedProfile(wall)
        setIsOwner(wall.username === username)
        if (wall.username === username) setWallId(wall.id)
      }
      setOwnerChecked(true)
    })
  }, [isLoaded, isSignedIn, user, username])

  useEffect(() => {
    const url = import.meta.env.VITE_SHEETDB_MESSAGES_URL
    if (url) setSheetdbUrl(url)
  }, [])

  useEffect(() => {    
    if (isOwner && sheetdbUrl && wallId) {
      fetchMessages(sheetdbUrl, wallId)
      const interval = setInterval(() => fetchMessages(sheetdbUrl, wallId), 20000)
      return () => clearInterval(interval)
    }
  }, [isOwner, sheetdbUrl, wallId])

  const fetchMessages = async (url: string, wid: string) => {
    try {
      const response = await fetch(
        `${url}/search?wall_id=${encodeURIComponent(wid)}`
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

  const handleUpdateReply = async (id: string, reply: string, isPublic: boolean) => {
    try {
      const response = await fetch(`${sheetdbUrl}/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { reply, is_public: isPublic ? 'TRUE' : 'FALSE' },
        }),
      })
      if (response.ok) {
        showToast('Balasan disimpan')
        setTimeout(() => fetchMessages(sheetdbUrl, wallId), 200)
      }
    } catch {
      showToast('Gagal menyimpan balasan')
    }
  }

  const handleTogglePin = async (id: string, pin: boolean) => {
    if (pin) {
      const pinnedCount = messages.filter((m) => m.is_pinned === 'TRUE').length
      if (pinnedCount >= 3) {
        showToast('Maksimal 3 pesan disematkan. Lepas pin salah satu dulu.')
        return
      }
    }
    const newPinState = pin ? 'TRUE' : 'FALSE'
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_pinned: newPinState } : m))
    )
    try {
      await fetch(`${sheetdbUrl}/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { is_pinned: newPinState } }),
      })
      showToast(pin ? '◆ Pesan disematkan ke wall' : 'Sematkan dilepas')
    } catch {
      // Revert on error
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_pinned: pin ? 'FALSE' : 'TRUE' } : m))
      )
      showToast('Gagal mengubah sematan')
    }
  }

  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch(`${sheetdbUrl}/id/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        showToast('Pesan dihapus')
        setSelectedId(null)
        setTimeout(() => fetchMessages(sheetdbUrl, wallId), 200)
      }
    } catch {
      showToast('Gagal menghapus pesan')
    }
  }

  // Loading
  if (!isLoaded || !ownerChecked) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-[13px] text-[#555555]">
          Masuk untuk melihat inbox kamu.
        </p>
        <SignIn routing="hash" />
      </main>
    )
  }

  // Signed in but wrong user
  if (!isOwner) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[13px] text-[#555555]">
          Kamu tidak punya akses ke inbox ini.
        </p>
        <Link
          to="/message/$username"
          params={{ username }}
          className="text-[11px] text-[#ffffff] uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          ← Kembali
        </Link>
      </main>
    )
  }

  return (
    <InboxLayout
      username={username}
      messages={messages}
      selectedId={selectedId}
      onSelectMessage={setSelectedId}
      onUpdateReply={handleUpdateReply}
      onTogglePin={handleTogglePin}
      onDeleteMessage={handleDeleteMessage}
      toast={toast}
    />
  )
}
