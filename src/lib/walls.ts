export interface WallProfile {
  id: string
  clerk_uid: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
  created_at: string
}

const WALLS_URL = import.meta.env.VITE_SHEETDB_WALLS_URL as string | undefined

function parseItems(raw: unknown): WallProfile[] {
  if (!raw || typeof raw !== 'object') return []
  if (Array.isArray(raw)) return raw as WallProfile[]
  const r = raw as Record<string, unknown>
  if (r.error) return []
  return (Array.isArray(r.data) ? r.data : []) as WallProfile[]
}

export async function getWallByClerkUid(clerkUid: string): Promise<WallProfile | null> {
  if (!WALLS_URL) return null
  try {
    const res = await fetch(`${WALLS_URL}/search?clerk_uid=${encodeURIComponent(clerkUid)}`)
    const items = parseItems(await res.json())
    return items[0] ?? null
  } catch {
    return null
  }
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  if (!WALLS_URL) return true
  try {
    const res = await fetch(`${WALLS_URL}/search?username=${encodeURIComponent(username)}`)
    const items = parseItems(await res.json())
    return items.length === 0
  } catch {
    return true
  }
}

export async function createWallProfile(
  data: Omit<WallProfile, 'id' | 'created_at'>,
): Promise<WallProfile | null> {
  if (!WALLS_URL) return null
  try {
    const profile: WallProfile = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...data,
    }
    const res = await fetch(WALLS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [profile] }),
    })
    return res.ok ? profile : null
  } catch {
    return null
  }
}

export async function getWallByUsername(username: string): Promise<WallProfile | null> {
  if (!WALLS_URL) return null
  try {
    const res = await fetch(`${WALLS_URL}/search?username=${encodeURIComponent(username)}`)
    const items = parseItems(await res.json())
    return items[0] ?? null
  } catch {
    return null
  }
}

export async function getRecentWalls(limit = 6): Promise<WallProfile[]> {
  if (!WALLS_URL) return []
  try {
    const res = await fetch(WALLS_URL)
    const items = parseItems(await res.json())
    return items
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  } catch {
    return []
  }
}

export function getCachedProfile(): WallProfile | null {
  try {
    const raw = sessionStorage.getItem('wall_profile')
    return raw ? (JSON.parse(raw) as WallProfile) : null
  } catch {
    return null
  }
}

export function setCachedProfile(profile: WallProfile) {
  sessionStorage.setItem('wall_profile', JSON.stringify(profile))
}

export function clearCachedProfile() {
  sessionStorage.removeItem('wall_profile')
}
