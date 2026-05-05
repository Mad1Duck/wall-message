import { db } from '../db'
import { miniWalls, walls, messages } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'

export type MiniWallResponse = {
  id: string
  wallId: string
  name: string
  slug: string
  description: string
  createdAt: Date
}

function toResponse(miniWall: typeof miniWalls.$inferSelect): MiniWallResponse {
  return {
    id: miniWall.id,
    wallId: miniWall.wallId,
    name: miniWall.name,
    slug: miniWall.slug,
    description: miniWall.description,
    createdAt: miniWall.createdAt,
  }
}

export class MiniWallsService {
  async getByWallId(wallId: string) {
    const result = await db
      .select()
      .from(miniWalls)
      .where(eq(miniWalls.wallId, wallId))
      .orderBy(desc(miniWalls.createdAt))
    return result.map(toResponse)
  }

  async getBySlug(wallId: string, slug: string) {
    const result = await db
      .select()
      .from(miniWalls)
      .where(and(eq(miniWalls.wallId, wallId), eq(miniWalls.slug, slug)))
      .limit(1)
    return result[0] ? toResponse(result[0]) : null
  }

  async getById(id: string) {
    const result = await db
      .select()
      .from(miniWalls)
      .where(eq(miniWalls.id, id))
      .limit(1)
    return result[0] ? toResponse(result[0]) : null
  }

  async isSlugAvailable(wallId: string, slug: string, excludeId?: string) {
    const conditions = [eq(miniWalls.wallId, wallId), eq(miniWalls.slug, slug)]
    if (excludeId) {
      // @ts-ignore
      conditions.push(eq(miniWalls.id, excludeId))
    }
    const result = await db
      .select()
      .from(miniWalls)
      .where(and(...conditions))
      .limit(1)
    return result.length === 0
  }

  async create(data: {
    wallId: string
    name: string
    slug: string
    description: string
  }) {
    const available = await this.isSlugAvailable(data.wallId, data.slug)
    if (!available) return null

    const result = await db
      .insert(miniWalls)
      .values(data)
      .returning()
    return result[0] ? toResponse(result[0]) : null
  }

  async update(
    id: string,
    data: { name?: string; slug?: string; description?: string }
  ) {
    const existing = await this.getById(id)
    if (!existing) return null

    if (data.slug && data.slug !== existing.slug) {
      const available = await this.isSlugAvailable(existing.wallId, data.slug, id)
      if (!available) return null
    }

    const result = await db
      .update(miniWalls)
      .set(data)
      .where(eq(miniWalls.id, id))
      .returning()
    return result[0] ? toResponse(result[0]) : null
  }

  async remove(id: string) {
    const result = await db
      .delete(miniWalls)
      .where(eq(miniWalls.id, id))
      .returning()
    return result[0] ? toResponse(result[0]) : null
  }

  async getMessageCount(miniWallId: string) {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.miniWallId, miniWallId))
    return result.length
  }
}
