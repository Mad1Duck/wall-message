
import { useState } from 'react';
import InboxSidebar from './InboxSidebar';
import InboxList from './InboxList';
import DetailPanel from './DetailPanel';
import InboxToast from './InboxToast';

interface Message {
  id: string;
  content: string;
  alias: string;
  reply?: string;
  is_public: string;
  created_at: string;
}

interface InboxLayoutProps {
  messages: Message[];
  selectedId: string | null;
  onSelectMessage: (id: string | null) => void;
  onUpdateReply: (id: string, reply: string, isPublic: boolean) => void;
  onDeleteMessage: (id: string) => void;
  toast: { message: string; visible: boolean };
}

export default function InboxLayout({
  messages,
  selectedId,
  onSelectMessage,
  onUpdateReply,
  onDeleteMessage,
  toast,
}: InboxLayoutProps) {
  const [filter, setFilter] = useState<'all' | 'unreplied' | 'replied'>('all');

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unreplied') return !msg.reply;
    if (filter === 'replied') return !!msg.reply;
    return true;
  });

  const stats = {
    total: messages.length,
    unreplied: messages.filter((m) => !m.reply).length,
    public: messages.filter((m) => m.is_public === 'TRUE').length,
  };

  const selectedMessage = messages.find((m) => m.id === selectedId);

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Sidebar */}
        <InboxSidebar
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Message list */}
          <div className="h-[45%] border-b border-[#e8e8e8] overflow-y-auto">
            <InboxList
              messages={filteredMessages}
              selectedId={selectedId}
              onSelectMessage={onSelectMessage}
            />
          </div>

          {/* Detail panel */}
          <div className="h-[55%] overflow-y-auto">
            {selectedMessage ? (
              <DetailPanel
                message={selectedMessage}
                onUpdateReply={onUpdateReply}
                onDeleteMessage={onDeleteMessage}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-[#aaaaaa] text-[14px]">
                Pilih pesan untuk melihat detail
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <InboxToast message={toast.message} visible={toast.visible} />
    </main>
  );
}
