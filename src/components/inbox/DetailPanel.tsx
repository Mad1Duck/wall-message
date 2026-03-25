
import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  alias: string;
  reply?: string;
  is_public: string;
  created_at: string;
}

interface DetailPanelProps {
  message: Message;
  onUpdateReply: (id: string, reply: string, isPublic: boolean) => void;
  onDeleteMessage: (id: string) => void;
}

export default function DetailPanel({
  message,
  onUpdateReply,
  onDeleteMessage,
}: DetailPanelProps) {
  const [reply, setReply] = useState(message.reply || '');
  const [isPublic, setIsPublic] = useState(message.is_public === 'TRUE');
  const [isEditing, setIsEditing] = useState(!message.reply);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdateReply(message.id, reply, isPublic);
    setIsEditing(false);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days}d yang lalu`;
  };

  return (
    <div className="p-4 flex flex-col h-full">
      {/* Original message */}
      <div className="mb-4">
        <p className="font-serif text-[15px] text-[#0a0a0a] leading-relaxed mb-3">
          {message.content}
        </p>
        <p className="text-[11px] italic text-[#aaaaaa]">
          Dari: <span className="font-medium">{message.alias}</span> · {getRelativeTime(message.created_at)}
        </p>
      </div>

      <div className="border-b border-[#eeeeee] mb-4" />

      {/* Existing reply or edit form */}
      {message.reply && !isEditing ? (
        <>
          <div className="bg-[#f5f5f5] rounded p-2.5 mb-4">
            <p className="text-[12px] italic text-[#555555]">{message.reply}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-[11px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors mb-4"
          >
            Edit Balasan
          </button>
        </>
      ) : null}

      {/* Reply form */}
      {isEditing && (
        <>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Tulis balasan..."
            className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded px-3 py-2 text-[12px] text-[#0a0a0a] placeholder-[#aaaaaa] focus:outline-none focus:border-[#0a0a0a] resize-none min-h-[60px] mb-4"
          />

          {/* Show on wall toggle */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#eeeeee]">
            <div className="flex-1">
              <p className="text-[12px] text-[#0a0a0a] font-medium">Tampilkan di Wall</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-[#0a0a0a]' : 'bg-[#e0e0e0]'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  isPublic ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={handleSave}
              className="w-full bg-[#0a0a0a] text-white py-2 px-4 rounded text-[12px] font-medium hover:bg-[#2a2a2a] transition-colors"
            >
              Tampilkan di Wall
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setReply(message.reply || '');
                setIsPublic(message.is_public === 'TRUE');
              }}
              className="w-full bg-white border border-[#e0e0e0] text-[#0a0a0a] py-2 px-4 rounded text-[12px] font-medium hover:bg-[#f5f5f5] transition-colors"
            >
              Simpan Privat
            </button>
          </div>

          {/* Delete section */}
          <div className="mt-6 pt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-[11px] text-[#aaaaaa] hover:text-[#0a0a0a] transition-colors text-center w-full"
              >
                hapus pesan ini
              </button>
            ) : (
              <div className="bg-[#f5f5f5] rounded p-3 text-center">
                <p className="text-[11px] text-[#666666] mb-3">Yakin?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDeleteMessage(message.id)}
                    className="flex-1 text-[11px] bg-[#0a0a0a] text-white py-1.5 rounded hover:bg-[#2a2a2a] transition-colors"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 text-[11px] bg-white border border-[#e0e0e0] text-[#0a0a0a] py-1.5 rounded hover:bg-[#f8f8f8] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
