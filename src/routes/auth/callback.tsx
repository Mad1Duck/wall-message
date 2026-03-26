import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { getWallByClerkUid, getCachedProfile, setCachedProfile } from '#/lib/walls'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !user) {
      navigate({ to: '/' })
      return
    }

    // Check cache first
    const cached = getCachedProfile()
    if (cached && cached.clerk_uid === user.id) {
      navigate({ to: '/message/$username', params: { username: cached.username } })
      return
    }

    getWallByClerkUid(user.id).then((wall) => {
      if (wall) {
        setCachedProfile(wall)
        navigate({ to: '/message/$username', params: { username: wall.username } })
      } else {
        navigate({ to: '/setup' })
      }
    })
  }, [isLoaded, isSignedIn, user])

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-4 h-4 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin" />
      <p className="text-[11px] text-[#444444] uppercase tracking-[0.15em]">◆ Memproses login...</p>
    </main>
  )
}
