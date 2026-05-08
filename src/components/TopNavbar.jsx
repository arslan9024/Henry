import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveTemplateLabel, selectPolicyMeta, selectHenry } from '../store/selectors';
import { toggleLeftRail } from '../store/uiCommandSlice';
import useDensity from '../hooks/useDensity';
import useTheme from '../hooks/useTheme';
import AutosaveIndicator from './AutosaveIndicator';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiIconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import MuiButton from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const THEME_LABEL = {
  light: '☀ Light',
  dark: '☾ Dark',
  system: '⌥ System',
};
const THEME_NEXT = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const TopNavbar = React.memo(() => {
  const dispatch = useDispatch();
  const policyMeta = useSelector(selectPolicyMeta);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const henry = useSelector(selectHenry);
  const { density, toggle: toggleDensity } = useDensity();
  const { mode: themeMode, resolved: themeResolved, cycle: cycleTheme } = useTheme();
  const [identityOpen, setIdentityOpen] = useState(false);
  const identityRef = useRef(null);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  }, []);

  useEffect(() => {
    if (!identityOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIdentityOpen(false);
    };
    const onPointerDown = (e) => {
      if (!identityRef.current?.contains(e.target)) {
        setIdentityOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [identityOpen]);

  return (
    <AppBar
      component="header"
      position="sticky"
      color="inherit"
      role="banner"
      aria-label="Main navigation"
      data-overlay-shield
      className="print-hidden"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.appBar,
        maxWidth: 'var(--hub-max-width)',
        margin: '0 auto',
        top: 0,
        borderRadius: 2,
        mt: 0,
      }}
    >
      <Toolbar disableGutters sx={{ px: 2, gap: 1.5, minHeight: '60px !important' }}>
        {/* Sidebar toggle */}
        <Tooltip title="Toggle sidebar" placement="bottom">
          <MuiIconButton
            size="small"
            onClick={() => dispatch(toggleLeftRail())}
            aria-label="Toggle sidebar"
            sx={{ flexShrink: 0 }}
          >
            ☰
          </MuiIconButton>
        </Tooltip>

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="White Caves Real Estate"
            sx={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 1 }}
          />
          <Box>
            <Typography variant="h6" component="h1" sx={{ lineHeight: 1.2, fontSize: '0.95rem' }}>
              Henry — Document Operations
            </Typography>
            <Typography variant="caption" component="p" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
              White Caves Real Estate L.L.C · Dubai · DLD/RERA Workflow
            </Typography>
            <Typography
              variant="caption"
              component="small"
              sx={{ color: 'text.secondary', opacity: 0.75 }}
            >
              Policy {policyMeta.version} · Reviewed {policyMeta.reviewedAt}
            </Typography>
          </Box>
        </Box>

        {/* Henry identity card */}
        <Box
          ref={identityRef}
          role="complementary"
          aria-label="AI Assistant identity"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexGrow: 1,
            ml: 1,
            background: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)',
            border: '1px solid #fde68a',
            borderLeft: '3px solid #d97706',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            maxWidth: 300,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Box component="span" aria-hidden="true" sx={{ fontSize: '1.3rem', lineHeight: 1 }}>
            🤵
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', minWidth: 0 }}>
            <Typography
              component="p"
              sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e', whiteSpace: 'nowrap' }}
            >
              {henry.name}
            </Typography>
            <Typography
              component="p"
              sx={{ fontSize: '0.72rem', color: '#b45309', fontStyle: 'italic', whiteSpace: 'nowrap' }}
            >
              {henry.title}
            </Typography>
            <Chip
              size="small"
              aria-label={`Henry status: ${henry.status}`}
              icon={
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#16a34a',
                    display: 'inline-block',
                    ml: '6px !important',
                  }}
                />
              }
              label={henry.status}
              sx={{
                height: 20,
                '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem', fontWeight: 600 },
                bgcolor: 'rgba(255,255,255,0.7)',
                border: '1px solid #e5e7eb',
              }}
            />
            <MuiButton
              size="small"
              variant="outlined"
              aria-haspopup="dialog"
              aria-expanded={identityOpen}
              aria-label="Toggle Henry identity details"
              onClick={() => setIdentityOpen((v) => !v)}
              sx={{
                fontSize: '0.7rem',
                py: 0.25,
                px: 1,
                minWidth: 0,
                borderRadius: '999px',
                borderColor: '#e5e7eb',
                color: '#374151',
                '&:hover': { borderColor: '#9ca3af', bgcolor: '#fff' },
              }}
            >
              ℹ Details
            </MuiButton>
          </Box>

          {identityOpen ? (
            <Box
              role="dialog"
              aria-label="Henry identity details"
              sx={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 1200,
                minWidth: 240,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.5,
                boxShadow: 3,
              }}
            >
              <Typography variant="body2" component="p" className="henry-identity__meta" sx={{ mb: 0.5 }}>
                <strong>AI ID:</strong> {henry.aiId}
              </Typography>
              <Typography variant="body2" component="p" className="henry-identity__meta" sx={{ mb: 0.5 }}>
                <strong>Module:</strong> {henry.module}
              </Typography>
              <Typography variant="body2" component="p" className="henry-identity__meta" sx={{ mb: 1 }}>
                <strong>Last Sync:</strong>{' '}
                {henry.lastSyncedAt
                  ? henry.lastSyncedAt.replace('T', ' ').replace('Z', ' UTC')
                  : 'Standalone mode'}
              </Typography>
              <Box className="henry-identity__row" sx={{ display: 'flex', gap: 1 }}>
                <MuiButton
                  size="small"
                  variant="outlined"
                  className="henry-identity__action"
                  onClick={() => {
                    openCommandPalette();
                    setIdentityOpen(false);
                  }}
                  sx={{ fontSize: '0.72rem' }}
                >
                  ⌘ Open palette
                </MuiButton>
                <MuiButton
                  size="small"
                  variant="outlined"
                  className="henry-identity__action"
                  onClick={() => setIdentityOpen(false)}
                  sx={{ fontSize: '0.72rem' }}
                >
                  Close
                </MuiButton>
              </Box>
            </Box>
          ) : null}
        </Box>

        {/* Flexible spacer */}
        <Box sx={{ flex: '1 1 auto' }} />

        {/* Right-side action area */}
        <Box
          aria-label="Document actions"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}
        >
          <Typography
            component="p"
            className="top-navbar__active-doc"
            sx={{
              fontSize: '0.72rem',
              color: 'text.secondary',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              maxWidth: '22ch',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Active Document: {activeTemplateLabel}
          </Typography>
          <AutosaveIndicator />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />
          <Tooltip title="Command palette (Ctrl+K)" placement="bottom">
            <Chip
              size="small"
              component="button"
              type="button"
              label="⌘ Search"
              onClick={openCommandPalette}
              aria-label="Open command palette (Ctrl+K)"
              clickable
              sx={{ fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip
            title={`Theme: ${themeMode} → ${THEME_NEXT[themeMode]}`}
            placement="bottom"
          >
            <Chip
              size="small"
              component="button"
              type="button"
              label={THEME_LABEL[themeMode]}
              onClick={cycleTheme}
              aria-label={`Theme: ${themeMode} (resolved ${themeResolved}). Click to switch to ${THEME_NEXT[themeMode]}.`}
              clickable
              sx={{ fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}
            />
          </Tooltip>
          <Tooltip
            title={density === 'compact' ? 'Switch to comfortable density' : 'Switch to compact density'}
            placement="bottom"
          >
            <Chip
              size="small"
              component="button"
              type="button"
              label={density === 'compact' ? '▤ Compact' : '▣ Comfortable'}
              onClick={toggleDensity}
              aria-pressed={density === 'compact'}
              clickable
              sx={{ fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}
            />
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

TopNavbar.displayName = 'TopNavbar';

export default TopNavbar;
