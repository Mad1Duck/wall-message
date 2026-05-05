import { createFileRoute } from '@tanstack/react-router'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

export const Route = createFileRoute('/sso-callback')({
  component: SSOCallbackPage,
})

function SSOCallbackPage() {
  return (
    <main className="min-h-screen bg-[var(--w-bg)] flex items-center justify-center">
      <AuthenticateWithRedirectCallback />
    </main>
  )
}
