
import { useState, useRef } from 'react';

interface PasswordGateProps {
  onUnlock: () => void;
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password against env var
    const correctPassword = process.env.NEXT_PUBLIC_OWNER_PASSWORD || 'demo';
    
    if (password === correctPassword) {
      setError('');
      onUnlock();
    } else {
      setError('Kata sandi salah.');
      setIsShaking(true);
      setPassword('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#e8e8e8] rounded-4xl p-8">
        <h1 className="font-serif text-[28px] text-[#0a0a0a] mb-8 text-center font-normal">Masuk</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            ref={inputRef}
            style={isShaking ? { animation: 'shake 0.3s' } : {}}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="kata sandi"
              className="w-full px-4 py-3 text-[14px] bg-[#fafafa] border border-[#e0e0e0] rounded-lg text-[#0a0a0a] placeholder-[#aaaaaa] focus:outline-none focus:border-[#0a0a0a] transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-[12px] text-[#0a0a0a] text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#0a0a0a] text-white py-3 px-4 rounded-lg font-sans text-[12px] font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
          >
            Masuk <span>→</span>
          </button>
        </form>
      </div>
    </main>
  );
}
