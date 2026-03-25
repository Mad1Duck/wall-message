import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react';
import PasswordGate from '@/components/inbox/PasswordGate';
import InboxLayout from '@/components/inbox/InboxLayout';

export const Route = createFileRoute('/inbox/')({
  component: RouteComponent,
})

interface Message {
  id: string;
  content: string;
  alias: string;
  reply?: string;
  is_public: string;
  created_at: string;
}

export default function RouteComponent() {
  const [unlocked, setUnlocked] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetdbUrl, setSheetdbUrl] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const toastTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUnlocked = sessionStorage.getItem('inbox_unlocked') === 'true';
      if (isUnlocked) {
        setUnlocked(true);
      }
    }

    const url = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (url) {
      setSheetdbUrl(url);
      if (unlocked) {
        fetchMessages(url);
        const interval = setInterval(() => fetchMessages(url), 20000);
        return () => clearInterval(interval);
      }
    }
  }, [unlocked]);

  const fetchMessages = async (url: string) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const sorted = (data.data || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setMessages(sorted);
        
        if (sorted.length > messages.length) {
          showToast('◆ Pesan baru masuk');
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleUnlock = () => {
    setUnlocked(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('inbox_unlocked', 'true');
    }
    if (sheetdbUrl) {
      fetchMessages(sheetdbUrl);
      const interval = setInterval(() => fetchMessages(sheetdbUrl), 20000);
      return () => clearInterval(interval);
    }
  };

  const handleUpdateReply = async (id: string, reply: string, isPublic: boolean) => {
    try {
      const response = await fetch(`${sheetdbUrl}/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            reply,
            is_public: isPublic ? 'TRUE' : 'FALSE',
          },
        }),
      });
      if (response.ok) {
        showToast('Balasan disimpan');
        if (sheetdbUrl) {
          setTimeout(() => fetchMessages(sheetdbUrl), 200);
        }
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      showToast('Gagal menyimpan balasan');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch(`${sheetdbUrl}/id/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast('Pesan dihapus');
        setSelectedId(null);
        if (sheetdbUrl) {
          setTimeout(() => fetchMessages(sheetdbUrl), 200);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast('Gagal menghapus pesan');
    }
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  if (!unlocked) {
    return <PasswordGate onUnlock={handleUnlock} />;
  }

  return (
    <InboxLayout
      messages={messages}
      selectedId={selectedId}
      onSelectMessage={setSelectedId}
      onUpdateReply={handleUpdateReply}
      onDeleteMessage={handleDeleteMessage}
      toast={toast}
    />
  );
}
