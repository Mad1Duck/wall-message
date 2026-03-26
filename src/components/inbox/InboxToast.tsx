
interface InboxToastProps {
  message: string;
  visible: boolean;
}

export default function InboxToast({ message, visible }: InboxToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 bg-[#111111] border border-[#2a2a2a] text-[#aaaaaa] px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-widest transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {message}
    </div>
  );
}
