import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { config as baseConfig } from '@bchess/eslint-config/base';

const eslintConfig = defineConfig([
    ...baseConfig,
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        'public/**',
    ]),
    {
        rules: {
            'react-hooks/set-state-in-effect': 'off',
        },
    },
]);

export default eslintConfig;
