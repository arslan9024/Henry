import React from 'react';
import { TEMPLATE_CONFIG } from '../templates/registry';
import { useActiveTemplate } from '../hooks/useActiveTemplate';
import { FormField, Select } from './ui';

const DocumentSelector = () => {
  const { activeTemplate, onChangeTemplate } = useActiveTemplate();

  return (
    <div className="doc-selector-wrap">
      <FormField label="Select document for preview / print">
        <Select
          value={activeTemplate}
          onChange={(e) => onChangeTemplate(e.target.value)}
          options={TEMPLATE_CONFIG.map((template) => ({
            value: template.key,
            label: template.label,
          }))}
        />
      </FormField>
    </div>
  );
};

export default React.memo(DocumentSelector);
