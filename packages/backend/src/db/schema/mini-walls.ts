import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { walls } from './walls'
import { relations } from 'drizzle-orm'

export const miniWalls = pgTable(
  'mini_walls',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    wallId: uuid('wall_id')
      .notNull()
      .references(() => walls.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(), // e.g., "App ABC"
    slug: varchar('slug', { length: 30 }).notNull(), // e.g., "app-abc"
    description: text('description').notNull().default(''),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    wallIdx: index('mini_walls_wall_id_idx').on(t.wallId),
    slugIdx: index('mini_walls_slug_idx').on(t.slug),
  }),
)

export const miniWallsRelations = relations(miniWalls, ({ one }) => ({
  wall: one(walls, {
    fields: [miniWalls.wallId],
    references: [walls.id],
  }),
}))

export type MiniWall = typeof miniWalls.$inferSelect
export type NewMiniWall = typeof miniWalls.$inferInsert
