/**
 * HenryThemeProvider — syncs MUI ThemeProvider with the CSS-variable-based
 * light/dark mode that `useTheme` applies to `document.documentElement`.
 *
 * Rather than duplicating state or changing the useTheme architecture, we
 * observe the `data-theme` attribute on <html> via a MutationObserver so the
 * MUI theme always mirrors whatever mode is currently applied.
 */
import React, { useMemo, useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import getHenryTheme from './theme';

const readIsDark = () =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';

export default function HenryThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(readIsDark);

  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return undefined;

    const observer = new MutationObserver(() => {
      setIsDark(readIsDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const muiTheme = useMemo(() => getHenryTheme(isDark), [isDark]);

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
