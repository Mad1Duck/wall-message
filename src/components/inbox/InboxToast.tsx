
interface InboxToastProps {
  message: string;
  visible: boolean;
}

export default function InboxToast({ message, visible }: InboxToastProps) {
  return (
    <div
      className={`fixed top-4 right-4 bg-[#0a0a0a] text-white px-4 py-3 rounded text-[12px] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {message}
    </div>
  );
}
