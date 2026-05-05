import { api } from '#/lib/axios';
import type { WallProfile, CreateWallData } from '../types';

export const wallKeys = {
  all: ['walls'] as const,
  byUsername: (username: string) => ['walls', 'byUsername', username] as const,
  byClerk: (clerkUid: string) => ['walls', 'byClerk', clerkUid] as const,
  recent: (limit: number) => ['walls', 'recent', limit] as const,
  checkUsername: (username: string) => ['walls', 'checkUsername', username] as const,
};

export const wallsApi = {
  getByUsername: async (username: string): Promise<WallProfile> => {
    const { data } = await api.get<WallProfile>(`/api/walls/by-username/${encodeURIComponent(username)}`);
    return data;
  },

  getByClerkUid: async (clerkUid: string): Promise<WallProfile> => {
    const { data } = await api.get<WallProfile>(`/api/walls/by-clerk/${encodeURIComponent(clerkUid)}`);
    return data;
  },

  getRecent: async (limit = 6): Promise<WallProfile[]> => {
    const { data } = await api.get<WallProfile[]>('/api/walls');
    return data.slice(0, limit);
  },

  checkUsername: async (username: string): Promise<{ available: boolean; }> => {
    const { data } = await api.get<{ available: boolean; }>(`/api/walls/check-username/${encodeURIComponent(username)}`);
    return data;
  },

  create: async (payload: CreateWallData): Promise<WallProfile> => {
    const { data } = await api.post<WallProfile>('/api/walls', payload);
    return data;
  },
};
