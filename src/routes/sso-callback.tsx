import { createFileRoute } from '@tanstack/react-router'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

export const Route = createFileRoute('/sso-callback')({
  component: SSOCallbackPage,
})

function SSOCallbackPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <AuthenticateWithRedirectCallback />
    </main>
  )
}
