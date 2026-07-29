import {
    pgTable,
    uuid,
    pgEnum,
    boolean,
    text,
    integer,
    varchar,
    index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createdAt } from "../timestamps"
import { colorsEnum, games } from "."

export const promotionsEnum = pgEnum("promotion_piece", ["q", "r", "n", "b"])
export const piecesEnum = pgEnum("piece", ["q", "r", "n", "b", "k", "p"])

export const moves = pgTable(
    "moves",
    {
        id: uuid().primaryKey().defaultRandom(),
        fenAfter: text("fen_after").notNull(),
        gameId: uuid("game_id")
            .references(() => games.id, { onDelete: "cascade" })
            .notNull(),
        from: varchar({ length: 2 }).notNull(),
        to: varchar({ length: 2 }).notNull(),
        promotion: promotionsEnum(),
        playerColor: colorsEnum("player_color").notNull(),
        piece: piecesEnum().notNull(),
        capturedPiece: piecesEnum("captured_piece"),
        isCheck: boolean("is_check").default(false).notNull(),
        isCheckmate: boolean("is_checkmate").default(false).notNull(),
        moveTime: integer("move_time").notNull(),
        san: varchar({ length: 10 }).notNull(),
        createdAt,
    },
    (table) => [index("move_game_id_index").on(table.gameId)],
)

export const movesRelations = relations(moves, ({ one }) => ({
    game: one(games, {
        fields: [moves.gameId],
        references: [games.id],
    }),
}))
