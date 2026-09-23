import 'dotenv/config';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

let container: StartedPostgreSqlContainer | undefined;

export async function setup() {
    container = await new PostgreSqlContainer('postgres:18').start();
    const uri = container.getConnectionUri();

    process.env.TEST_DATABASE_URL = uri;
    await writeFile('.testcontainer.json', JSON.stringify({ id: container.getId(), uri }));

    const client = postgres(uri);
    try {
        await migrate(drizzle(client), {
            migrationsFolder: join(__dirname, '../../../packages/db/migrations'),
        });
    } catch (err) {
        await container.stop(); // don't leak the container if migrations fail
        throw err;
    } finally {
        await client.end();
    }
}

export async function teardown() {
    await container?.stop();
    await unlink('.testcontainer.json').catch((error) => {
        console.error('Failed to delete .testcontainer.json file: ', error);
    });
}
