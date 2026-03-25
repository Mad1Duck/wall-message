import { createFileRoute } from '@tanstack/react-router'

import { useState, useEffect, useRef } from 'react';
import SendForm from '#/components/SendForm';
import MessageWall from '#/components/MessageWall';
import Toast from '@/components/toast';

export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [sheetdbUrl, setSheetdbUrl] = useState<string>('');
  const toastTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Load SheetDB URL from env
    const url = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (url) {
      setSheetdbUrl(url);
      // Fetch initial messages
      fetchMessages(url);
      // Auto-refresh every 30s
      const interval = setInterval(() => fetchMessages(url), 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchMessages = async (url: string) => {
    try {
      const response = await fetch(`${url}?is_public=TRUE`);
      if (response.ok) {
        const data = await response.json();
        // Sort by created_at DESC
        const sorted = (data.data || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setMessages(sorted);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  const handleMessageSent = async () => {
    showToast('◆ Pesanmu sudah terkirim');
    if (sheetdbUrl) {
      // Wait a moment for the sheet to update
      setTimeout(() => fetchMessages(sheetdbUrl), 500);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] overflow-hidden relative">
      {/* Animated background diamonds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => {
          const duration = 12 + Math.random() * 10; // 12-22s
          const delay = Math.random() * 5; // 0-5s
          const xOffset = (Math.random() - 0.5) * 40; // ±20px
          return (
            <div
              key={i}
              className="absolute text-[#ffffff]"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `drift-up ${duration}s linear ${delay}s infinite`,
                fontSize: '6px',
                opacity: 0.08,
              }}
            >
              ◆
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 px-4 py-8">
          <SendForm onMessageSent={handleMessageSent} sheetdbUrl={sheetdbUrl} />
          <MessageWall messages={messages} />
        </div>
      </div>

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />
    </main>
  );
}

