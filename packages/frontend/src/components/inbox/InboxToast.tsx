
interface InboxToastProps {
  message: string;
  visible: boolean;
}

export default function InboxToast({ message, visible }: InboxToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 bg-[#111111] border border-[#1e1e1e] text-[#aaaaaa] px-5 py-3 rounded-xl text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <span className="text-[#444444] mr-2">◆</span>
      {message}
    </div>
  );
}
