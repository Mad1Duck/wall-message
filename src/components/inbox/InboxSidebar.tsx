
interface InboxSidebarProps {
  stats: {
    total: number;
    unreplied: number;
    public: number;
  };
  filter: 'all' | 'unreplied' | 'replied';
  onFilterChange: (filter: 'all' | 'unreplied' | 'replied') => void;
}

export default function InboxSidebar({ stats, filter, onFilterChange }: InboxSidebarProps) {
  const filterOptions: Array<{ id: 'all' | 'unreplied' | 'replied'; label: string }> = [
    { id: 'all', label: 'Semua' },
    { id: 'unreplied', label: 'Belum' },
    { id: 'replied', label: 'Sudah' },
  ];

  return (
    <aside className="w-full lg:w-[200px] bg-white border-b lg:border-b-0 lg:border-r border-[#e8e8e8] p-5">
      {/* Logo */}
      <h1 className="font-serif text-[18px] text-[#0a0a0a] mb-6 font-normal">Kotak Masuk</h1>

      {/* Stats */}
      <div className="space-y-2 mb-8">
        <StatBlock label="Total Masuk" value={stats.total} />
        <StatBlock label="Belum Dibalas" value={stats.unreplied} />
        <StatBlock label="Tampil di Wall" value={stats.public} />
      </div>

      {/* Filters */}
      <div className="flex lg:flex-col gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`text-[11px] font-sans px-3 py-2 rounded transition-colors font-medium uppercase tracking-tight ${
              filter === option.id
                ? 'bg-[#0a0a0a] text-white'
                : 'text-[#0a0a0a] hover:bg-[#f5f5f5]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#f5f5f5] rounded p-2">
      <div className="text-[20px] font-sans font-medium text-[#0a0a0a]">{value}</div>
      <div className="text-[11px] font-sans text-[#aaaaaa]">{label}</div>
    </div>
  );
}
