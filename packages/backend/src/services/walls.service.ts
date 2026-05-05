import { Injectable, Singleton } from 'hono-forge';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { walls, type Wall, type NewWall } from '../db/schema';

function toResponse(wall: Wall) {
  return {
    id: wall.id,
    clerk_uid: wall.clerkUid,
    username: wall.username,
    display_name: wall.displayName,
    bio: wall.bio,
    avatar_url: wall.avatarUrl,
    created_at: wall.createdAt.toISOString(),
  };
}

@Injectable()
@Singleton()
export class WallsService {
  async getAll() {
    const result = await db.select().from(walls).orderBy(desc(walls.createdAt));
    return result.map(toResponse);
  }

  async getByClerkUid(clerkUid: string) {
    const result = await db
      .select()
      .from(walls)
      .where(eq(walls.clerkUid, clerkUid))
      .orderBy(desc(walls.createdAt))
      .limit(1);
    return result[0] ? toResponse(result[0]) : null;
  }

  async getWallsByClerkUid(clerkUid: string) {
    const result = await db
      .select()
      .from(walls)
      .where(eq(walls.clerkUid, clerkUid))
      .orderBy(desc(walls.createdAt));
    return result.map(toResponse);
  }

  async getById(id: string) {
    const result = await db
      .select()
      .from(walls)
      .where(eq(walls.id, id))
      .limit(1);
    return result[0] ? toResponse(result[0]) : null;
  }

  async getByUsername(username: string) {
    const result = await db
      .select()
      .from(walls)
      .where(eq(walls.username, username))
      .limit(1);
    return result[0] ? toResponse(result[0]) : null;
  }

  async isUsernameAvailable(username: string) {
    const result = await db
      .select({ id: walls.id })
      .from(walls)
      .where(eq(walls.username, username))
      .limit(1);
    return result.length === 0;
  }

  async create(data: Omit<NewWall, 'id' | 'createdAt'>) {
    const result = await db.insert(walls).values(data).returning();
    return result[0] ? toResponse(result[0]) : null;
  }
}
