import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SignIn, useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) navigate({ to: '/' })
  }, [isSignedIn])

  return (
    <main className="min-h-screen bg-[var(--w-bg)] flex flex-col items-center justify-center px-4 gap-8">
      <p className="text-[10px] text-[#333333] uppercase tracking-[0.18em]">◆ wall message</p>
      <SignIn routing="hash" fallbackRedirectUrl="/" />
    </main>
  )
}
