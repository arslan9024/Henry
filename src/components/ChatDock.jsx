import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LlmFooterChatBox from './LlmFooterChatBox';
import useFocusTrap from '../hooks/useFocusTrap';
import useBackgroundInert from '../hooks/useBackgroundInert';
import {
  closeChat,
  openChat,
  selectChatActivationKey,
  selectChatOpen,
  toggleChat,
} from '../store/uiCommandSlice';

const ChatDock = () => {
  const dispatch = useDispatch();
  const open = useSelector(selectChatOpen);
  const activationKey = useSelector(selectChatActivationKey);
  const [hasOpened, setHasOpened] = useState(open);

  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (open && e.key === 'Escape') {
        dispatch(closeChat());
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        dispatch(toggleChat({ activate: true }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, open]);

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
          <div className="chat-dock__body">
            {hasOpened ? <LlmFooterChatBox activationKey={activationKey} /> : null}
          </div>
        </section>
      ) : (
        <button
          type="button"
          className="chat-dock__fab"
          onClick={() => dispatch(openChat({ activate: true }))}
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
