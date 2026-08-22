/* eslint-disable */
import { unlink } from 'fs';

export default async function globalTeardown() {
    const container = globalThis.__PG_CONTAINER__;
    if (container) await container.stop();

    unlink('.testcontainer.json', (err) => {
        if (err) throw err;
        console.log('.testcontainer.json was deleted');
    });
}
