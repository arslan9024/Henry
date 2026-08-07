import React from 'react';

const HubWorkspace = ({
  activeTemplateLabel,
  canGeneratePdf,
  badgeLabel,
  badgeTone,
  badgeTitle,
  policyVersion,
  ActiveTemplateComponent,
  railCollapsed,
  leftRailSlot,
  rightPanelSlot,
  onOpenCompliance,
}) => {
  return (
    <>
      <section className="hub-overview workflow-page__header print-hidden" data-overlay-shield>
        <div className="hub-overview__content workflow-page__header-copy">
          <p className="hub-overview__eyebrow">Henry command center</p>
          <h2 className="hub-overview__title">Operate every document journey from one premium workspace</h2>
          <p className="hub-overview__description">
            Guidance stays on the left, the live paper preview remains in the center, and execution controls
            stay anchored on the right for faster review and cleaner handoffs.
          </p>
        </div>
        <div className="hub-overview__metrics workflow-page__header-actions" aria-label="Workspace summary">
          <div className="hub-overview__metric">
            <strong>{activeTemplateLabel}</strong>
            <span>Current workflow</span>
          </div>
          <div className="hub-overview__metric">
            <strong>{canGeneratePdf ? 'PDF ready' : 'Form only'}</strong>
            <span>Export capability</span>
          </div>
          <div className="hub-overview__metric">
            <strong>{badgeLabel}</strong>
            <span>Compliance pulse</span>
          </div>
        </div>
      </section>

      <section
        className={`hub-content workflow-page__grid workflow-page__grid--three-rail ${
          railCollapsed ? 'hub-content--rail-collapsed' : ''
        }`}
        data-overlay-shield
      >
        {leftRailSlot}

        <section className="preview-area workflow-page__main" aria-live="polite">
          <div className="preview-area__hero">
            <div>
              <p className="preview-area__eyebrow">Live execution workspace</p>
              <h2 className="preview-area__title">{activeTemplateLabel}</h2>
              <p className="preview-area__description">
                Focus on the document while Henry keeps compliance visibility, export readiness, and filing
                context within immediate reach.
              </p>
            </div>
            <div className="preview-area__stats">
              <span className="preview-area__stat">Policy {policyVersion}</span>
              <span className="preview-area__stat">
                {canGeneratePdf ? 'PDF export ready' : 'Form workflow only'}
              </span>
              <button
                type="button"
                className={`preview-area__badge preview-area__badge--${badgeTone}`}
                onClick={onOpenCompliance}
                title={badgeTitle}
              >
                {badgeLabel}
              </button>
            </div>
          </div>
          <div className="preview-area__canvas">
            <p className="preview-area__label" aria-hidden="true">
              📄 Document Preview
            </p>
            {ActiveTemplateComponent ? <ActiveTemplateComponent /> : <p>No template selected.</p>}
          </div>
        </section>

        {rightPanelSlot}
      </section>
    </>
  );
};

export default React.memo(HubWorkspace);
