import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@bchess/db/tables';
import { sql } from 'drizzle-orm';
import { Database } from '@bchess/db';
import { DATABASE_CONNECTION } from '../src/database/database.module';
import { ValueProvider } from '@nestjs/common';

let client: ReturnType<typeof postgres>;
let db: Database;

export function getTestDb(): Database {
    if (!db) {
        client = postgres(process.env.TEST_DATABASE_URL!, {
            // max: 1,
            // idle_timeout: 30,
            // connect_timeout: 10,
            // prepare: false,
        });
        db = drizzle(client, {
            schema,
        });
    }
    return db;
}

export function getTestDbProvider(): ValueProvider<Database> {
    return { provide: DATABASE_CONNECTION, useValue: getTestDb() };
}

// truncate all tables between tests — fast, keeps schema/migrations intact
export async function resetTestDb() {
    const tables = Object.values(schema)
        .filter((t: any) => t?.[Symbol.for('drizzle:Name')]) // drizzle table objects
        .map((t: any) => t[Symbol.for('drizzle:Name')]);

    if (tables.length === 0) return;
    await getTestDb().execute(
        sql.raw(
            `TRUNCATE TABLE ${tables.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
        ),
    );
}

export async function closeTestDb() {
    await client?.end();
}
