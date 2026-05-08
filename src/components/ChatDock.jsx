import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LlmFooterChatBox from './LlmFooterChatBox';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import { STORAGE_KEY_CHAT_DOCK } from '../constants/storageKeys';
import { openChat, closeChat, selectChatOpen } from '../store/uiCommandSlice';

import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiIconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Slide from '@mui/material/Slide';

const readInitialOpen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_CHAT_DOCK) === 'open';
  } catch {
    return false;
  }
};

/**
 * ChatDock — floating MUI Fab (bottom-right) that opens a chat panel backed
 * by the Ask-Henry LLM widget.
 *
 * Open/closed state is managed in Redux (selectChatOpen) and persisted to
 * localStorage. The Fab uses MUI's gradient primary colour; the panel uses
 * MUI Paper with a red gradient header.
 */
const ChatDock = () => {
  const dispatch = useDispatch();
  const open = useSelector(selectChatOpen);
  const [hasOpened, setHasOpened] = useState(readInitialOpen);

  // Bootstrap Redux from persisted value on mount (single-time only).
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (readInitialOpen()) dispatch(openChat());
  }, [dispatch]);

  // Persist open state.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT_DOCK, open ? 'open' : 'closed');
    } catch {
      /* ignore quota/private-mode errors */
    }
    if (open) setHasOpened(true);
  }, [open]);

  const handleOpen = useCallback(() => {
    dispatch(openChat());
    setHasOpened(true);
  }, [dispatch]);

  // Esc closes the panel; Ctrl+/ (or Cmd+/) toggles it from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if (open && e.key === 'Escape') {
        dispatch(closeChat());
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        if (open) {
          dispatch(closeChat());
        } else {
          handleOpen();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleOpen, dispatch]);

  const trapRef = useFocusTrap(open);
  useBackgroundInert(open);

  return (
    <Box
      className={`chat-dock print-hidden ${open ? 'chat-dock--open' : ''}`}
      sx={{
        position: 'fixed',
        right: { xs: 12, sm: 24 },
        bottom: { xs: 12, sm: 24 },
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {/* Chat panel */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          component="section"
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-label="Ask Henry chat"
          tabIndex={-1}
          elevation={8}
          sx={{
            width: { xs: 'calc(100vw - 24px)', sm: 390 },
            height: { xs: 'calc(100vh - 80px)', sm: 580 },
            maxHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Header */}
          <Box
            component="header"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.25,
              background: 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              component="strong"
              sx={{
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              💬 Ask Henry
            </Typography>
            <Tooltip title="Close (Esc)" placement="left">
              <MuiIconButton
                size="small"
                onClick={() => dispatch(closeChat())}
                aria-label="Close chat"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                ✕
              </MuiIconButton>
            </Tooltip>
          </Box>

          {/* Body */}
          <Box
            className="chat-dock__body"
            sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}
          >
            {hasOpened ? <LlmFooterChatBox /> : null}
          </Box>
        </Paper>
      </Slide>

      {/* FAB */}
      {!open ? (
        <Tooltip title="Ask Henry (Ctrl+/)" placement="left">
          <Fab
            color="primary"
            aria-label="Open Ask Henry chat"
            onClick={handleOpen}
            sx={{
              background: 'linear-gradient(145deg, #dc2626 0%, #991b1b 100%)',
              '&:hover': {
                background: 'linear-gradient(145deg, #b91c1c 0%, #7f1d1d 100%)',
              },
            }}
          >
            {/* aria-label on the Fab is the accessible name; the emoji is decorative */}
            <span role="img" aria-label="chat bubble" style={{ fontSize: '1.3rem' }}>
              💬
            </span>
          </Fab>
        </Tooltip>
      ) : null}
    </Box>
  );
};

export default React.memo(ChatDock);
