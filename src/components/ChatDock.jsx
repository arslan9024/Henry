import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LlmFooterChatBox from './LlmFooterChatBox';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import { STORAGE_KEY_CHAT_DOCK } from '../constants/storageKeys';
import { openChat, closeChat, toggleChat, selectChatOpen } from '../store/uiCommandSlice';

const readInitialOpen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_CHAT_DOCK) === 'open';
  } catch {
    return false;
  }
};

/**
 * ChatDock — floating Intercom-style bubble that hosts the Ask-Henry chat.
 *
 * Closed: 56 px circular FAB (bottom-right). Open: 380×560 panel that
 * lazy-mounts the LlmFooterChatBox the first time it's opened.
 *
 * Open/closed state is managed in Redux (selectChatOpen) and persisted to
 * localStorage via a useEffect so refresh doesn't lose the user's choice.
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
    <div className={`chat-dock print-hidden ${open ? 'chat-dock--open' : ''}`}>
      {open ? (
        <section
          ref={trapRef}
          className="chat-dock__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Ask Henry chat"
          tabIndex={-1}
        >
          <header className="chat-dock__topbar">
            <strong className="chat-dock__title">Ask Henry</strong>
            <button
              type="button"
              className="chat-dock__close"
              onClick={() => dispatch(closeChat())}
              aria-label="Close chat"
              title="Close (Esc)"
            >
              ✕
            </button>
          </header>
          <div className="chat-dock__body">{hasOpened ? <LlmFooterChatBox /> : null}</div>
        </section>
      ) : (
        <button
          type="button"
          className="chat-dock__fab"
          onClick={handleOpen}
          aria-label="Open Ask Henry chat"
          title="Ask Henry"
        >
          <span aria-hidden="true">💬</span>
        </button>
      )}
    </div>
  );
};

export default React.memo(ChatDock);
