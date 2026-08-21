import { readFileSync } from 'fs';

try {
    const { uri } = JSON.parse(readFileSync('.testcontainer.json', 'utf-8'));
    process.env.TEST_DATABASE_URL = uri;
} catch {
    // globalSetup hasn't run yet (e.g. this file loaded out of order) — ignore
}
