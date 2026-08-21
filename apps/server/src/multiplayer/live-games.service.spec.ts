import { Test, TestingModule } from '@nestjs/testing';
import { LiveGamesService } from './live-games.service';
import { LiveGame } from './live-game';

describe('LiveGamesService', () => {
    let service: LiveGamesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LiveGamesService],
        }).compile();

        service = module.get(LiveGamesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createGame', () => {
        it('creates a new game and stores it under the given id', () => {
            const game = service.createGame('game-1');

            expect(game).toBeInstanceOf(LiveGame);
            expect(service.hasGame('game-1')).toBe(true);
            expect(service.size()).toBe(1);
        });

        it('passes initial moves through to the LiveGame instance', () => {
            const moves = [{ from: 'e2', to: 'e4' }];
            const game = service.createGame('game-1', moves);

            expect(game).toBeDefined();
            expect(game.getMovesPlayed()).toBe(1);
        });

        it('overwrites an existing game if the same id is used again', () => {
            const first = service.createGame('game-1');
            const second = service.createGame('game-1');

            expect(service.getGame('game-1')).toBe(second);
            expect(service.getGame('game-1')).not.toBe(first);
            expect(service.size()).toBe(1);
        });

        it('supports multiple distinct games at once', () => {
            service.createGame('game-1');
            service.createGame('game-2');

            expect(service.size()).toBe(2);
        });
    });

    describe('hasGame', () => {
        it('returns false for an id that was never created', () => {
            expect(service.hasGame('missing')).toBe(false);
        });

        it('returns true for an existing game', () => {
            service.createGame('game-1');
            expect(service.hasGame('game-1')).toBe(true);
        });
    });

    describe('getGame', () => {
        it('returns undefined for an unknown id', () => {
            expect(service.getGame('missing')).toBeUndefined();
        });

        it('returns the stored LiveGame instance for a known id', () => {
            const created = service.createGame('game-1');
            expect(service.getGame('game-1')).toBe(created);
        });
    });

    describe('deleteGame', () => {
        it('removes a game so it is no longer found', () => {
            service.createGame('game-1');
            service.deleteGame('game-1');

            expect(service.hasGame('game-1')).toBe(false);
            expect(service.getGame('game-1')).toBeUndefined();
            expect(service.size()).toBe(0);
        });

        it('does nothing (no throw) when deleting an id that does not exist', () => {
            expect(() => service.deleteGame('missing')).not.toThrow();
            expect(service.size()).toBe(0);
        });

        it('only removes the targeted game, leaving others intact', () => {
            service.createGame('game-1');
            service.createGame('game-2');

            service.deleteGame('game-1');

            expect(service.hasGame('game-1')).toBe(false);
            expect(service.hasGame('game-2')).toBe(true);
            expect(service.size()).toBe(1);
        });
    });

    describe('size', () => {
        it('starts at 0 with no games', () => {
            expect(service.size()).toBe(0);
        });

        it('reflects the current count as games are added and removed', () => {
            service.createGame('a');
            service.createGame('b');
            expect(service.size()).toBe(2);

            service.deleteGame('a');
            expect(service.size()).toBe(1);
        });
    });

    describe('clear', () => {
        it('removes all games at once', () => {
            service.createGame('a');
            service.createGame('b');
            service.createGame('c');

            service.clear();

            expect(service.size()).toBe(0);
            expect(service.hasGame('a')).toBe(false);
            expect(service.hasGame('b')).toBe(false);
            expect(service.hasGame('c')).toBe(false);
        });

        it('is safe to call when already empty', () => {
            expect(() => service.clear()).not.toThrow();
            expect(service.size()).toBe(0);
        });
    });
});
