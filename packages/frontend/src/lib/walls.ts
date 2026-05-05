export interface WallProfile {
  id: string;
  clerk_uid: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export async function getWallByClerkUid(clerkUid: string): Promise<WallProfile | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/walls/by-clerk/${encodeURIComponent(clerkUid)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!API_URL) return true;
  try {
    const res = await fetch(`${API_URL}/api/walls/check-username/${encodeURIComponent(username)}`);
    if (!res.ok) return true;
    const data = await res.json();
    return data.available === true;
  } catch {
    return true;
  }
}

export async function createWallProfile(
  data: Omit<WallProfile, 'id' | 'created_at'>,
): Promise<WallProfile | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/walls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerk_uid: data.clerk_uid,
        username: data.username,
        display_name: data.display_name,
        bio: data.bio,
        avatar_url: data.avatar_url,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getWallByUsername(username: string): Promise<WallProfile | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/walls/by-username/${encodeURIComponent(username)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getRecentWalls(limit = 6): Promise<WallProfile[]> {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/walls`);
    if (!res.ok) return [];
    const data: WallProfile[] = await res.json();
    return data.slice(0, limit);
  } catch {
    return [];
  }
}

export function getCachedProfile(): WallProfile | null {
  try {
    const raw = sessionStorage.getItem('wall_profile');
    return raw ? (JSON.parse(raw) as WallProfile) : null;
  } catch {
    return null;
  }
}

export function setCachedProfile(profile: WallProfile) {
  sessionStorage.setItem('wall_profile', JSON.stringify(profile));
}

export function clearCachedProfile() {
  sessionStorage.removeItem('wall_profile');
}
