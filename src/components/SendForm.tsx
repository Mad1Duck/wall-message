
import { useState, useRef } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface SendFormProps {
  onMessageSent: () => void;
  sheetdbUrl: string;
}

export default function SendForm({ onMessageSent, sheetdbUrl }: SendFormProps) {
  const [content, setContent] = useState('');
  const [alias, setAlias] = useState('');
  const [useAlias, setUseAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const charCount = content.length;
  const maxChars = 500;
  const isOverLimit = charCount > 250;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !sheetdbUrl) {
      console.error('Missing content or SheetDB URL');
      return;
    }

    setLoading(true);

    try {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        createDiamondBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      const response = await fetch(sheetdbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              id: crypto.randomUUID(),
              content: content.trim(),
              alias: useAlias && alias.trim() ? alias.trim() : 'Seseorang yang peduli 🌙',
              reply: '',
              is_public: 'FALSE',
              created_at: new Date().toISOString(),
            },
          ],
        }),
      });

      if (response.ok) {
        setContent('');
        setAlias('');
        setUseAlias(false);
        onMessageSent();
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDiamondBurst = (x: number, y: number) => {
    for (let i = 0; i < 8; i++) {
      const diamond = document.createElement('div');
      diamond.textContent = '◆';
      diamond.style.position = 'fixed';
      diamond.style.left = x + 'px';
      diamond.style.top = y + 'px';
      diamond.style.color = '#ffffff';
      diamond.style.fontSize = '16px';
      diamond.style.pointerEvents = 'none';
      diamond.style.zIndex = '9999';
      diamond.style.animation = `diamond-burst 0.6s ease-out forwards`;
      diamond.style.transform = `rotate(${(i / 8) * 360}deg) translateX(20px)`;
      document.body.appendChild(diamond);
      setTimeout(() => diamond.remove(), 600);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-120 mx-auto mb-8">
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-4 space-y-4">
        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Tulis pesanmu di sini..."
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[13px] text-[#aaaaaa] placeholder-[#444444] resize-none focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-transparent"
            style={{ minHeight: '80px' }}
            maxLength={maxChars}
          />
          {/* Char counter */}
          <div
            className={`absolute bottom-2 right-2 text-[11px] font-medium ${
              isOverLimit ? 'text-[#ffffff]' : 'text-[#444444]'
            }`}
          >
            {charCount} / {maxChars}
          </div>
        </div>

        {/* Alias toggle and input */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <label htmlFor="alias-toggle" className="text-[11px] text-[#555555] uppercase tracking-[0.04em]">
              Pakai nama samaran
            </label>
            <ToggleSwitch
              id="alias-toggle"
              checked={useAlias}
              onChange={setUseAlias}
            />
          </div>

          {useAlias && (
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="nama samaran..."
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[13px] text-[#aaaaaa] placeholder-[#444444] focus:outline-none focus:ring-1 focus:ring-[#ffffff] focus:border-transparent"
            />
          )}
        </div>

        {/* Submit button */}
        <button
          ref={buttonRef}
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full bg-[#ffffff] text-[#0a0a0a] font-medium py-2 px-4 rounded-lg text-[13px] uppercase tracking-[0.04em] hover:bg-[#e8e8e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin"></div>
              Mengirim...
            </>
          ) : (
            <>
              Kirim Pesan ◆
            </>
          )}
        </button>
      </div>
    </form>
  );
}
