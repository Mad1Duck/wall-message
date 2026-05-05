const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export interface Message {
  id: string;
  wall_id: string;
  recipient: string;
  content: string;
  alias: string;
  reply: string;
  is_public: boolean;
  is_pinned: boolean;
  react_heart: number;
  react_fire: number;
  react_cry: number;
  created_at: string;
}

export async function getMessagesByWallId(wallId: string): Promise<Message[]> {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/messages/by-wall/${encodeURIComponent(wallId)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function sendMessage(data: {
  wall_id: string;
  recipient: string;
  content: string;
  alias: string;
}): Promise<Message | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateMessage(
  id: string,
  data: { reply?: string; is_public?: boolean; is_pinned?: boolean; },
): Promise<Message | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/api/messages/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function reactToMessage(
  id: string,
  type: 'heart' | 'fire' | 'cry',
): Promise<Message | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/messages/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getMessageStats(): Promise<{
  counts: Record<string, number>;
  lastAt: Record<string, string>;
}> {
  if (!API_URL) return { counts: {}, lastAt: {} };
  try {
    const res = await fetch(`${API_URL}/api/messages/stats`);
    if (!res.ok) return { counts: {}, lastAt: {} };
    return await res.json();
  } catch {
    return { counts: {}, lastAt: {} };
  }
}
