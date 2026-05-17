/**
 * Henry MUI theme factory.
 *
 * Call `getHenryTheme(isDark)` to get a MUI theme that mirrors Henry's
 * CSS-variable design tokens (red accent, Inter font, slate surfaces).
 * The theme is re-created whenever the resolved light/dark mode changes,
 * driven by HenryThemeProvider.
 */
import { createTheme } from '@mui/material/styles';

const fontFamily = "'Inter', 'Segoe UI', Tahoma, Arial, sans-serif";

const getHenryTheme = (isDark) =>
  createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#b91c1c',
        dark: '#991b1b',
        light: '#dc2626',
        contrastText: '#fff',
      },
      secondary: {
        main: '#64748b',
        dark: '#475569',
        light: '#94a3b8',
        contrastText: '#fff',
      },
      background: isDark
        ? { default: '#020617', paper: '#0f172a' }
        : { default: '#f1f5f9', paper: '#ffffff' },
      text: isDark
        ? { primary: '#e5e7eb', secondary: '#94a3b8' }
        : { primary: '#1f2937', secondary: '#6b7280' },
      success: { main: '#059669', light: '#ecfdf5', contrastText: '#fff' },
      warning: { main: '#d97706', light: '#fef3c7', contrastText: '#fff' },
      error: { main: '#dc2626', light: '#fee2e2', contrastText: '#fff' },
      divider: isDark ? '#334155' : '#e5e7eb',
    },

    typography: {
      fontFamily,
      h1: { fontFamily, fontWeight: 800, fontSize: '2.5rem', letterSpacing: '-0.03em' },
      h2: { fontFamily, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em' },
      h3: { fontFamily, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em' },
      h4: { fontFamily, fontWeight: 700, fontSize: '1.2rem' },
      button: { textTransform: 'none', fontWeight: 600 },
      h6: { fontFamily, fontWeight: 700, fontSize: '1rem' },
      subtitle1: { fontFamily, fontSize: '0.95rem', fontWeight: 600 },
      subtitle2: { fontFamily, fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.01em' },
      body1: { fontFamily, fontSize: '0.95rem', lineHeight: 1.65 },
      body2: { fontFamily, fontSize: '0.8125rem' },
      caption: { fontFamily, fontSize: '0.72rem' },
    },

    shape: { borderRadius: 16 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Don't override our body background — let app.css handle it.
          body: { background: 'inherit' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            fontFamily,
            borderRadius: 14,
            paddingInline: 16,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 14 } },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.07)' : '0 1px 2px rgba(15, 23, 42, 0.06)',
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 16px rgba(185,28,28,0.4), 0 1px 4px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(185,28,28,0.5), 0 2px 6px rgba(0,0,0,0.2)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 20,
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: isDark ? '0 18px 50px rgba(2, 6, 23, 0.45)' : '0 18px 50px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontFamily, fontWeight: 600, fontSize: '0.72rem' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isDark ? '#0f172a' : '#fff',
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: { fontFamily, fontSize: '0.72rem' },
        },
      },
    },
  });

export default getHenryTheme;
