import { api } from '#/lib/axios';
import type { MiniWall, CreateMiniWallInput, UpdateMiniWallInput } from '../types';

export const miniWallKeys = {
  all: ['mini-walls'] as const,
  byWall: (wallId: string) => ['mini-walls', 'byWall', wallId] as const,
  byId: (id: string) => ['mini-walls', 'byId', id] as const,
  bySlug: (wallId: string, slug: string) => ['mini-walls', 'bySlug', wallId, slug] as const,
};

export const miniWallsApi = {
  getByWallId: async (wallId: string): Promise<MiniWall[]> => {
    const { data } = await api.get<MiniWall[]>(`/mini-walls/wall/${encodeURIComponent(wallId)}`);
    return data;
  },

  getBySlug: async (wallId: string, slug: string): Promise<MiniWall> => {
    const { data } = await api.get<MiniWall>(
      `/mini-walls/wall/${encodeURIComponent(wallId)}/${encodeURIComponent(slug)}`,
    );
    return data;
  },

  getById: async (id: string): Promise<MiniWall> => {
    const { data } = await api.get<MiniWall>(`/mini-walls/${encodeURIComponent(id)}`);
    return data;
  },

  create: async (input: CreateMiniWallInput): Promise<MiniWall> => {
    const { data } = await api.post<MiniWall>('/mini-walls', input);
    return data;
  },

  update: async (id: string, input: UpdateMiniWallInput): Promise<MiniWall> => {
    const { data } = await api.put<MiniWall>(`/mini-walls/${encodeURIComponent(id)}`, input);
    return data;
  },

  remove: async (id: string): Promise<MiniWall> => {
    const { data } = await api.delete<MiniWall>(`/mini-walls/${encodeURIComponent(id)}`);
    return data;
  },

  getMessageCount: async (id: string): Promise<number> => {
    const { data } = await api.get<{ count: number; }>(`/mini-walls/${encodeURIComponent(id)}/message-count`);
    return data.count;
  },
};
