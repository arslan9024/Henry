import React, { useMemo, useState } from 'react';

// Inline panel rendered inside the chat message stream when the LLM has
// returned extraction suggestions from an uploaded file. Per-row Apply +
// Apply All; Dismiss removes the row from local state only.

const truncateValue = (value) => {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (!str) return '';
  return str.length > 60 ? `${str.slice(0, 57)}…` : str;
};

const confidenceTone = (c) => {
  if (c >= 0.85) return 'high';
  if (c >= 0.7) return 'med';
  return 'low';
};

const FileExtractionPanel = ({ fileName, suggestions, onApply, onApplyAll, onDismiss, onDismissAll }) => {
  const [appliedKeys, setAppliedKeys] = useState(() => new Set());
  const [dismissedKeys, setDismissedKeys] = useState(() => new Set());

  const visible = useMemo(
    () =>
      suggestions
        .map((s, i) => ({ ...s, _key: `${s.section}.${s.field}.${i}` }))
        .filter((s) => !dismissedKeys.has(s._key)),
    [suggestions, dismissedKeys],
  );

  if (!visible.length) return null;

  const remaining = visible.filter((s) => !appliedKeys.has(s._key));

  const handleApply = (suggestion) => {
    onApply(suggestion);
    setAppliedKeys((prev) => {
      const next = new Set(prev);
      next.add(suggestion._key);
      return next;
    });
  };

  const handleApplyAll = () => {
    const toApply = remaining;
    onApplyAll(toApply);
    setAppliedKeys((prev) => {
      const next = new Set(prev);
      toApply.forEach((s) => next.add(s._key));
      return next;
    });
  };

  const handleDismiss = (key) => {
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    onDismiss?.(key);
  };

  return (
    <div className="llm-chat__extraction" role="region" aria-label="File extraction suggestions">
      <div className="llm-chat__extraction-head">
        <span className="llm-chat__extraction-title">📎 {fileName}</span>
        <span className="llm-chat__extraction-count">
          {remaining.length} of {visible.length} suggestions
        </span>
      </div>

      <ul className="llm-chat__suggestion-list">
        {visible.map((s) => {
          const applied = appliedKeys.has(s._key);
          return (
            <li
              key={s._key}
              className={`llm-chat__suggestion-row${applied ? ' applied' : ''}`}
              title={s.rationale || ''}
            >
              <div className="llm-chat__suggestion-meta">
                <code className="llm-chat__suggestion-target">
                  {s.section}.{s.field}
                </code>
                <span
                  className={`llm-chat__confidence llm-chat__confidence--${confidenceTone(s.confidence)}`}
                >
                  {Math.round(s.confidence * 100)}%
                </span>
              </div>
              <div className="llm-chat__suggestion-value">{truncateValue(s.value)}</div>
              <div className="llm-chat__suggestion-actions">
                {applied ? (
                  <span className="llm-chat__suggestion-applied">✓ Applied</span>
                ) : (
                  <>
                    <button type="button" className="utility-btn" onClick={() => handleApply(s)}>
                      Apply
                    </button>
                    <button
                      type="button"
                      className="utility-btn secondary"
                      onClick={() => handleDismiss(s._key)}
                    >
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="llm-chat__extraction-foot">
        <button
          type="button"
          className="utility-btn"
          onClick={handleApplyAll}
          disabled={remaining.length === 0}
        >
          Apply all ({remaining.length})
        </button>
        <button type="button" className="utility-btn secondary" onClick={onDismissAll}>
          Dismiss all
        </button>
      </div>
    </div>
  );
};

export default React.memo(FileExtractionPanel);
