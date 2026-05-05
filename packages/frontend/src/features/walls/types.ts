export interface WallProfile {
  id: string
  clerk_uid: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
  created_at: string
}

export type CreateWallData = Omit<WallProfile, 'id' | 'created_at'>
