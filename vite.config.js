import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import henryRecordsApi from './vite-plugins/henryRecordsApi.js';

export default defineConfig({
  plugins: [react(), henryRecordsApi()],
  server: {
    port: 5000,
  },
  build: {
    // The PDF generator chunk (`@react-pdf/renderer` + fonts) is intentionally
    // large but already lazy-loaded via dynamic `import('../pdf/...')` in
    // `PrintButton.jsx` and `PrintPreview.jsx`. Raise the warning ceiling so
    // the build log stays clean while still flagging accidental bloat.
    chunkSizeWarningLimit: 1600,
  },
  test: {
    // jsdom for hook + component tests; pure-logic tests don't care.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    // Exclude node_modules and the records archive (which contains generated PDFs).
    exclude: ['node_modules', 'dist', 'records'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/store/**/*.js',
        'src/hooks/**/*.js',
        'src/compliance/**/*.js',
        'src/services/**/*.js',
        'src/records/**/*.js',
        'src/components/AuditLogPanel.jsx',
        'src/components/ToastHost.jsx',
        'src/components/Disclosure.jsx',
        'src/components/LlmFooterChatBox.jsx',
      ],
      exclude: [
        '**/*.test.{js,jsx}',
        'src/test/**',
        // Knowledge-base catalog data, not logic.
        'src/compliance/knowledgeBase.js',
      ],
    },
  },
});
