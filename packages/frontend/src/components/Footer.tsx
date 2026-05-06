import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--w-border)] bg-[var(--w-bg)] px-6 py-10">
      <div className="max-w-140 mx-auto flex flex-col items-center gap-6">

        {/* Wordmark */}
        <Link to="/" className="font-serif italic text-[18px] text-[var(--w-text-dim)] hover:text-[var(--w-text-muted)] transition-colors tracking-wide">
          ◆ Titipkan
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-[10px] text-[var(--w-text-dim)] hover:text-[var(--w-text-muted)] uppercase tracking-[0.18em] transition-colors"
          >
            Beranda
          </Link>
          <span className="text-[var(--w-border)] text-[8px]">◆</span>
          <Link
            to="/explore"
            className="text-[10px] text-[var(--w-text-dim)] hover:text-[var(--w-text-muted)] uppercase tracking-[0.18em] transition-colors"
          >
            Jelajahi
          </Link>
        </nav>

        {/* Tagline + copyright */}
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10px] text-[var(--w-border-mid)] tracking-[0.12em] text-center">
            Tulis yang tak bisa diucapkan.
          </p>
          <p className="text-[9px] text-[var(--w-border)] tracking-widest uppercase">
            © {new Date().getFullYear()} Titipkan
          </p>
        </div>

      </div>
    </footer>
  )
}
