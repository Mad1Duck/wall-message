import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'

export default function HeaderUser() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const displayName = user?.username || user?.firstName || 'Profil'

  return (
    <>
      <SignedIn>
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="text-[11px] text-[#555555] hover:text-[#ffffff] transition-colors uppercase tracking-widest"
          >
            {displayName}
          </Link>
          <button
            onClick={() => signOut()}
            className="text-[11px] text-[#333333] hover:text-[#ffffff] transition-colors uppercase tracking-widest"
          >
            Keluar
          </button>
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="text-[11px] text-[#555555] hover:text-[#ffffff] transition-colors uppercase tracking-widest">
            Masuk
          </button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
