import { Injectable, Singleton } from 'hono-forge';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { messages, type Message, type NewMessage } from '../db/schema';

function toResponse(msg: Message) {
  return {
    id: msg.id,
    wall_id: msg.wallId,
    mini_wall_id: msg.miniWallId,
    recipient: msg.recipient,
    content: msg.content,
    alias: msg.alias,
    reply: msg.reply ?? '',
    is_public: msg.isPublic,
    is_pinned: msg.isPinned,
    react_heart: msg.reactHeart,
    react_fire: msg.reactFire,
    react_cry: msg.reactCry,
    created_at: msg.createdAt.toISOString(),
  };
}

@Injectable()
@Singleton()
export class MessagesService {
  async getByWallId(wallId: string) {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.wallId, wallId))
      .orderBy(desc(messages.createdAt));
    // Filter out messages that belong to a mini wall
    return result.filter(msg => !msg.miniWallId).map(toResponse);
  }

  async getByMiniWallId(miniWallId: string) {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.miniWallId, miniWallId))
      .orderBy(desc(messages.createdAt));
    return result.map(toResponse);
  }

  async getById(id: string) {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);
    return result[0] ? toResponse(result[0]) : null;
  }

  async create(data: Omit<NewMessage, 'id' | 'createdAt'>) {
    const result = await db.insert(messages).values(data).returning();
    return result[0] ? toResponse(result[0]) : null;
  }

  async updateById(
    id: string,
    data: Partial<
      Pick<Message, 'reply' | 'isPublic' | 'isPinned' | 'reactHeart' | 'reactFire' | 'reactCry'>
    >,
  ) {
    const result = await db
      .update(messages)
      .set(data)
      .where(eq(messages.id, id))
      .returning();
    return result[0] ? toResponse(result[0]) : null;
  }

  async deleteById(id: string) {
    const result = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning();
    return result[0] ? toResponse(result[0]) : null;
  }

  async getStats(): Promise<{
    counts: Record<string, number>;
    lastAt: Record<string, string>;
  }> {
    const rows = await db
      .select({
        recipient: messages.recipient,
        publicCount: sql<number>`cast(sum(case when ${messages.isPublic} then 1 else 0 end) as int)`,
        lastAt: sql<string>`max(${messages.createdAt})`,
      })
      .from(messages)
      .groupBy(messages.recipient);

    const counts: Record<string, number> = {};
    const lastAt: Record<string, string> = {};
    for (const row of rows) {
      counts[row.recipient] = row.publicCount ?? 0;
      if (row.lastAt) lastAt[row.recipient] = new Date(row.lastAt).toISOString();
    }
    return { counts, lastAt };
  }
}
