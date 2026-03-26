import { Link } from '@tanstack/react-router'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-[#1a1a1a] px-4 py-6 text-center">
      <p className="text-[11px] text-[#2a2a2a] mb-2">
        © {year} wall message ◆ identitasmu selalu tersembunyi
      </p>
      <Link
        to="/explore"
        className="text-[10px] text-[#2a2a2a] hover:text-[#555555] uppercase tracking-widest transition-colors"
      >
        Jelajahi wall lain →
      </Link>
    </footer>
  )
}
