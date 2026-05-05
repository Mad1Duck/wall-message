import { useState, useRef } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { useSendMessage } from '#/features/messages';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Message, SendMessageData } from '#/features/messages';

interface SendFormProps {
  onMessageSent: () => void;
  recipient?: string;
  wallId?: string;
  mutation?: UseMutationResult<Message, Error, SendMessageData>;
}

export default function SendForm({ onMessageSent, recipient, wallId, mutation }: SendFormProps) {
  const ownMutation = useSendMessage();
  const send = mutation ?? ownMutation;
  const [content, setContent] = useState('');
  const [alias, setAlias] = useState('');
  const [useAlias, setUseAlias] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !wallId) {
      if (!wallId) setError('Wall tidak ditemukan.');
      return;
    }
    setError('');
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      createDiamondBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    send.mutate(
      {
        wall_id: wallId,
        recipient: recipient || '',
        content: content.trim(),
        alias: useAlias && alias.trim() ? alias.trim() : 'Seseorang yang peduli 🌙',
      },
      {
        onSuccess: () => {
          setContent('');
          setAlias('');
          setUseAlias(false);
          onMessageSent();
        },
        onError: () => setError('Gagal mengirim pesan. Coba lagi.'),
      },
    );
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

        {/* Error */}
        {error && (
          <p className="text-[11px] text-[#ff6b6b] text-center">{error}</p>
        )}

        {/* Submit button */}
        <button
          ref={buttonRef}
          type="submit"
          disabled={send.isPending || !content.trim()}
          className="w-full border border-[#2a2a2a] text-[#ffffff] font-medium py-2 px-4 rounded-lg text-[13px] uppercase tracking-[0.04em] hover:border-[#555555] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {send.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-[#ffffff] border-t-transparent rounded-full animate-spin"></div>
              Mengirim...
            </>
          ) : (
            'Kirim Pesan ◆'
          )}
        </button>
      </div>
    </form>
  );
}
