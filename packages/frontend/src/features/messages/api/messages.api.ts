import { api } from '#/lib/axios';
import type { Message, SendMessageData, UpdateMessageData, ReactionType, MessageStats } from '../types';

export const messageKeys = {
  all: ['messages'] as const,
  byWall: (wallId: string) => ['messages', 'byWall', wallId] as const,
  byMiniWall: (miniWallId: string) => ['messages', 'byMiniWall', miniWallId] as const,
  stats: ['messages', 'stats'] as const,
};

export const messagesApi = {
  getByWallId: async (wallId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/api/messages/by-wall/${encodeURIComponent(wallId)}`);
    return data;
  },

  getByMiniWallId: async (miniWallId: string): Promise<Message[]> => {
    const { data } = await api.get<Message[]>(`/api/messages/by-mini-wall/${encodeURIComponent(miniWallId)}`);
    return data;
  },

  send: async (payload: SendMessageData): Promise<Message> => {
    const { data } = await api.post<Message>('/api/messages', payload);
    return data;
  },

  update: async (id: string, payload: UpdateMessageData): Promise<Message> => {
    const { data } = await api.patch<Message>(`/api/messages/${id}`, payload);
    return data;
  },

  deleteById: async (id: string): Promise<void> => {
    await api.delete(`/api/messages/${id}`);
  },

  react: async (id: string, type: ReactionType): Promise<Message> => {
    const { data } = await api.post<Message>(`/api/messages/${id}/react`, { type });
    return data;
  },

  getById: async (id: string): Promise<Message> => {
    const { data } = await api.get<Message>(`/api/messages/${encodeURIComponent(id)}`);
    return data;
  },

  getStats: async (): Promise<MessageStats> => {
    const { data } = await api.get<MessageStats>('/api/messages/stats');
    return data;
  },
};
