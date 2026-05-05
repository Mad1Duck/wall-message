export type MiniWall = {
  id: string
  wallId: string
  name: string
  slug: string
  description: string
  createdAt: string
}

export type CreateMiniWallInput = {
  wallId: string
  name: string
  slug: string
  description: string
}

export type UpdateMiniWallInput = {
  name?: string
  slug?: string
  description?: string
}
