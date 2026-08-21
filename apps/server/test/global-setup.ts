import 'dotenv/config';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { writeFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { join } from 'path';

export default async function globalSetup() {
    const container = await new PostgreSqlContainer('postgres:18').start();

    // stash connection info + container id so teardown can find it
    process.env.TEST_DATABASE_URL = container.getConnectionUri();
    writeFileSync(
        '.testcontainer.json',
        JSON.stringify({
            id: container.getId(),
            uri: container.getConnectionUri(),
        }),
    );

    (globalThis as any).__PG_CONTAINER__ = container;

    const client = postgres(container.getConnectionUri(), {
        // max: 1,
        // idle_timeout: 30,
        // connect_timeout: 10,
        // prepare: false,
    });
    const db = drizzle(client);
    await migrate(db, { migrationsFolder: join(__dirname, '../../../packages/db/migrations') });
    await client.end();
}
