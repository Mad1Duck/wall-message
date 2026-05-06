export interface Message {
  id: string;
  wall_id: string;
  mini_wall_id?: string;
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

export type SendMessageData = {
  wall_id: string;
  recipient: string;
  content: string;
  alias: string;
  mini_wall_id?: string;
};

export type UpdateMessageData = {
  reply?: string;
  is_public?: boolean;
  is_pinned?: boolean;
};

export type ReactionType = 'heart' | 'fire' | 'cry';

export interface MessageStats {
  counts: Record<string, number>;
  lastAt: Record<string, string>;
}
