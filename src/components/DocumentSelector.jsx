import React from 'react';
import { TEMPLATE_CONFIG } from '../templates/registry';
import { useActiveTemplate } from '../hooks/useActiveTemplate';

const DocumentSelector = () => {
  const { activeTemplate, onChangeTemplate } = useActiveTemplate();

  return (
    <div className="doc-selector-wrap">
      <label htmlFor="document-selector" className="doc-selector-label">
        Select document for preview / print
      </label>
      <select
        id="document-selector"
        className="doc-selector"
        value={activeTemplate}
        onChange={(e) => onChangeTemplate(e.target.value)}
        aria-label="Select document template"
      >
        {TEMPLATE_CONFIG.map((template) => (
          <option key={template.key} value={template.key}>
            {template.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(DocumentSelector);
