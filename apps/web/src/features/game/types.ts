import {
    Result,
    Status,
    Reason,
    MoveType,
    GameTimestamps,
    PlayerStatus,
    ColorName,
    SyncGame,
} from '@bchess/shared';
import { Chess, Color, Move, Square } from 'chess.js';
import { StateCreator } from 'zustand';

export type GameMode = 'bot' | 'multiplayer' | 'idle' | 'review';

export interface PlayerInfo {
    id: string;
    username: string;
    avatar: string | null;
    rating?: number;
    status: PlayerStatus | null;
}

export interface Clock {
    white: number;
    black: number;
    increment: number;
    activeColor: ColorName | null;
    lastTickAt: number | null;
}

export type CapturedPiece = 'p' | 'n' | 'b' | 'r' | 'q';

export interface CapturedPieces {
    white: CapturedPiece[];
    black: CapturedPiece[];
}

type Event =
    | {
          type: 'move';
          move: MoveType;
      }
    | {
          type: 'timeout';
      };

type Results = {
    result: Result;
    reason: Reason;
    whiteEloDiff: number | null;
    blackEloDiff: number | null;
};

// Players Slice

export type PlayersState = {
    players: {
        white: PlayerInfo;
        black: PlayerInfo;
        playerColor: ColorName;
    } | null;
};

export type PlayersActions = {
    setPlayers: (payload: { white: PlayerInfo; black: PlayerInfo; playerColor: ColorName }) => void;

    setPlayerStatus: (color: Color, status: PlayerStatus | null) => void;

    resetPlayers: () => void;
};

export type PlayersSlice = PlayersState & PlayersActions;

// Clock Slice

export type ClockState = {
    clock: Clock | null;
};

export type ClockActions = {
    setClock: (clock: Clock) => void;
    startClock: (timeControl?: { initial: number; increment: number; lastTickAt?: number }) => void;

    stopClock(p: { reason: Reason; result: Result }): void;

    switchClock(): void;

    rollbackClock(timetamps: GameTimestamps): void;

    resetClock(): void;
};

export type ClockSlice = ClockState & ClockActions;

// Results Slice

export type ResultsState = {
    results: Results | null;
};

export type ResultsActions = {
    endGame: (payload: {
        result: Result;
        reason: Reason;
        elo?: {
            whiteEloDiff: number;
            blackEloDiff: number;
        };
        withSound?: boolean;
    }) => void;

    resetResults(): void;
};

export type ResultsSlice = ResultsState & ResultsActions;

// Display Slice

export type ViewIndex = number | null;

export type DisplayState = {
    viewIndex: ViewIndex;
    displayFen: string;
    moveHistory: Move[];
    legalMoves: Square[];
};

export type DispalyActions = {
    goToMove: (index: ViewIndex) => void;
    goToStart: () => void;
    goToEnd: () => void;
    stepBack: () => void;
    stepForward: () => void;
    resetDisplay: () => void;
    rollbackDisplay: () => void;
    setDisplay: (history: Move[], index?: ViewIndex) => void;
    showLegalMoves(squares: Square[]): void;
    maskLegalMoves(): void;
};

export type DisplaySlice = DisplayState & DispalyActions;

// Validation Slice

export type ValidationState = {
    chess: Chess;
    selectedSquare: Square | null;
};
export type ValidationActions = {
    selectSquare: (square: Square) => void | Move;
    makeMove: (payload: {
        from: string;
        to: string;
        promotion?: string;
        ack?: boolean;
        withSound?: boolean;
        updateClock?: boolean;
    }) => Move | null;
    undo: () => void;
    rollback: (timestamps: GameTimestamps) => void;
    resetValidation(): void;
    setValidation(moves: MoveType[]): void;
};

export type ValidationSlice = ValidationState & ValidationActions;

// Core

export type CoreState = {
    mode: GameMode;
    lastAction: null | Event;
    status: Status;
};

export type CoreActions = {
    setMode: (mode: GameMode) => void;
    setStatus: (status: Status) => void;
    resetGame: () => void;
    setGame: (mode: GameMode, game: SyncGame, playerColor: ColorName) => void;
};

// The Full Store

export type GameState = PlayersState &
    ClockState &
    ResultsState &
    DisplayState &
    ValidationState &
    CoreState;

export type GameActions = PlayersActions &
    ClockActions &
    ResultsActions &
    DispalyActions &
    ValidationActions &
    CoreActions;

export type GameStore = GameState & GameActions;

export type GameSlice<T> = StateCreator<GameStore, [], [], T>;
