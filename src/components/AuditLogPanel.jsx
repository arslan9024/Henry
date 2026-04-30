import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Disclosure from './Disclosure';
import { EmptyState } from './ui';
import { clearAuditLogs, restoreAuditLogs } from '../store/auditSlice';
import { pushToast } from '../store/uiSlice';

/**
 * Group entries by ISO day so the user can navigate the audit trail by date.
 * Newest day first; entries within a day stay in the slice's reverse-chronological order.
 */
const dayKey = (iso) => {
  if (!iso) return 'Unknown date';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const timeOfDay = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/**
 * Tone-classify each event type so the user can scan severity at a glance.
 * Anything not listed defaults to neutral.
 */
const TYPE_TONE = {
  PRINT: 'default',
  PDF_GENERATED: 'success',
  COMPLIANCE_CHECK_RUN: 'default',
  LLM_FIELD_APPLIED: 'success',
  LLM_FILE_FIELD_APPLIED: 'success',
  LLM_FILE_BULK_APPLIED: 'success',
  CHAT_FILE_UPLOADED: 'default',
};

const TONE_DOT = {
  default: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

/**
 * Render the discriminating fields of each event type as a compact summary line.
 * Falls back to JSON if we don't have a hand-written formatter.
 */
const summaryFor = (entry) => {
  switch (entry.type) {
    case 'PRINT':
      return `Printed · ${entry.template || '?'}`;
    case 'PDF_GENERATED':
      return `${entry.fileName || 'PDF'}${entry.persisted ? ` → ${entry.persisted}` : ' (download only)'}`;
    case 'COMPLIANCE_CHECK_RUN':
      return `${entry.template || '?'} · ${entry.warningCount ?? 0} warning${entry.warningCount === 1 ? '' : 's'} (${entry.criticalCount ?? 0} critical)`;
    case 'LLM_FIELD_APPLIED':
      return `Chat applied ${entry.section}.${entry.field}`;
    case 'LLM_FILE_FIELD_APPLIED':
      return `From ${entry.fileName || 'file'}: ${entry.section}.${entry.field}${typeof entry.confidence === 'number' ? ` (${Math.round(entry.confidence * 100)}%)` : ''}`;
    case 'LLM_FILE_BULK_APPLIED':
      return `Bulk applied ${entry.appliedCount} field${entry.appliedCount === 1 ? '' : 's'} from ${entry.fileName || 'file'}`;
    case 'CHAT_FILE_UPLOADED':
      return `Uploaded ${entry.fileName || 'file'} · ${entry.suggestionCount ?? 0} suggestion${entry.suggestionCount === 1 ? '' : 's'}`;
    default:
      return entry.type || 'Unknown event';
  }
};

const AuditLogPanel = () => {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.audit.logs);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());
  const fileInputRef = useRef(null);

  // Inline confirmation state (replaces window.confirm for accessibility).
  const [clearPending, setClearPending] = useState(false);
  const [importPendingData, setImportPendingData] = useState(null); // { valid, fileName, snapshot }

  const toggleExpanded = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const eventTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.type).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [logs]);

  const filtered = useMemo(() => {
    const byType = filter === 'ALL' ? logs : logs.filter((l) => l.type === filter);
    const q = query.trim().toLowerCase();
    if (!q) return byType;
    return byType.filter((entry) => {
      // Cheap haystack: type + rendered summary + serialized payload.
      // JSON.stringify is fine here — cap is 100 entries and search runs only on input change.
      if ((entry.type || '').toLowerCase().includes(q)) return true;
      if (summaryFor(entry).toLowerCase().includes(q)) return true;
      try {
        return JSON.stringify(entry).toLowerCase().includes(q);
      } catch {
        return false;
      }
    });
  }, [logs, filter, query]);

  const grouped = useMemo(() => {
    const buckets = new Map();
    filtered.forEach((entry) => {
      const key = dayKey(entry.timestamp);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(entry);
    });
    return Array.from(buckets.entries()); // [ [dayLabel, entries[]], ... ]
  }, [filtered]);

  const handleExport = () => {
    try {
      const payload = JSON.stringify(logs, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `henry-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      dispatch(
        pushToast({
          tone: 'success',
          title: 'Audit log exported',
          body: `${logs.length} entries downloaded.`,
        }),
      );
    } catch (err) {
      dispatch(pushToast({ tone: 'error', title: 'Export failed', body: String(err?.message || err) }));
    }
  };

  const handleClear = () => {
    if (!logs.length) return;
    setClearPending(true);
  };

  const handleClearConfirm = () => {
    setClearPending(false);
    const snapshot = logs.slice();
    dispatch(clearAuditLogs());
    dispatch(
      pushToast({
        tone: 'warning',
        title: 'Audit log cleared',
        body: `${snapshot.length} entr${snapshot.length === 1 ? 'y' : 'ies'} removed.`,
        durationMs: 10000,
        action: {
          label: 'Undo',
          type: restoreAuditLogs.type,
          payload: snapshot,
        },
      }),
    );
  };

  /**
   * Round-trip with handleExport: read a JSON array of entries from disk,
   * validate shape, and offer to merge or replace. We always snapshot the
   * current logs first so the toast can offer Undo.
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file later
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of entries.');
      const valid = parsed.filter((p) => p && typeof p === 'object' && typeof p.type === 'string');
      if (!valid.length) throw new Error('No valid entries found in file.');

      // Show inline merge/replace confirmation dialog.
      setImportPendingData({ valid, fileName: file.name, snapshot: logs.slice() });
    } catch (err) {
      dispatch(pushToast({ tone: 'error', title: 'Import failed', body: String(err?.message || err) }));
    }
  };

  const handleImportConfirm = (merge) => {
    if (!importPendingData) return;
    const { valid, fileName, snapshot } = importPendingData;
    setImportPendingData(null);

    const next = merge
      ? // De-dup: use `id` when present (new entries), also match by timestamp|type for legacy.
        (() => {
          const seenIds = new Set(logs.filter((l) => l.id).map((l) => l.id));
          // Only use legacy dedup for logs that don't have an id (backward compatibility).
          const seenLegacy = new Set(logs.filter((l) => !l.id).map((l) => `${l.timestamp}|${l.type}`));
          const additions = valid.filter((v) => {
            if (v.id && seenIds.has(v.id)) return false;
            if (seenLegacy.has(`${v.timestamp}|${v.type}`)) return false;
            return true;
          });
          return [...logs, ...additions].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        })()
      : valid.slice().sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

    dispatch(restoreAuditLogs(next));
    dispatch(
      pushToast({
        tone: 'success',
        title: merge ? 'Audit log merged' : 'Audit log replaced',
        body: `${fileName} → ${Math.min(next.length, 100)} entr${next.length === 1 ? 'y' : 'ies'} now in log.`,
        durationMs: 10000,
        action: {
          label: 'Undo',
          type: restoreAuditLogs.type,
          payload: snapshot,
        },
      }),
    );
  };

  return (
    <div className="audit-panel">
      <header className="audit-panel__toolbar">
        <label className="audit-panel__filter">
          <span>Filter</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? `All (${logs.length})` : t}
              </option>
            ))}
          </select>
        </label>
        <input
          type="search"
          className="audit-panel__search"
          placeholder="Search type, summary, or payload…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search audit log"
        />
        <span className="audit-panel__count">
          {filtered.length} / {logs.length}
        </span>
        <button
          type="button"
          className="audit-panel__btn"
          onClick={handleImportClick}
          title="Import audit entries from a previously-exported JSON file"
        >
          ⬆ Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <button
          type="button"
          className="audit-panel__btn"
          onClick={handleExport}
          disabled={!logs.length}
          title="Download all audit entries as JSON"
        >
          ⬇ Export
        </button>
        <button
          type="button"
          className="audit-panel__btn audit-panel__btn--danger"
          onClick={handleClear}
          disabled={!logs.length}
          title="Permanently remove all audit entries"
        >
          ✕ Clear
        </button>
      </header>

      {/* Inline confirmation — replaces window.confirm for accessibility */}
      {clearPending && (
        <div
          role="alertdialog"
          aria-modal="false"
          aria-label="Confirm clear audit log"
          className="audit-panel__confirm"
        >
          <span>Clear all {logs.length} audit log entries?</span>
          <button
            type="button"
            className="audit-panel__btn audit-panel__btn--danger"
            onClick={handleClearConfirm}
          >
            Confirm
          </button>
          <button type="button" className="audit-panel__btn" onClick={() => setClearPending(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Inline merge/replace confirmation */}
      {importPendingData && (
        <div
          role="alertdialog"
          aria-modal="false"
          aria-label="Confirm import mode"
          className="audit-panel__confirm"
        >
          <span>
            Found {importPendingData.valid.length} entr{importPendingData.valid.length === 1 ? 'y' : 'ies'} in{' '}
            {importPendingData.fileName}. Merge or replace?
          </span>
          <button type="button" className="audit-panel__btn" onClick={() => handleImportConfirm(true)}>
            Merge
          </button>
          <button
            type="button"
            className="audit-panel__btn audit-panel__btn--danger"
            onClick={() => handleImportConfirm(false)}
          >
            Replace
          </button>
          <button type="button" className="audit-panel__btn" onClick={() => setImportPendingData(null)}>
            Cancel
          </button>
        </div>
      )}

      {!logs.length ? (
        <EmptyState
          icon="📜"
          title="Audit trail is empty"
          description="No audit events recorded yet. Compliance checks, PDF exports, and chat-applied fields will appear here."
        />
      ) : !filtered.length ? (
        <EmptyState
          icon="🔍"
          title="No matching entries"
          description={`No entries match the current filter${query ? ' or search' : ''}.`}
        />
      ) : (
        grouped.map(([day, entries], idx) => (
          <Disclosure key={day} title={day} icon="📅" badge={`${entries.length}`} defaultOpen={idx === 0}>
            <ul className="audit-list">
              {entries.map((entry, i) => {
                const tone = TYPE_TONE[entry.type] || 'default';
                const rowKey = `${entry.timestamp}-${i}`;
                const isExpanded = expanded.has(rowKey);
                return (
                  <li key={rowKey} className="audit-list__row">
                    <span
                      className="audit-list__dot"
                      style={{ background: TONE_DOT[tone] }}
                      aria-hidden="true"
                    />
                    <div className="audit-list__main">
                      <button
                        type="button"
                        className="audit-list__head audit-list__head--btn"
                        onClick={() => toggleExpanded(rowKey)}
                        aria-expanded={isExpanded}
                        title={isExpanded ? 'Collapse details' : 'Show raw JSON'}
                      >
                        <code className="audit-list__type">{entry.type}</code>
                        <span className="audit-list__time">{timeOfDay(entry.timestamp)}</span>
                        <span className="audit-list__chevron" aria-hidden="true">
                          {isExpanded ? '▾' : '▸'}
                        </span>
                      </button>
                      <p className="audit-list__summary">{summaryFor(entry)}</p>
                      {isExpanded ? (
                        <pre className="audit-list__raw">
                          <code>{JSON.stringify(entry, null, 2)}</code>
                        </pre>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Disclosure>
        ))
      )}
    </div>
  );
};

export default React.memo(AuditLogPanel);
