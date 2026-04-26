import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast, selectToasts } from '../store/uiSlice';

/**
 * Single toast row. Owns its own auto-dismiss timer so it survives the
 * parent re-rendering when sibling toasts arrive.
 */
const ToastItem = React.memo(({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast.durationMs) return undefined;
    const t = setTimeout(() => dispatch(dismissToast(toast.id)), toast.durationMs);
    return () => clearTimeout(t);
  }, [toast.id, toast.durationMs, dispatch]);

  return (
    <div
      className={`toast toast--${toast.tone}`}
      role={toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status'}
      aria-live={toast.tone === 'error' || toast.tone === 'warning' ? 'assertive' : 'polite'}
    >
      <div className="toast__body">
        {toast.title ? <strong className="toast__title">{toast.title}</strong> : null}
        {toast.body ? <span className="toast__text">{toast.body}</span> : null}
      </div>
      {toast.action ? (
        <button
          type="button"
          className="toast__action"
          onClick={() => {
            dispatch({ type: toast.action.type, payload: toast.action.payload });
            dispatch(dismissToast(toast.id));
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        className="toast__close"
        onClick={() => dispatch(dismissToast(toast.id))}
        aria-label="Dismiss notification"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
});
ToastItem.displayName = 'ToastItem';

/**
 * ToastHost — fixed top-right stack of transient notifications.
 * Mount once at the App root; dispatch via `pushToast({ tone, title, body })`.
 */
const ToastHost = () => {
  const toasts = useSelector(selectToasts);
  if (!toasts.length) return null;
  return (
    <div className="toast-host print-hidden" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
};

export default React.memo(ToastHost);
