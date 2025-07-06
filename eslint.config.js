// ESLint v9+ flat config
import { defineConfig } from 'eslint/config';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        game: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      quotes: ['warn', 'single'],
      'no-prototype-builtins': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        {
          selector: 'variable',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'variable', modifiers: ['const'], format: ['camelCase'] },
        {
          selector: 'classProperty',
          modifiers: ['static'],
          format: ['UPPER_CASE'],
        },
        { selector: 'class', format: ['PascalCase'] },
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
      ],
    },
    ignores: ['dist/*', 'bin/*'],
  },
]);
