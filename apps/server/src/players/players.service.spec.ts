import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { getTestDb, getTestDbProvider, resetTestDb } from '../../test/test-db';
import { createUser, createUserStats } from '../../test/factories/user.factory';
import { NotFoundException } from '@nestjs/common';

describe('PlayersService', () => {
    let service: PlayersService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayersService, getTestDbProvider()],
        }).compile();
        service = module.get(PlayersService);
    });

    afterEach(async () => {
        await resetTestDb();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserStats', () => {
        it('returns existing stats for a user', async () => {
            const user = await createUser();
            await createUserStats({ userId: user.id, rating: 1400, wins: 3 });

            const result = await service.getUserStats(user.id);

            expect(result.userId).toBe(user.id);
            expect(result.rating).toBe(1400);
            expect(result.wins).toBe(3);
        });

        it('creates default stats if none exist (missed sign-up hook case)', async () => {
            const user = await createUser();

            const result = await service.getUserStats(user.id);

            expect(result.userId).toBe(user.id);
            expect(result.rating).toBe(1000);
            expect(result.wins).toBe(0);
            expect(result.draws).toBe(0);
            expect(result.losses).toBe(0);
        });

        it('creates default stats if user exists but stats are missing', async () => {
            const user = await createUser();
            const result = await service.getUserStats(user.id);
            expect(result.userId).toBe(user.id);
        });

        it('throws 404 if the user does not exist at all', async () => {
            await expect(
                service.getUserStats('00000000-0000-0000-0000-000000000000'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStats', () => {
        it('updates both players correctly on a white win', async () => {
            const white = await createUser();
            const black = await createUser();
            await createUserStats({ userId: white.id, rating: 1000, wins: 0, losses: 0, draws: 0 });
            await createUserStats({ userId: black.id, rating: 1000, wins: 0, losses: 0, draws: 0 });

            const db = getTestDb();
            await db.transaction(async (tx) => {
                await service.updateStats(tx, {
                    whiteId: white.id,
                    blackId: black.id,
                    result: 'white_won',
                    elo: {
                        newWhiteRating: 1016,
                        newBlackRating: 984,
                        whiteDiff: 16,
                        blackDiff: -16,
                        diff: 16,
                    },
                });
            });

            const whiteStats = await service.getUserStats(white.id);
            const blackStats = await service.getUserStats(black.id);

            expect(whiteStats.wins).toBe(1);
            expect(whiteStats.losses).toBe(0);
            expect(whiteStats.rating).toBe(1016);

            expect(blackStats.wins).toBe(0);
            expect(blackStats.losses).toBe(1);
            expect(blackStats.rating).toBe(984);
        });

        it('increments draws for both players on a draw', async () => {
            const white = await createUser();
            const black = await createUser();
            await createUserStats({ userId: white.id, rating: 1000 });
            await createUserStats({ userId: black.id, rating: 1000 });

            const db = getTestDb();
            await db.transaction(async (tx) => {
                await service.updateStats(tx, {
                    whiteId: white.id,
                    blackId: black.id,
                    result: 'draw',
                    elo: {
                        newWhiteRating: 1000,
                        newBlackRating: 1000,
                        whiteDiff: 0,
                        blackDiff: 0,
                        diff: 0,
                    },
                });
            });

            const whiteStats = await service.getUserStats(white.id);
            const blackStats = await service.getUserStats(black.id);

            expect(whiteStats.draws).toBe(1);
            expect(blackStats.draws).toBe(1);
        });

        it('increments existing win/loss counts rather than overwriting them', async () => {
            const white = await createUser();
            const black = await createUser();
            await createUserStats({ userId: white.id, rating: 1000, wins: 5, losses: 2, draws: 1 });
            await createUserStats({ userId: black.id, rating: 1000, wins: 2, losses: 5, draws: 1 });

            const db = getTestDb();
            await db.transaction(async (tx) => {
                await service.updateStats(tx, {
                    whiteId: white.id,
                    blackId: black.id,
                    result: 'black_won',
                    elo: {
                        newWhiteRating: 984,
                        newBlackRating: 1016,
                        blackDiff: 16,
                        whiteDiff: -16,
                        diff: 16,
                    },
                });
            });

            const whiteStats = await service.getUserStats(white.id);
            const blackStats = await service.getUserStats(black.id);

            expect(whiteStats.wins).toBe(5); // unchanged
            expect(whiteStats.losses).toBe(3); // +1

            expect(blackStats.wins).toBe(3); // +1
            expect(blackStats.losses).toBe(5); // unchanged
        });
    });

    describe('getTopPlayers', () => {
        it('returns players ordered by rating descending', async () => {
            const low = await createUser({ username: 'low' });
            const mid = await createUser({ username: 'mid' });
            const high = await createUser({ username: 'high' });
            await createUserStats({ userId: low.id, rating: 1000 });
            await createUserStats({ userId: mid.id, rating: 1500 });
            await createUserStats({ userId: high.id, rating: 2000 });

            const result = await service.getTopPlayers();

            expect(result.map((p) => p.username)).toEqual(['high', 'mid', 'low']);
        });

        it('excludes users without a username', async () => {
            const noUsername = await createUser({ username: null });
            const withUsername = await createUser({ username: 'valid' });
            await createUserStats({ userId: noUsername.id, rating: 2000 });
            await createUserStats({ userId: withUsername.id, rating: 1000 });

            const result = await service.getTopPlayers();

            expect(result.some((p) => p.userId === noUsername.id)).toBe(false);
            expect(result.some((p) => p.userId === withUsername.id)).toBe(true);
        });

        it('paginates correctly with page and limit', async () => {
            for (let i = 0; i < 5; i++) {
                const u = await createUser({ username: `p${i}` });
                await createUserStats({ userId: u.id, rating: 1000 + i * 10 });
            }

            const page1 = await service.getTopPlayers(1, 2);
            const page2 = await service.getTopPlayers(2, 2);

            expect(page1).toHaveLength(2);
            expect(page2).toHaveLength(2);
            expect(page1[0]?.username).not.toBe(page2[0]?.username);
        });
    });
});
