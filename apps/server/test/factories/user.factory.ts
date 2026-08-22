import { getTestDb } from '../test-db';
import { user, userStats } from '@bchess/db/tables';
import { randomUUID } from 'crypto';

export async function createUser(overrides: Partial<typeof user.$inferInsert> = {}) {
    const db = getTestDb();
    const [row] = await db
        .insert(user)
        .values({
            username: `player_${randomUUID().slice(0, 8)}`,
            email: `${randomUUID()}@test.com`,
            id: randomUUID(),
            name: 'test-user',
            ...overrides,
        })
        .returning();
    return row!;
}

export async function createUserStats(overrides: Partial<typeof userStats.$inferInsert> = {}) {
    const db = getTestDb();
    const userId = overrides.userId ?? (await createUser()).id;
    const [row] = await db
        .insert(userStats)
        .values({ userId, ...overrides })
        .returning();
    return row!;
}
