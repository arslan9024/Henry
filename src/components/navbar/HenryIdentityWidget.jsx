/**
 * [Category 1: View]
 * White Caves Real Estate - Henry AI Assistant Identity Widget
 * Status dot, AI ID details dialog popover, and Right Side Panel trigger (< 90 lines).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectHenry } from '../../store/selectors';
import { openCommandPalette, toggleRightPanel } from '../../store/uiCommandSlice';

export const HenryIdentityWidget = () => {
  const dispatch = useDispatch();
  const henry = useSelector(selectHenry);
  const [identityOpen, setIdentityOpen] = useState(false);
  const identityRef = useRef(null);

  useEffect(() => {
    if (!identityOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIdentityOpen(false);
    };
    const onMouseDown = (e) => {
      if (!identityRef.current?.contains(e.target)) {
        setIdentityOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [identityOpen]);

  return (
    <div className="henry-identity" role="complementary" aria-label="AI Assistant identity" ref={identityRef}>
      <div className="henry-identity__avatar" aria-hidden="true">
        🤵
      </div>
      <div className="henry-identity__info">
        <p className="henry-identity__name">{henry.name}</p>
        <p className="henry-identity__title">{henry.title}</p>
        <p className="henry-identity__module">Module: {henry.module}</p>
        <span className="henry-identity__status" aria-label={`Henry status: ${henry.status}`}>
          <span className="henry-identity__status-dot" aria-hidden="true" />
          {henry.status}
        </span>
        <div className="henry-identity__actions">
          <button
            type="button"
            className="henry-identity__toggle"
            aria-haspopup="dialog"
            aria-expanded={identityOpen}
            aria-label="Toggle Henry identity details"
            onClick={() => setIdentityOpen((v) => !v)}
          >
            ℹ Details
          </button>
          <button
            type="button"
            className="henry-identity__toggle henry-identity__toggle--ops"
            onClick={() => dispatch(toggleRightPanel())}
            aria-label="Open Operations Panel"
            title="Open Right Side Operations Panel"
          >
            ⚡ Panel
          </button>
        </div>
      </div>

      {identityOpen && (
        <div className="henry-identity__popover" role="dialog" aria-label="Henry identity details">
          <p className="henry-identity__meta">
            <strong>AI ID:</strong> {henry.aiId}
          </p>
          <p className="henry-identity__meta">
            <strong>Module:</strong> {henry.module}
          </p>
          <p className="henry-identity__meta">
            <strong>Last Sync:</strong>{' '}
            {henry.lastSyncedAt
              ? henry.lastSyncedAt.replace('T', ' ').replace('Z', ' UTC')
              : 'Standalone mode'}
          </p>
          <div className="henry-identity__row">
            <button
              type="button"
              className="henry-identity__action"
              onClick={() => {
                dispatch(openCommandPalette());
                setIdentityOpen(false);
              }}
            >
              ⌘ Open palette
            </button>
            <button
              type="button"
              className="henry-identity__action"
              onClick={() => {
                dispatch(toggleRightPanel());
                setIdentityOpen(false);
              }}
            >
              Open Side Panel →
            </button>
            <button type="button" className="henry-identity__action" onClick={() => setIdentityOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HenryIdentityWidget);
