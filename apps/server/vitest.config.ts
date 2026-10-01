import { defineConfig } from 'vitest/config';
// import swc from 'unplugin-swc';

export default defineConfig({
    //   plugins: [swc.vite({ module: { type: 'es6' } })],
    test: {
        globals: true,
        include: ['src/**/*.spec.ts'],
        globalSetup: ['./test/global-setup.ts'],
        setupFiles: ['./test/setup-env.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            reportsDirectory: './coverage',
        },
        fileParallelism: false,
    },
});
