import { Link, useParams } from '@tanstack/react-router'

interface HeaderProps {
  displayName?: string
  bio?: string
  isOwner?: boolean
}

export default function Header({ displayName, bio, isOwner }: HeaderProps) {
  const { username } = useParams({ strict: false }) as { username?: string }
  const name = displayName || username || '[NAMA]'

  return (
    <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-8 relative">

      {/* Top-right actions */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        {isOwner && username && (
          <Link
            to="/message/$username/inbox"
            params={{ username }}
            className="text-[10px] text-[#555555] hover:text-[#ffffff] uppercase tracking-[0.14em] transition-colors border border-[#1e1e1e] rounded-md px-2.5 py-1.5 hover:border-[#333333]"
          >
            Inbox ◆
          </Link>
        )}
        <Link
          to="/"
            className="text-[10px] text-[#555555] hover:text-[#ffffff] uppercase tracking-[0.14em] transition-colors border border-[#1e1e1e] rounded-md px-2.5 py-1.5 hover:border-[#333333]"
        >
          Home ◆ 
        </Link>
      </div>

      <div className="max-w-120 mx-auto text-center">
        <p className="text-[9px] text-[#333333] uppercase tracking-[0.22em] mb-3">
          titipkan pesan untuk
        </p>

        <h1 className="display-title italic text-[34px] text-[#ffffff] mb-2 leading-tight">
          {name}
        </h1>

        {username && name !== `@${username}` && (
          <p className="text-[11px] text-[#444444] mb-3">@{username}</p>
        )}

        {bio && (
          <p className="text-[12px] text-[#555555] mb-4 max-w-xs mx-auto leading-relaxed">{bio}</p>
        )}

        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-[#1a1a1a] max-w-20" />
          <span className="text-[#2a2a2a] text-[9px]">identitasmu tersembunyi</span>
          <div className="flex-1 h-px bg-[#1a1a1a] max-w-20" />
        </div>
      </div>
    </header>
  )
}
