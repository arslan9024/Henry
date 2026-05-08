import React, { useEffect, useState } from 'react';
import PrintButton from './PrintButton';
import { STORAGE_KEY_FOOTER_BAR } from '../constants/storageKeys';

import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';

const readFooterState = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY_FOOTER_BAR);
    if (v === 'collapsed') return true;
  } catch {
    /* ignore */
  }
  return false;
};

const TONE_COLORS = {
  clear: 'success',
  critical: 'error',
  important: 'warning',
};

const FooterActionBar = ({
  activeTemplateLabel,
  previewMode,
  canGeneratePdf,
  onTogglePreview,
  onOpenCompliance,
  onRunComplianceCheck,
  onOpenArchive,
  onOpenAudit,
  badgeTone,
  badgeLabel,
  badgeTitle,
}) => {
  const [collapsed, setCollapsed] = useState(readFooterState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOOTER_BAR, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const badgeIcon = badgeTone === 'clear' ? '✓' : badgeTone === 'critical' ? '✕' : '!';

  return (
    <Paper
      component="footer"
      role="contentinfo"
      aria-label="Document footer actions"
      square
      elevation={0}
      className="footer-action-bar print-hidden"
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 30,
        borderTop: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 -2px 12px rgba(15,23,42,0.06)',
        px: 2,
        py: 0.75,
      }}
    >
      {/* Header row: title + template label + collapse toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Typography
            component="p"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            Action Center
          </Typography>
          <Typography
            component="p"
            title={activeTemplateLabel}
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '40ch',
            }}
          >
            {activeTemplateLabel}
          </Typography>
        </Box>

        <MuiButton
          size="small"
          variant="outlined"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="footer-action-controls"
          title={collapsed ? 'Expand action center' : 'Collapse action center'}
          sx={{
            fontSize: '0.72rem',
            py: 0.25,
            px: 1.25,
            borderRadius: '999px',
            minWidth: 0,
            flexShrink: 0,
          }}
        >
          {collapsed ? '▴ Expand' : '▾ Collapse'}
        </MuiButton>
      </Box>

      {/* Collapsible controls row */}
      <Collapse in={!collapsed}>
        <Box
          id="footer-action-controls"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            pt: 0.75,
          }}
        >
          {/* Preview toggle */}
          <Tooltip
            title={
              canGeneratePdf
                ? 'Toggle A4 vector preview'
                : 'PDF preview not available for this template'
            }
            placement="top"
          >
            <span>
              <MuiButton
                size="small"
                variant={previewMode ? 'contained' : 'outlined'}
                color={previewMode ? 'primary' : 'inherit'}
                onClick={onTogglePreview}
                disabled={!canGeneratePdf && !previewMode}
                sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                {previewMode ? '✏️  Edit Form' : '👁  Toggle Print Preview'}
              </MuiButton>
            </span>
          </Tooltip>

          {/* Compliance badge */}
          <Tooltip title={badgeTitle} placement="top">
            <Chip
              size="small"
              component="button"
              type="button"
              color={TONE_COLORS[badgeTone] ?? 'default'}
              variant="outlined"
              label={`${badgeIcon} ${badgeLabel}`}
              aria-label={`Compliance status: ${badgeLabel} — open checklist`}
              onClick={onOpenCompliance}
              clickable
              sx={{ fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}
            />
          </Tooltip>

          {/* Run compliance check */}
          <Tooltip title="Audit current document against RERA / DLD compliance rules" placement="top">
            <MuiButton
              size="small"
              variant="outlined"
              onClick={onRunComplianceCheck}
              aria-label="Run compliance check"
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              ✅ Compliance Check
            </MuiButton>
          </Tooltip>

          {/* Archive */}
          <Tooltip title="Open archive history" placement="top">
            <MuiButton
              size="small"
              variant="outlined"
              onClick={onOpenArchive}
              aria-label="Open archive history"
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              🗂 Archive
            </MuiButton>
          </Tooltip>

          {/* Audit */}
          <Tooltip title="Open audit log" placement="top">
            <MuiButton
              size="small"
              variant="outlined"
              onClick={onOpenAudit}
              aria-label="Open audit log"
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              📜 Audit
            </MuiButton>
          </Tooltip>

          {/* Print action (far right) */}
          <Box sx={{ ml: 'auto' }}>
            <PrintButton />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default React.memo(FooterActionBar);
