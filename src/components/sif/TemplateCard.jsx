import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadTemplate, deleteTemplate, duplicateTemplate } from '../../store/payrollSlice';

export default function TemplateCard({ template, onLoad }) {
  const dispatch = useDispatch();
  const [showActions, setShowActions] = useState(false);

  const handleLoad = () => {
    dispatch(loadTemplate(template.id));
    if (onLoad) onLoad();
  };

  const handleDuplicate = () => {
    dispatch(duplicateTemplate(template.id));
    setShowActions(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete template "${template.templateName}"? This action cannot be undone.`,
      )
    ) {
      dispatch(deleteTemplate(template.id));
    }
  };

  return (
    <div className="sif-template-card">
      <div className="sif-template-card__header">
        <div className="sif-template-card__title">{template.templateName}</div>
        <div className="sif-template-card__meta">
          <span className="sif-template-card__count">{template.employees?.length || 0} employees</span>
          <span className="sif-template-card__date">
            {new Date(template.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: template.createdAt ? 'numeric' : undefined,
            })}
          </span>
        </div>
      </div>

      <div className="sif-template-card__body">
        <div className="sif-template-card__info">
          <strong>{template.companyInfo?.organizationName || 'No company'}</strong>
          <p className="sif-template-card__org">Org: {template.companyInfo?.employerOrgNo || 'N/A'}</p>
          <p className="sif-template-card__total">
            Total Salary: AED{' '}
            {(template.employees?.reduce((sum, emp) => sum + (emp.salary || 0), 0) || 0).toLocaleString(
              'en-US',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )}
          </p>
        </div>
      </div>

      <div className="sif-template-card__actions">
        <button
          className="sif-btn sif-btn--primary sif-btn--sm"
          onClick={handleLoad}
          title="Load this template"
        >
          ✓ Load
        </button>

        <div className="sif-template-card__dropdown">
          <button
            className="sif-btn sif-btn--secondary sif-btn--sm"
            onClick={() => setShowActions(!showActions)}
            title="More options"
          >
            ⋯
          </button>

          {showActions && (
            <div className="sif-template-card__menu">
              <button
                className="sif-template-card__menu-item"
                onClick={handleDuplicate}
                title="Create a copy of this template"
              >
                📋 Duplicate
              </button>
              <button
                className="sif-template-card__menu-item sif-template-card__menu-item--danger"
                onClick={handleDelete}
                title="Delete this template"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
