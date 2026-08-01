import { integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../timestamps"
import { user } from "."

export const userStats = pgTable(
    "user_stats",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id),
        wins: integer("wins").default(0).notNull(),
        losses: integer("losses").default(0).notNull(),
        draws: integer("draws").default(0).notNull(),
        rating: integer("rating").default(1000).notNull(),
        ...timestamps,
    },
    (table) => [uniqueIndex("stats_user_id_index").on(table.userId)],
)

export const userStatsRelations = relations(userStats, ({ one }) => ({
    user: one(user, {
        fields: [userStats.userId],
        references: [user.id],
    }),
}))
