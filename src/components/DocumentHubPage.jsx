import React from 'react';
import { useSelector } from 'react-redux';
import { TEMPLATE_MAP } from '../templates/registry';
import ComplianceChecklistPanel from './ComplianceChecklistPanel';
import InfoArticlesPanel from './InfoArticlesPanel';

const DocumentHubPage = () => {
  const activeTemplate = useSelector((state) => state.template.activeTemplate);

  const ActiveTemplateComponent = TEMPLATE_MAP[activeTemplate]?.component;

  return (
    <main className="app-layout">
      <section className="hub-content">
        <InfoArticlesPanel />

        <section className="preview-area" aria-live="polite">
          {ActiveTemplateComponent ? <ActiveTemplateComponent /> : <p>No template selected.</p>}
        </section>

        <ComplianceChecklistPanel />
      </section>
    </main>
  );
};

export default React.memo(DocumentHubPage);
