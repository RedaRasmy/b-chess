import {
    pgTable,
    uuid,
    pgEnum,
    boolean,
    text,
    integer,
    bigint,
    timestamp,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "../timestamps"
import { DEFAULT_POSITION } from "chess.js"
import { moves, user } from "."
import { GAMEOVER_REASONS, RESULT, STATUS, TIMER_OPTIONS } from "./constants"
export const resultEnum = pgEnum("result", RESULT)
export const statusEnum = pgEnum("status", STATUS)
export const timerOptionsEnum = pgEnum("timer_option", TIMER_OPTIONS)
export const gameOverReasonsEnum = pgEnum("gameover_reason", GAMEOVER_REASONS)
export const colorsEnum = pgEnum("color", ["w", "b"])

export const games = pgTable("games", {
    id: uuid().primaryKey().defaultRandom(),
    whiteId: text("white_id")
        .references(() => user.id)
        .notNull(),
    blackId: text("black_id").references(() => user.id),
    currentFen: text("current_fen").default(DEFAULT_POSITION).notNull(),
    result: resultEnum(),
    gameOverReason: gameOverReasonsEnum("game_over_reason"),
    status: statusEnum().default("matching").notNull(),
    timer: timerOptionsEnum().notNull(),
    currentTurn: colorsEnum("current_turn").default("w").notNull(),
    whiteTimeLeft: integer("white_time_left").notNull(),
    blackTimeLeft: integer("black_time_left").notNull(),
    lastMoveAt: bigint("last_move_at", { mode: "number" }),
    gameStartedAt: bigint("game_started_at", { mode: "number" }),
    whiteReady: boolean("white_ready").default(false).notNull(),
    blackReady: boolean("black_ready").default(false).notNull(),
    requestDraw: colorsEnum("request_draw"),
    requestedDrawAt: timestamp("requested_draw_at"),
    ...timestamps,
})

export const gamesRelations = relations(games, ({ many, one }) => ({
    moves: many(moves),
    white: one(user, {
        fields: [games.whiteId],
        references: [user.id],
    }),
    black: one(user, {
        fields: [games.blackId],
        references: [user.id],
    }),
}))
