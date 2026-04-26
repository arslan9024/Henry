import { useCallback, useEffect, useState } from 'react';

const KEY = 'henry.ui.theme';
const VALUES = ['light', 'dark', 'system'];

const read = () => {
  try {
    const v = localStorage.getItem(KEY);
    if (VALUES.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return 'system';
};

const systemPrefersDark = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const resolve = (mode) => (mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode);

const apply = (resolved) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolved;
  // Help native form controls + scrollbars match the theme.
  document.documentElement.style.colorScheme = resolved;
};

/**
 * useTheme — global light/dark/system mode toggle.
 *
 * Persists user preference to localStorage; resolves "system" against
 * `prefers-color-scheme` and re-resolves live when the OS preference changes.
 * Applies `data-theme` to <html> so CSS overrides can flip token values.
 *
 * @returns {{ mode: 'light'|'dark'|'system', resolved: 'light'|'dark', setMode: Function, cycle: Function }}
 */
export default function useTheme() {
  const [mode, setMode] = useState(read);
  const [resolved, setResolved] = useState(() => resolve(read()));

  useEffect(() => {
    const next = resolve(mode);
    setResolved(next);
    apply(next);
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  // Re-resolve when the OS preference flips (only matters for `system` mode).
  useEffect(() => {
    if (mode !== 'system') return undefined;
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = mq.matches ? 'dark' : 'light';
      setResolved(next);
      apply(next);
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => (m === 'light' ? 'dark' : m === 'dark' ? 'system' : 'light'));
  }, []);

  return { mode, resolved, setMode, cycle };
}
