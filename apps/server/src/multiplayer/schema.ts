import {
  pgTable,
  uuid,
  pgEnum,
  boolean,
  text,
  integer,
  bigint,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createdAt, timestamps } from '../database/timestamps';
import { GAMEOVER_REASONS, TIMER_OPTIONS } from '@bchess/shared';
import { DEFAULT_POSITION } from 'chess.js';
import { user } from '../database/schema';

export const resultEnum = pgEnum('result', ['draw', 'white_won', 'black_won']);
export const statusEnum = pgEnum('status', [
  'matching',
  'preparing',
  'playing',
  'finished',
]);
export const timerOptionsEnum = pgEnum('timer_option', TIMER_OPTIONS);
export const gameOverReasonsEnum = pgEnum('gameover_reason', GAMEOVER_REASONS);
export const promotionsEnum = pgEnum('promotion_piece', ['q', 'r', 'n', 'b']);
export const colorsEnum = pgEnum('color', ['w', 'b']);
export const piecesEnum = pgEnum('piece', ['q', 'r', 'n', 'b', 'k', 'p']);

export const games = pgTable('games', {
  id: uuid().primaryKey().defaultRandom(),
  whiteId: text('white_id')
    .references(() => user.id)
    .notNull(),
  blackId: text('black_id').references(() => user.id),
  currentFen: text('current_fen').default(DEFAULT_POSITION).notNull(),
  result: resultEnum(),
  gameOverReason: gameOverReasonsEnum('game_over_reason'),
  status: statusEnum().default('matching').notNull(),
  timer: timerOptionsEnum().notNull(),
  currentTurn: colorsEnum('current_turn').default('w').notNull(),
  whiteTimeLeft: integer('white_time_left').notNull(),
  blackTimeLeft: integer('black_time_left').notNull(),
  lastMoveAt: bigint('last_move_at', { mode: 'number' }),
  gameStartedAt: bigint('game_started_at', { mode: 'number' }),
  whiteReady: boolean('white_ready').default(false).notNull(),
  blackReady: boolean('black_ready').default(false).notNull(),
  ...timestamps,
});

export const moves = pgTable('moves', {
  id: uuid().primaryKey().defaultRandom(),
  fenAfter: text('fen_after').notNull(),
  gameId: uuid('game_id')
    .references(() => games.id)
    .notNull(),
  from: varchar({ length: 2 }).notNull(),
  to: varchar({ length: 2 }).notNull(),
  promotion: promotionsEnum(),
  playerColor: colorsEnum('player_color').notNull(),
  piece: piecesEnum().notNull(),
  capturedPiece: piecesEnum('captured_piece'),
  isCheck: boolean('is_check').default(false).notNull(),
  isCheckmate: boolean('is_checkmate').default(false).notNull(),
  moveTime: integer('move_time').notNull(),
  san: varchar({ length: 10 }).notNull(),
  createdAt,
});

export const movesRelations = relations(moves, ({ one }) => ({
  game: one(games, {
    fields: [moves.gameId],
    references: [games.id],
  }),
}));

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
}));
