import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { evaluateCompliance } from '../compliance/ruleEngine';
import { selectDocument, selectCanGeneratePdf } from '../store/selectors';
import { TEMPLATE_MAP } from '../templates/registry';

// ─── Field completion definitions ────────────────────────────────────────────
// Each group maps a section key from the Redux document slice to a list of
// field names. We count how many are non-empty to show a per-section badge.
const FIELD_GROUPS = [
  {
    label: 'Property Details',
    icon: '🏠',
    section: 'property',
    fields: ['referenceNo', 'documentDate', 'unit', 'community', 'propertyType', 'description'],
  },
  {
    label: 'Tenant Details',
    icon: '👤',
    section: 'tenant',
    fields: ['fullName', 'contactNo', 'email', 'emiratesId', 'passportNo'],
  },
  {
    label: 'Financial Details',
    icon: '💰',
    section: 'payments',
    fields: ['annualRent', 'securityDeposit', 'agencyFee', 'moveInDate', 'modeOfPayment'],
  },
  {
    label: 'Broker / Agent',
    icon: '🏢',
    section: 'broker',
    fields: ['brokerName', 'orn', 'brn'],
  },
];

// ─── Helper: count filled fields in a section ────────────────────────────────
const countFilled = (sectionData, fields) =>
  fields.filter((f) => {
    const v = sectionData?.[f];
    if (v === null || v === undefined) return false;
    if (typeof v === 'number') return v > 0;
    return String(v).trim().length > 0;
  }).length;

// ─── CompletionBar ────────────────────────────────────────────────────────────
const CompletionBar = ({ pct }) => (
  <div
    className="dc-bar"
    aria-label={`${pct}% complete`}
    role="progressbar"
    aria-valuenow={pct}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className={`dc-bar__fill ${pct === 100 ? 'dc-bar__fill--complete' : pct >= 60 ? 'dc-bar__fill--good' : 'dc-bar__fill--low'}`}
      style={{ width: `${pct}%` }}
    />
  </div>
);

// ─── DownloadBlankButton ──────────────────────────────────────────────────────
const DownloadBlankButton = ({ templateKey, canGeneratePdf }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    try {
      setLoading(true);
      setError('');
      const { downloadBlankTemplate } = await import('../pdf/generateQuotationPdf');
      await downloadBlankTemplate(templateKey);
    } catch (err) {
      setError(err?.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  if (!canGeneratePdf) return null;

  return (
    <div className="dc-blank">
      <button
        type="button"
        className="dc-blank__btn"
        onClick={handleClick}
        disabled={loading}
        title="Download an unfilled version of this template"
        aria-label="Download blank template as PDF"
      >
        {loading ? '⏳ Preparing…' : '⬇ Download Blank Template'}
      </button>
      {error && <p className="dc-blank__error">{error}</p>}
      <p className="dc-blank__hint">
        Blank PDF — company letterhead only, no client data. Use for staff circulation.
      </p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const DocumentChecklistPanel = () => {
  const documentData = useSelector(selectDocument);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const templateMeta = TEMPLATE_MAP[activeTemplate];

  // Live compliance warnings (same as what the footer badge shows)
  const warnings = useMemo(
    () => evaluateCompliance(activeTemplate, documentData),
    [activeTemplate, documentData],
  );
  const criticalCount = warnings.filter((w) => w.severity === 'critical').length;
  const importantCount = warnings.filter((w) => w.severity === 'important').length;

  // Compute completion per group
  const groups = useMemo(
    () =>
      FIELD_GROUPS.map((g) => {
        const filled = countFilled(documentData[g.section], g.fields);
        const total = g.fields.length;
        return { ...g, filled, total, pct: Math.round((filled / total) * 100) };
      }),
    [documentData],
  );

  const totalFields = groups.reduce((s, g) => s + g.total, 0);
  const totalFilled = groups.reduce((s, g) => s + g.filled, 0);
  const overallPct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  const sourcePolicy = templateMeta?.sourceOfTruth;

  return (
    <div className="dc-panel">
      {/* ── Blank Template Download ─────────────────────────────── */}
      <DownloadBlankButton templateKey={activeTemplate} canGeneratePdf={canGeneratePdf} />

      <section className="dc-hero" aria-label="Document control summary">
        <div className="dc-hero__card">
          <strong>{overallPct}</strong>
          <span>Completion score</span>
        </div>
        <div className="dc-hero__card">
          <strong>{criticalCount}</strong>
          <span>Critical</span>
        </div>
        <div className="dc-hero__card">
          <strong>{importantCount}</strong>
          <span>Review</span>
        </div>
      </section>

      {/* ── Overall completion ──────────────────────────────────── */}
      <section className="dc-section">
        <h4 className="dc-section__title">✅ Document Completion</h4>
        <p className="dc-section__intro">
          Track readiness at a glance before you preview, print, or push the document into the archive trail.
        </p>
        <div className="dc-overall">
          <span className="dc-overall__pct">{overallPct}%</span>
          <span className="dc-overall__count">
            {totalFilled} / {totalFields} key fields
          </span>
        </div>
        <CompletionBar pct={overallPct} />
      </section>

      {/* ── Per-section breakdown ───────────────────────────────── */}
      <section className="dc-section">
        {groups.map((g) => (
          <div key={g.section} className="dc-group">
            <div className="dc-group__row">
              <span className="dc-group__icon" aria-hidden="true">
                {g.icon}
              </span>
              <span className="dc-group__label">{g.label}</span>
              <span
                className={`dc-group__badge ${g.filled === g.total ? 'dc-group__badge--ok' : g.filled > 0 ? 'dc-group__badge--partial' : 'dc-group__badge--empty'}`}
              >
                {g.filled}/{g.total}
              </span>
            </div>
            <CompletionBar pct={g.pct} />
          </div>
        ))}
      </section>

      {/* ── Compliance warnings ─────────────────────────────────── */}
      {warnings.length > 0 && (
        <section className="dc-section dc-section--compliance">
          <h4 className="dc-section__title">
            {criticalCount > 0 ? '🔴' : '🟡'} Compliance Issues ({warnings.length})
          </h4>
          <ul className="dc-warnings" role="list">
            {warnings.map((w) => (
              <li key={w.id ?? w.message} className={`dc-warning dc-warning--${w.severity}`} role="listitem">
                <span className="dc-warning__icon" aria-hidden="true">
                  {w.severity === 'critical' ? '✕' : '!'}
                </span>
                <span className="dc-warning__text">{w.message}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {warnings.length === 0 && (
        <section className="dc-section dc-section--clear">
          <p className="dc-clear">✓ All compliance checks pass</p>
        </section>
      )}

      {/* ── Template info ───────────────────────────────────────── */}
      {sourcePolicy && (
        <section className="dc-section dc-section--meta">
          <h4 className="dc-section__title">ℹ️ Template Info</h4>
          <dl className="dc-meta">
            <dt>Version</dt>
            <dd>{sourcePolicy.templateVersion ?? '—'}</dd>
            <dt>Type</dt>
            <dd>
              {sourcePolicy.governmentIssued ? (
                <span className="dc-badge dc-badge--govt">🏛 Government Issued</span>
              ) : (
                <span className="dc-badge dc-badge--internal">🏢 Internal</span>
              )}
            </dd>
            {sourcePolicy.immutable && (
              <>
                <dt>Integrity</dt>
                <dd>
                  <span className="dc-badge dc-badge--immutable">🔒 Immutable Source</span>
                </dd>
              </>
            )}
          </dl>
        </section>
      )}
    </div>
  );
};

export default React.memo(DocumentChecklistPanel);
