import {
    Reason,
    games,
    PromotionPiece,
    moves,
    TimerOption,
    userStats,
    Status,
} from '@bchess/db/tables';
import { Chess, Square } from 'chess.js';
import { Narrow, Prettify, Update } from '../types';
import { PlayerConnectionState, PlayerStatus } from '../players';

// Selects

export type Stats = typeof userStats.$inferSelect;
type SGame = typeof games.$inferSelect;
export type SMove = typeof moves.$inferSelect;

export type ChessTimer = {
    type: 'bullet' | 'blitz' | 'rapid';
    base: number;
    plus: number;
};

export type DrawReason = Extract<
    Reason,
    | 'Fifty moves rule'
    | 'Insufficient material'
    | 'Stalemate'
    | 'Threefold repetition'
    | 'Agreement'
>;

export type WinLossReason = Extract<Reason, 'Checkmate' | 'Timeout' | 'Resignation'>;

type Players = {
    white: { username: string; image: string | null };
    black: { username: string; image: string | null };
};
export type ColorName = 'white' | 'black';

export interface MoveType {
    from: string;
    to: string;
    promotion?: string;
}

export type DrawRequest = {
    requestDraw: 'w' | 'b';
    requestedDrawAt: Date;
};

export type PreparingGame = Narrow<
    SGame,
    {
        status: 'preparing';
        blackId: string;
        blackRating: number;
    }
>;

export type PlayingGame = Update<
    PreparingGame,
    {
        status: 'playing';
        gameStartedAt: number;
    }
>;

export type EndCase =
    | {
          result: 'draw';
          reason: DrawReason;
      }
    | {
          result: 'white_won' | 'black_won';
          reason: WinLossReason;
      };

export type EndState = Prettify<
    {
        status: 'finished';
        whiteEloDiff: number;
        blackEloDiff: number;
    } & EndCase
>;

export type NotEndState = {
    status: Exclude<Status, 'finished'>;
    whiteEloDiff: null;
    blackEloDiff: null;
    reason: null;
    result: null;
};

export type FinishedGame = Update<PlayingGame, EndState>;

export type DrawingGame = Narrow<PlayingGame, DrawRequest>;

export type MatchedGame = PreparingGame | PlayingGame;

export type FullMatchedGame = Prettify<MatchedGame & Players & { moves: MoveType[] }>;

export type FullPlayingGame = Prettify<PlayingGame & Players & { moves: MoveType[] }>;

// export type DrawingGameWithPlayers = DrawingGame & Players

export type FullFinishedGame = Prettify<FinishedGame & Players & { moves: MoveType[] }>;

export type FullGame = FullMatchedGame | FullFinishedGame;

export type SyncGame = Prettify<
    FullGame & {
        whiteStatus: PlayerStatus | null;
        blackStatus: PlayerStatus | null;
    }
>;

export type GameTimestamps = {
    whiteTimeLeft: number;
    blackTimeLeft: number;
    gameStartedAt: number;
    lastMoveAt: number | null;
};

export type GameSummary = {
    id: string;
    opponent: {
        id: string;
        username: string;
        avatar: string | null;
    };
    result: 'win' | 'loss' | 'draw';
    duration: number;
    reason: Reason;
    timer: TimerOption;
    ratingDiff: number;
};
