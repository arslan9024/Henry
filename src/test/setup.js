import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom in some versions ships an incomplete localStorage where `.clear()`
 * isn't a function. Replace it with a known-good in-memory shim that's
 * reset before every test so persistence assertions can be deterministic.
 */
const installLocalStorageShim = () => {
  let store = new Map();
  const shim = {
    get length() {
      return store.size;
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => {
      store.set(String(k), String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
    clear: () => {
      store = new Map();
    },
  };
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: shim,
  });
};

beforeEach(() => {
  installLocalStorageShim();
});

afterEach(() => {
  cleanup();
});
