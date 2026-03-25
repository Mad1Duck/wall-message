interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#2a2a2a] rounded-lg px-4 py-3 text-[#ffffff] text-sm pointer-events-none z-[10000] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  );
}
