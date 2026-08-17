// @ts-check
import { defineConfig } from 'eslint/config';
import { config as baseConfig } from '@bchess/eslint-config/base';

const eslintConfig = defineConfig([
    ...baseConfig
]);

export default eslintConfig;
