import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useUser, SignIn } from '@clerk/clerk-react'
import InboxLayout from '#/components/inbox/InboxLayout'
import { getCachedProfile, getWallByClerkUid, setCachedProfile } from '#/lib/walls'
import { useMessages, useUpdateMessage, useDeleteMessage } from '#/features/messages'
import { useMiniWalls, useCreateMiniWall, useDeleteMiniWall } from '#/features/mini-walls'

export const Route = createFileRoute('/message/$username/inbox')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { username } = Route.useParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wallId, setWallId] = useState<string>('')
  const { data: messages = [] } = useMessages(wallId || undefined)
  const { data: miniWalls = [] } = useMiniWalls(wallId || undefined)
  const createMiniWallMutation = useCreateMiniWall()
  const deleteMiniWallMutation = useDeleteMiniWall()
  const updateMutation = useUpdateMessage()
  const deleteMessageMutation = useDeleteMessage()
  const [showMiniWallModal, setShowMiniWallModal] = useState(false)
  const [newMiniWall, setNewMiniWall] = useState({ name: '', slug: '', description: '' })
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

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message: '', visible: false })
    }, 3000)
  }

  const handleUpdateReply = (id: string, reply: string, isPublic: boolean) => {
    updateMutation.mutate(
      { id, data: { reply, is_public: isPublic } },
      {
        onSuccess: () => showToast('Balasan disimpan'),
        onError: () => showToast('Gagal menyimpan balasan'),
      },
    )
  }

  const handleTogglePin = (id: string, pin: boolean) => {
    if (pin) {
      const pinnedCount = messages.filter((m) => m.is_pinned).length
      if (pinnedCount >= 3) {
        showToast('Maksimal 3 pesan disematkan. Lepas pin salah satu dulu.')
        return
      }
    }
    updateMutation.mutate(
      { id, data: { is_pinned: pin } },
      {
        onSuccess: () => showToast(pin ? '◆ Pesan disematkan ke wall' : 'Sematkan dilepas'),
        onError: () => showToast('Gagal mengubah sematan'),
      },
    )
  }

  const handleDeleteMessage = (id: string) => {
    deleteMessageMutation.mutate(
      { id, wallId },
      {
        onSuccess: () => {
          showToast('Pesan dihapus')
          setSelectedId(null)
        },
        onError: () => showToast('Gagal menghapus pesan'),
      },
    )
  }

  const handleCreateMiniWall = () => {
    if (!wallId || !newMiniWall.name || !newMiniWall.slug) return
    createMiniWallMutation.mutate(
      { wallId, name: newMiniWall.name, slug: newMiniWall.slug, description: newMiniWall.description },
      {
        onSuccess: () => {
          showToast('Mini wall dibuat')
          setShowMiniWallModal(false)
          setNewMiniWall({ name: '', slug: '', description: '' })
        },
        onError: () => showToast('Gagal membuat mini wall'),
      },
    )
  }

  const handleDeleteMiniWall = (id: string) => {
    deleteMiniWallMutation.mutate(id, {
      onSuccess: () => showToast('Mini wall dihapus'),
      onError: () => showToast('Gagal menghapus mini wall'),
    })
  }

  // Loading
  if (!isLoaded || !ownerChecked) {
    return (
      <main className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[var(--w-bg)] flex flex-col items-center justify-center gap-6 px-4">
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
      <main className="min-h-screen bg-[var(--w-bg)] flex flex-col items-center justify-center gap-4 px-4">
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
      miniWalls={miniWalls}
      onCreateMiniWall={() => setShowMiniWallModal(true)}
      onDeleteMiniWall={handleDeleteMiniWall}
    />
  )

  // Mini Wall Creation Modal
  if (showMiniWallModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-6 w-full max-w-md">
          <h3 className="text-[#ffffff] font-serif italic text-[18px] mb-4">Buat Mini Wall</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[#777777] text-[11px] uppercase tracking-widest mb-2">Nama</label>
              <input
                type="text"
                value={newMiniWall.name}
                onChange={(e) => setNewMiniWall({ ...newMiniWall, name: e.target.value })}
                placeholder="e.g., App ABC"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ffffff] text-[13px] focus:border-[#444444] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#777777] text-[11px] uppercase tracking-widest mb-2">Slug</label>
              <input
                type="text"
                value={newMiniWall.slug}
                onChange={(e) => setNewMiniWall({ ...newMiniWall, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="e.g., app-abc"
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ffffff] text-[13px] focus:border-[#444444] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#777777] text-[11px] uppercase tracking-widest mb-2">Deskripsi</label>
              <textarea
                value={newMiniWall.description}
                onChange={(e) => setNewMiniWall({ ...newMiniWall, description: e.target.value })}
                placeholder="Deskripsi mini wall ini..."
                rows={3}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#ffffff] text-[13px] focus:border-[#444444] focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowMiniWallModal(false)}
                className="flex-1 border border-[#2a2a2a] text-[#555555] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:border-[#3a3a3a] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCreateMiniWall}
                disabled={!newMiniWall.name || !newMiniWall.slug}
                className="flex-1 bg-[#ffffff] text-[#0a0a0a] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:bg-[#cccccc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Buat
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
