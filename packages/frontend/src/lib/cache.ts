import type { WallProfile } from '#/features/walls'

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
