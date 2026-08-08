import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveTemplate, setErrorMessage, setSuccessMessage } from '../../store/payrollSlice';
import { selectCurrentFile } from '../../store/payrollSlice';

export default function SaveTemplateForm() {
  const dispatch = useDispatch();
  const currentFile = useSelector(selectCurrentFile);
  const [templateName, setTemplateName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveTemplate = async (e) => {
    e.preventDefault();

    if (!templateName.trim()) {
      dispatch(setErrorMessage('Template name cannot be empty'));
      return;
    }

    if (templateName.trim().length > 50) {
      dispatch(setErrorMessage('Template name must be 50 characters or less'));
      return;
    }

    if (!currentFile.employees || currentFile.employees.length === 0) {
      dispatch(setErrorMessage('Cannot save template: no employees added'));
      return;
    }

    if (!currentFile.companyInfo?.employerOrgNo || !currentFile.companyInfo?.iban) {
      dispatch(setErrorMessage('Cannot save template: incomplete company information'));
      return;
    }

    setIsSaving(true);

    try {
      dispatch(
        saveTemplate({
          templateName: templateName.trim(),
          companyInfo: currentFile.companyInfo,
          employees: currentFile.employees,
        }),
      );

      dispatch(
        setSuccessMessage(`Template "${templateName.trim()}" saved successfully! You can reload it anytime.`),
      );

      setTemplateName('');
      setIsExpanded(false);

      setTimeout(() => dispatch(setSuccessMessage('')), 4000);
    } catch (error) {
      dispatch(setErrorMessage(`Failed to save template: ${error.message}`));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sif-save-template">
      <button
        className="sif-btn sif-btn--secondary sif-btn--sm"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        💾 Save as Template
      </button>

      {isExpanded && (
        <form className="sif-save-template__form" onSubmit={handleSaveTemplate}>
          <div className="sif-field">
            <label className="sif-label" htmlFor="template-name">
              Template Name *
            </label>
            <input
              id="template-name"
              type="text"
              className="sif-input"
              placeholder="e.g., Monthly Payroll - Q2 2026"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={isSaving}
              maxLength={50}
            />
            <p className="sif-hint">{templateName.length}/50 characters</p>
          </div>

          <div className="sif-save-template__actions">
            <button
              type="submit"
              className="sif-btn sif-btn--primary sif-btn--sm"
              disabled={isSaving || !templateName.trim()}
            >
              {isSaving ? '⏳ Saving...' : '✓ Save Template'}
            </button>
            <button
              type="button"
              className="sif-btn sif-btn--text sif-btn--sm"
              onClick={() => {
                setIsExpanded(false);
                setTemplateName('');
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
