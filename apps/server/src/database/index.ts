import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const dbURL = process.env.DATABASE_URL;

if (!dbURL) {
  throw new Error('DATABASE_URL env variable is missing');
}

const client = postgres(dbURL, {
  max: 1,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, {
  schema,
});

export type Database = typeof db;
