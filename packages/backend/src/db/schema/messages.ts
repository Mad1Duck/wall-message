import { pgTable, uuid, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { walls } from './walls';
import { miniWalls } from './mini-walls';

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  wallId: uuid('wall_id').notNull().references(() => walls.id, { onDelete: 'cascade' }),
  miniWallId: uuid('mini_wall_id').references(() => miniWalls.id, { onDelete: 'cascade' }),
  recipient: varchar('recipient', { length: 20 }).notNull(),
  content: varchar('content', { length: 500 }).notNull(),
  alias: varchar('alias', { length: 100 }).notNull().default('Seseorang yang peduli 🌙'),
  reply: text('reply').default(''),
  isPublic: boolean('is_public').notNull().default(false),
  isPinned: boolean('is_pinned').notNull().default(false),
  reactHeart: integer('react_heart').notNull().default(0),
  reactFire: integer('react_fire').notNull().default(0),
  reactCry: integer('react_cry').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
