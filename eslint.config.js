// ESLint flat config for Henry — pragmatic, not pedantic.
// Goals:
//   1. Catch real bugs: unused vars, undefined identifiers, hook-rule violations.
//   2. Pin React + JSX-a11y best practices that match what Henry actually does
//      (real-estate accessibility matters — DLD documents go to government).
//   3. Stay quiet about cosmetic issues — Vite + Vitest already enforce a lot.
//
// To run:    npm run lint
// To fix:    npm run lint -- --fix

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  // 1. Always ignore generated/vendor folders.
  {
    ignores: [
      'dist/',
      'coverage/',
      'records/',
      'node_modules/',
      '*.config.js', // Vite/Vitest configs use Node globals only — exempt
      'vite-plugins/',
      'scripts/',
      'index.jsx', // Legacy bootstrap kept for the standalone html shell
    ],
  },

  // 2. Base JS recommended rules.
  js.configs.recommended,

  // 3. App source — React + browser env.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React 18 + automatic JSX runtime — no need for `import React`.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // We don't ship prop-types; types live in usage docs.

      // Critical: teach ESLint that JSX <Foo /> counts as using `Foo`.
      // Without these, `no-unused-vars` flags every component import as unused.
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',

      // Hooks — non-negotiable.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX accessibility — DLD docs are government-facing, every label matters.
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'off', // Disclosure header pattern
      'jsx-a11y/click-events-have-key-events': 'off', // Same — handled at button level

      // Standard hygiene — promote unused-vars to warn so CI doesn't break on a stray import.
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },

  // 4. Test files — relax a few rules + add Vitest globals.
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2024,
        // Vitest globals (vite.config.js sets `test.globals: true`).
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off', // RTL helpers like `within` are often imported "just in case"
      'no-console': 'off',
    },
  },
];
