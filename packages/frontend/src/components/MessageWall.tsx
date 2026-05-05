import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useReactToMessage } from '#/features/messages';
import type { Message } from '#/features/messages';

interface MessageWallProps {
  messages: Message[];
  wallId?: string;
}

interface ReactionCounts {
  [messageId: string]: {
    heart: number;
    fire: number;
    cry: number;
  };
}

interface PopStates {
  [key: string]: boolean;
}

function formatTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: idLocale,
    });
  } catch {
    return 'recently';
  }
}

function MessageCard({
  message,
  index,
  pinned,
  reactionCounts,
  popStates,
  onReaction,
  hasReacted,
  getTotalReactions,
}: {
  message: Message;
  index: number;
  pinned: boolean;
  reactionCounts: ReactionCounts;
  popStates: PopStates;
  onReaction: (id: string, emoji: 'heart' | 'fire' | 'cry') => void;
  hasReacted: (id: string) => boolean;
  getTotalReactions: (id: string) => number;
}) {
  return (
    <div
      className={`relative rounded-[12px] p-3.5 ${
        pinned
          ? 'bg-[#0d0d0d] border border-[#2a2a2a]'
          : 'bg-[#0d0d0d] border border-[#1a1a1a]'
      }`}
      style={{
        animation: `stagger-in 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      {/* Pinned decorations */}
      {pinned && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[7px] bg-[#1a1a1a] text-[#666666] px-1.5 py-0.5 rounded uppercase tracking-[0.06em]">
            Pilihan
          </span>
          <span className="text-[#333333] text-[10px]">◆</span>
        </div>
      )}

      {/* Message content */}
      <p className="text-[13px] text-[#cccccc] font-serif leading-[1.6] mb-3">
        {message.content}
      </p>

      {/* From line */}
      <p className="text-[11px] text-[#444444] italic mb-3">
        — {message.alias}
      </p>

      {/* Reply block */}
      {message.reply && (
        <div className="border-l-[1.5px] border-[#ffffff] pl-2.5 mt-3 pt-3 border-t border-t-[#1a1a1a]">
          <p className="text-[12px] text-[#888888] italic mb-1">
            {message.reply}
          </p>
          <p className="text-[10px] text-[#444444]">
            — Balasan admin • {formatTime(message.created_at)}
          </p>
        </div>
      )}

      {/* Timestamp (only if no reply) */}
      {!message.reply && (
        <p className="text-[10px] text-[#444444]">
          {formatTime(message.created_at)}
        </p>
      )}

      {/* Reaction buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-t-[#1a1a1a]">
        <div className="flex gap-1.5">
          {[
            { emoji: '❤️', type: 'heart' as const },
            { emoji: '🔥', type: 'fire' as const },
            { emoji: '😭', type: 'cry' as const },
          ].map(({ emoji, type }) => {
            const count = reactionCounts[message.id]?.[type] || 0;
            const reacted = hasReacted(message.id);
            const popKey = `${message.id}_${type}`;
            const isPopping = popStates[popKey];
            const hasReactedEmoji =
              localStorage.getItem(`reacted_${message.id}_${type}`) !== null;

            return (
              <button
                key={type}
                onClick={() => onReaction(message.id, type)}
                disabled={reacted}
                className={`flex items-center gap-1 px-2.5 py-0.75 rounded-full text-[12px] border border-[#2a2a2a] transition-all ${
                  reacted
                    ? 'opacity-40 cursor-not-allowed bg-transparent text-[#666]'
                    : hasReactedEmoji
                      ? 'bg-[#1a1a1a] text-white border-white'
                      : 'bg-transparent text-[#666] hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <span>{emoji}</span>
                <span
                  style={{
                    animation: isPopping ? 'pop 0.25s ease-out' : 'none',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {getTotalReactions(message.id) > 0 && (
          <span className="text-[10px] text-[#444444] ml-2">
            {getTotalReactions(message.id)} reactions
          </span>
        )}
      </div>
    </div>
  );
}

export default function MessageWall({ messages, wallId = '' }: MessageWallProps) {
  const [popStates, setPopStates] = useState<PopStates>({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const reactMutation = useReactToMessage(wallId);

  const publicMessages = messages.filter((m) => m.is_public);
  const pinnedMessages = publicMessages.filter((m) => m.is_pinned).slice(0, 3);
  const regularMessages = publicMessages.filter((m) => !m.is_pinned);

  const reactionCounts: ReactionCounts = {};
  publicMessages.forEach((msg) => {
    reactionCounts[msg.id] = {
      heart: msg.react_heart,
      fire: msg.react_fire,
      cry: msg.react_cry,
    };
  });

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleReaction = (messageId: string, emoji: 'heart' | 'fire' | 'cry') => {
    const reactionKey = `reacted_${messageId}`;
    const emojiKey = `reacted_${messageId}_${emoji}`;

    if (localStorage.getItem(reactionKey) || localStorage.getItem(emojiKey)) {
      showToastMsg('Sudah bereaksi');
      return;
    }

    const popKey = `${messageId}_${emoji}`;
    setPopStates((prev) => ({ ...prev, [popKey]: true }));
    setTimeout(() => setPopStates((prev) => ({ ...prev, [popKey]: false })), 300);

    reactMutation.mutate(
      { id: messageId, type: emoji },
      {
        onSuccess: () => {
          localStorage.setItem(emojiKey, '1');
          localStorage.setItem(reactionKey, emoji);
          showToastMsg('Bereaksi!');
        },
        onError: () => showToastMsg('Gagal bereaksi'),
      },
    );
  };

  const hasReacted = (messageId: string) =>
    localStorage.getItem(`reacted_${messageId}`) !== null;

  const getTotalReactions = (messageId: string) => {
    const c = reactionCounts[messageId] || { heart: 0, fire: 0, cry: 0 };
    return c.heart + c.fire + c.cry;
  };

  const cardProps = { reactionCounts, popStates, onReaction: handleReaction, hasReacted, getTotalReactions };

  return (
    <section className="max-w-120 mx-auto">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-[12px] text-[#555555] uppercase tracking-[0.04em] font-medium">
          Pesan yang Dibalas
        </h2>
        <div className="bg-[#1e1e1e] text-[#555555] rounded px-2 py-1 text-[10px] font-medium min-w-fit">
          {publicMessages.length}
        </div>
      </div>

      {publicMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-5xl text-[#1e1e1e]">◆</div>
          <p className="text-[13px] text-[#444444]">Belum ada pesan dibalas.</p>
        </div>
      ) : (
        <>
          {/* ── Pinned section ── */}
          {pinnedMessages.length > 0 && (
            <div
              className="mb-4"
              style={{ animation: 'stagger-in 0.4s ease-out 0ms both' }}
            >
              <p className="text-[10px] text-[#555555] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5">
                <span>◆</span>
                <span>Pesan Disematkan</span>
              </p>
              <div className="space-y-2">
                {pinnedMessages.map((message, i) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    index={i}
                    pinned={true}
                    {...cardProps}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          {pinnedMessages.length > 0 && regularMessages.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#1a1a1a]" />
              <span className="text-[11px] text-[#444444] shrink-0">
                Pesan Lainnya ({regularMessages.length})
              </span>
              <div className="flex-1 h-px bg-[#1a1a1a]" />
            </div>
          )}

          {/* ── Regular messages ── */}
          {regularMessages.length > 0 && (
            <div className="space-y-4">
              {regularMessages.map((message, i) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  index={i}
                  pinned={false}
                  {...cardProps}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[#1a1a1a] text-white px-4 py-2 rounded text-[12px] border border-[#2a2a2a] animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}
    </section>
  );
}
