
interface Message {
  id: string;
  content: string;
  alias: string;
  reply?: string;
  is_public: string;
  created_at: string;
}

interface InboxListProps {
  messages: Message[];
  selectedId: string | null;
  onSelectMessage: (id: string) => void;
}

export default function InboxList({ messages, selectedId, onSelectMessage }: InboxListProps) {
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days}d yang lalu`;
  };

  const truncateText = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div>
      <div className="px-4 py-3 border-b border-[#f0f0f0]">
        <h2 className="text-[11px] font-sans text-[#aaaaaa] font-medium uppercase tracking-widest">
          Pesan Terbaru
        </h2>
      </div>

      {messages.length === 0 ? (
        <div className="p-4 text-center text-[#aaaaaa] text-[14px]">
          Tidak ada pesan
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => onSelectMessage(msg.id)}
            className={`px-3.5 py-2.5 border-b border-[#f0f0f0] cursor-pointer hover:bg-[#f5f5f5] transition-colors ${
              selectedId === msg.id
                ? 'bg-[#f8f8f8] border-l-2 border-l-[#0a0a0a]'
                : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Status dot */}
              <div
                className={`w-[5px] h-[5px] rounded-full mt-1.5 flex-shrink-0 ${
                  msg.reply ? 'bg-[#ddd]' : 'bg-[#0a0a0a]'
                }`}
              />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#333333] truncate">
                  {truncateText(msg.content, 70)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] italic text-[#aaaaaa]">
                    {msg.alias}
                  </span>
                  <span className="text-[10px] text-[#aaaaaa]">
                    {getRelativeTime(msg.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
