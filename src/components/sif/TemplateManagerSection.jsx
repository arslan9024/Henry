import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllTemplates } from '../../store/payrollSlice';
import SaveTemplateForm from './SaveTemplateForm';
import TemplateSelectorModal from './TemplateSelectorModal';

export default function TemplateManagerSection() {
  const allTemplates = useSelector(selectAllTemplates);
  const [modalOpen, setModalOpen] = useState(false);

  const templateCount = allTemplates?.length || 0;

  return (
    <>
      <div className="sif-template-manager">
        <div className="sif-template-manager__actions">
          <SaveTemplateForm />

          {templateCount > 0 && (
            <button
              className="sif-btn sif-btn--secondary sif-btn--sm"
              onClick={() => setModalOpen(true)}
              type="button"
            >
              📂 Load Template ({templateCount})
            </button>
          )}
        </div>

        {templateCount === 0 && (
          <p className="sif-template-manager__hint">
            💡 Save your first template to quickly reload payroll configurations.
          </p>
        )}

        {templateCount > 0 && (
          <p className="sif-template-manager__hint">
            {templateCount} template{templateCount !== 1 ? 's' : ''} saved and ready to load
          </p>
        )}
      </div>

      <TemplateSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
