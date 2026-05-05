import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const walls = pgTable('walls', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUid: varchar('clerk_uid', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 20 }).notNull().unique(),
  displayName: varchar('display_name', { length: 40 }).notNull(),
  bio: varchar('bio', { length: 100 }).notNull().default(''),
  avatarUrl: text('avatar_url').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Wall = typeof walls.$inferSelect;
export type NewWall = typeof walls.$inferInsert;
