export default function Header() {
  return (
    <header className="bg-[#0a0a0a] border-b border-[#1e1e1e] py-8 px-4">
      <div className="max-w-120 mx-auto text-center">
        {/* Label */}
        <p className="text-[10px] text-[#555555] uppercase tracking-widest mb-4">
          untuk ✦ [NAMA KAMU]
        </p>

        {/* Hero Title */}
        <h1 className="font-serif italic text-[32px] text-[#ffffff] mb-3 leading-tight">
          Titipkan Pesanmu
        </h1>

        {/* Subtext */}
        <p className="text-[13px] text-[#555555] mb-6">
          Identitasmu akan selalu tersembunyi.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 mb-0">
          <div className="flex-1 h-px bg-[#1e1e1e]"></div>
          <span className="text-[#555555] text-xs">◆</span>
          <div className="flex-1 h-px bg-[#1e1e1e]"></div>
        </div>
      </div>
    </header>
  );
}
