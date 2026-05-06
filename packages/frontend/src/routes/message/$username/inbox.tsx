import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useUser, SignIn } from '@clerk/clerk-react'
import InboxLayout from '#/components/inbox/InboxLayout'
import { getCachedProfile, getWallByClerkUid, getWallByUsername, setCachedProfile } from '#/lib/walls'
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
  const [createdMiniWall, setCreatedMiniWall] = useState<{ id: string; slug: string } | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
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

  const handleCreateMiniWall = async () => {
    if (!newMiniWall.name || !newMiniWall.slug) return
    
    let targetWallId = wallId
    
    // If wallId is not set, fetch it by username from URL
    if (!targetWallId) {
      const wall = await getWallByUsername(username)
      if (wall) {
        targetWallId = wall.id
        setWallId(wall.id)
        setCachedProfile(wall)
      }
    }
    
    if (!targetWallId) {
      showToast('Gagal: Wall ID tidak ditemukan')
      return
    }
    
    createMiniWallMutation.mutate(
      { wall_id: targetWallId, name: newMiniWall.name, slug: newMiniWall.slug, description: newMiniWall.description },
      {
        onSuccess: (data) => {
          showToast('Mini wall dibuat')
          setCreatedMiniWall({ id: data.id, slug: data.slug })
          setNewMiniWall({ name: '', slug: '', description: '' })
        },
        onError: () => showToast('Gagal membuat mini wall'),
      },
    )
  }

  const handleCopyShare = () => {
    if (!createdMiniWall || !username) return
    const shareUrl = `${window.location.origin}/message/${username}/${createdMiniWall.slug}`
    navigator.clipboard.writeText(shareUrl)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const handleCloseShare = () => {
    setCreatedMiniWall(null)
    setShowMiniWallModal(false)
    setShareCopied(false)
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
        <div className="w-5 h-5 border-2 border-[var(--w-text)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[var(--w-bg)] flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-[13px] text-[var(--w-text-muted)]">
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
        <p className="text-[13px] text-[var(--w-text-muted)]">
          Kamu tidak punya akses ke inbox ini.
        </p>
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
    <>
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
        wallId={wallId}
      />

      {/* Mini Wall Creation Modal */}
      {showMiniWallModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--w-surface)] border border-[var(--w-border)] rounded-xl p-6 w-full max-w-md">
            {createdMiniWall ? (
              // Share screen after creation
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-[32px] mb-2">✓</div>
                  <h3 className="text-[var(--w-text)] font-serif italic text-[18px] mb-2">Mini Wall Berhasil Dibuat!</h3>
                  <p className="text-[11px] text-[var(--w-text-muted)]">Bagikan mini wall ini dengan orang lain</p>
                </div>
                <div className="bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg p-3 flex items-center gap-2">
                  <code className="flex-1 text-[11px] text-[var(--w-text-muted)] break-all font-mono">
                    {window.location.origin}/message/{username}/{createdMiniWall?.slug}
                  </code>
                  <button
                    onClick={handleCopyShare}
                    className="shrink-0 text-[11px] text-[var(--w-text)] hover:text-[var(--w-text-2)] transition-colors whitespace-nowrap"
                  >
                    {shareCopied ? '✓ Disalin' : 'Salin'}
                  </button>
                </div>
                <button
                  onClick={handleCloseShare}
                  className="w-full bg-[var(--w-text)] text-[var(--w-bg)] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:bg-[var(--w-text-2)] transition-colors"
                >
                  Selesai
                </button>
              </div>
            ) : (
              // Creation form
              <>
                <h3 className="text-[var(--w-text)] font-serif italic text-[18px] mb-4">Buat Mini Wall</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-2">Nama</label>
                    <input
                      type="text"
                      value={newMiniWall.name}
                      onChange={(e) => setNewMiniWall({ ...newMiniWall, name: e.target.value })}
                      placeholder="e.g., App ABC"
                      className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-2">Slug</label>
                    <input
                      type="text"
                      value={newMiniWall.slug}
                      onChange={(e) => setNewMiniWall({ ...newMiniWall, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="e.g., app-abc"
                      className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--w-text-dim)] text-[11px] uppercase tracking-widest mb-2">Deskripsi</label>
                    <textarea
                      value={newMiniWall.description}
                      onChange={(e) => setNewMiniWall({ ...newMiniWall, description: e.target.value })}
                      placeholder="Deskripsi mini wall ini..."
                      rows={3}
                      className="w-full bg-[var(--w-surface-2)] border border-[var(--w-border-mid)] rounded-lg px-3 py-2 text-[var(--w-text)] text-[13px] focus:border-[var(--w-border-strong)] focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowMiniWallModal(false)}
                      className="flex-1 border border-[var(--w-border-mid)] text-[var(--w-text-muted)] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:border-[var(--w-border-strong)] transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateMiniWall}
                      disabled={!newMiniWall.name || !newMiniWall.slug}
                      className="flex-1 bg-[var(--w-text)] text-[var(--w-bg)] font-medium py-2 rounded-lg text-[11px] uppercase tracking-[0.04em] hover:bg-[var(--w-text-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Buat
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
