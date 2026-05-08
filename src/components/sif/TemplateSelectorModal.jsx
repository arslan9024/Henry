import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAllTemplates } from '../../store/payrollSlice';
import TemplateCard from './TemplateCard';

export default function TemplateSelectorModal({ isOpen, onClose }) {
  const allTemplates = useSelector(selectAllTemplates);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTemplates || [];
    }

    const query = searchQuery.toLowerCase();
    return (allTemplates || []).filter(
      (template) =>
        template.templateName.toLowerCase().includes(query) ||
        template.companyInfo?.organizationName?.toLowerCase().includes(query) ||
        template.companyInfo?.employerOrgNo?.toLowerCase().includes(query),
    );
  }, [allTemplates, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="sif-template-modal-overlay" onClick={onClose}>
      <div className="sif-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sif-template-modal__header">
          <h2 className="sif-template-modal__title">Load Template</h2>
          <button className="sif-template-modal__close" onClick={onClose} title="Close" type="button">
            ✕
          </button>
        </div>

        <div className="sif-template-modal__search">
          <input
            type="text"
            className="sif-input"
            placeholder="Search templates by name, company, or org number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="sif-template-modal__content">
          {filteredTemplates.length === 0 ? (
            <div className="sif-template-modal__empty">
              <p className="sif-template-modal__empty-icon">📁</p>
              <p className="sif-template-modal__empty-text">
                {allTemplates?.length === 0
                  ? 'No templates saved yet. Create and save one to get started!'
                  : 'No templates match your search. Try a different query.'}
              </p>
            </div>
          ) : (
            <div className="sif-template-modal__grid">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} onLoad={onClose} />
              ))}
            </div>
          )}
        </div>

        <div className="sif-template-modal__footer">
          <p className="sif-template-modal__info">
            {filteredTemplates.length} of {allTemplates?.length || 0} templates
          </p>
          <button className="sif-btn sif-btn--secondary sif-btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
