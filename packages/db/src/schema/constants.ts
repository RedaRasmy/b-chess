export const TIMER_OPTIONS = [
    'bullet 1+0',
    'bullet 2+1',
    'blitz 3+0',
    'blitz 3+2',
    'blitz 5+0',
    'blitz 5+3',
    'rapid 10+0',
    'rapid 10+5',
    'rapid 15+10',
] as const;

export const GAMEOVER_REASONS = [
    'Checkmate',
    'Timeout',
    'Fifty moves rule',
    'Insufficient material',
    'Stalemate',
    'Threefold repetition',
    'Resignation',
    'Agreement',
] as const;

export const RESULT = ['draw', 'white_won', 'black_won'] as const;

export const STATUS = ['matching', 'preparing', 'playing', 'finished'] as const;

export const PROMOTION = ['q', 'r', 'n', 'b'] as const;

export type PromotionPiece = (typeof PROMOTION)[number];
export type TimerOption = (typeof TIMER_OPTIONS)[number];
export type Reason = (typeof GAMEOVER_REASONS)[number];
export type Result = (typeof RESULT)[number];
export type Status = (typeof STATUS)[number];
