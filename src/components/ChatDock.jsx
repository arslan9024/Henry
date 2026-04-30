import React, { useCallback, useEffect, useState } from 'react';
import LlmFooterChatBox from './LlmFooterChatBox';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';

const STORAGE_KEY = 'henry.ui.chatDock';

const readInitial = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'open';
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
 * State persists to localStorage so refresh doesn't lose the user's choice.
 */
const ChatDock = () => {
  const [open, setOpen] = useState(readInitial);
  const [hasOpened, setHasOpened] = useState(open);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? 'open' : 'closed');
    } catch {
      /* ignore quota/private-mode errors */
    }
  }, [open]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setHasOpened(true);
    window.dispatchEvent(
      new CustomEvent('henry:activate-ollama', {
        detail: { source: 'chat-dock-open', at: new Date().toISOString() },
      }),
    );
  }, []);

  useEffect(() => {
    const onOpenChat = () => handleOpen();
    window.addEventListener('henry:open-chat', onOpenChat);
    return () => window.removeEventListener('henry:open-chat', onOpenChat);
  }, [handleOpen]);

  // Esc closes the panel; Ctrl+/ (or Cmd+/) toggles it from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if (open && e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        // Avoid hijacking text-input slashes — require modifier only.
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          handleOpen();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleOpen]);

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
              onClick={() => setOpen(false)}
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
