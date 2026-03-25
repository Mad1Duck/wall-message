
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  alias: string;
  reply: string;
  is_public: string;
  created_at: string;
  react_heart?: number;
  react_fire?: number;
  react_cry?: number;
}

interface MessageWallProps {
  messages: Message[];
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

export default function MessageWall({ messages }: MessageWallProps) {
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({});
  const [popStates, setPopStates] = useState<PopStates>({});
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const publicMessages = messages.filter((m) => m.is_public === 'TRUE');

  useEffect(() => {
    setReactionCounts((prev) => {
      const counts: ReactionCounts = {};
      publicMessages.forEach((msg) => {
        counts[msg.id] = {
          heart: msg.react_heart || 0,
          fire: msg.react_fire || 0,
          cry: msg.react_cry || 0,
        };
      });

      const prevIds = Object.keys(prev);
      const newIds = Object.keys(counts);
      
      if (prevIds.length !== newIds.length) {
        return counts;
      }
      
      const hasChanged = newIds.some((id) => {
        return (
          prev[id]?.heart !== counts[id]?.heart ||
          prev[id]?.fire !== counts[id]?.fire ||
          prev[id]?.cry !== counts[id]?.cry
        );
      });
      
      return hasChanged ? counts : prev;
    });
  }, [publicMessages]);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: idLocale,
      });
    } catch {
      return 'recently';
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleReaction = async (messageId: string, emoji: 'heart' | 'fire' | 'cry') => {
    const reactionKey = `reacted_${messageId}`;
    const emojiKey = `reacted_${messageId}_${emoji}`;
    
    const alreadyReacted = localStorage.getItem(reactionKey);
    if (alreadyReacted) {
      showToastMessage('Sudah bereaksi');
      return;
    }

    if (localStorage.getItem(emojiKey)) {
      showToastMessage('Sudah bereaksi');
      return;
    }

    const reactionFields: { [key: string]: string } = {
      heart: 'react_heart',
      fire: 'react_fire',
      cry: 'react_cry',
    };

    const fieldName = reactionFields[emoji];
    const newCount = (reactionCounts[messageId]?.[emoji] || 0) + 1;

    setReactionCounts((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [emoji]: newCount,
      },
    }));

    const popKey = `${messageId}_${emoji}`;
    setPopStates((prev) => ({ ...prev, [popKey]: true }));
    setTimeout(() => {
      setPopStates((prev) => ({ ...prev, [popKey]: false }));
    }, 300);

    try {
      const sheetdbUrl = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
      if (!sheetdbUrl) {
        console.error('VITE_CLERK_PUBLISHABLE_KEY not set');
        return;
      }

      const response = await fetch(`${sheetdbUrl}/id/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { [fieldName]: newCount } }),
      });

      if (response.ok) {
        localStorage.setItem(emojiKey, '1');
        localStorage.setItem(reactionKey, emoji);
        showToastMessage('Bereaksi!');
      } else {
        setReactionCounts((prev) => ({
          ...prev,
          [messageId]: {
            ...prev[messageId],
            [emoji]: newCount - 1,
          },
        }));
        showToastMessage('Gagal bereaksi');
      }
    } catch (error) {
      setReactionCounts((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          [emoji]: newCount - 1,
        },
      }));
      showToastMessage('Gagal bereaksi');
    }
  };

  const hasReacted = (messageId: string) => {
    return localStorage.getItem(`reacted_${messageId}`) !== null;
  };

  const getTotalReactions = (messageId: string) => {
    const counts = reactionCounts[messageId] || { heart: 0, fire: 0, cry: 0 };
    return counts.heart + counts.fire + counts.cry;
  };

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
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-5xl text-[#1e1e1e]">◆</div>
          <p className="text-[13px] text-[#444444]">Belum ada pesan dibalas.</p>
        </div>
      ) : (
        // Message cards
        <div className="space-y-4">
          {publicMessages.map((message, index) => (
            <div
              key={message.id}
              className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[12px] p-3.5"
              style={{
                animation: `stagger-in 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
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
                    const isReacted = hasReacted(message.id);
                    const popKey = `${message.id}_${type}`;
                    const isPopping = popStates[popKey];
                    const hasReactedEmoji = localStorage.getItem(`reacted_${message.id}_${type}`) !== null;

                    return (
                      <button
                        key={type}
                        onClick={() => handleReaction(message.id, type)}
                        disabled={isReacted}
                        className={`flex items-center gap-1 px-2.5 py-0.75 rounded-full text-[12px] border border-[#2a2a2a] transition-all ${
                          isReacted
                            ? 'opacity-40 cursor-not-allowed bg-transparent text-[#666]'
                            : hasReactedEmoji
                              ? 'bg-[#1a1a1a] text-white border-white'
                              : 'bg-transparent text-[#666] hover:bg-[#1a1a1a] hover:text-white'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span
                          className={`${isPopping ? 'animate-pop' : ''}`}
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
          ))}
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-[#1a1a1a] text-white px-4 py-2 rounded text-[12px] border border-[#2a2a2a] animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}
    </section>
  );
}
