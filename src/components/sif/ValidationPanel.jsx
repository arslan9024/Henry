import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectValidationErrors, selectEmployees, selectCompanyInfo } from '../../store/payrollSlice';
import { validateSIFFile } from '../../compliance/sifValidator';

/**
 * ValidationPanel
 * Displays validation errors and warnings for current SIF file
 * Shows: Error count by type, detailed error list, error severity
 */
export default function ValidationPanel() {
  const validationErrors = useSelector(selectValidationErrors);
  const employees = useSelector(selectEmployees);
  const companyInfo = useSelector(selectCompanyInfo);

  // Re-validate on data changes
  const validation = useMemo(() => {
    return validateSIFFile(employees, companyInfo);
  }, [employees, companyInfo]);

  const errors = validation.errors.length > 0 ? validation.errors : validationErrors;
  const summary = validation.summary;

  if (errors.length === 0) {
    return (
      <section className="sif-section sif-validation-section sif-validation-section--clean">
        <div className="sif-section__header">
          <h3 className="sif-section__title">✓ Validation Status</h3>
        </div>
        <div className="sif-validation-success">
          <p>✓ All validation checks passed!</p>
          <p className="sif-hint">Ready to generate SIF and TXT files</p>
        </div>
      </section>
    );
  }

  return (
    <section className="sif-section sif-validation-section">
      <div className="sif-section__header">
        <h3 className="sif-section__title">⚠ Validation Issues</h3>
        <span className="sif-error-badge sif-error-badge--{summary.totalErrors > 5 ? 'critical' : 'warning'}">
          {summary.totalErrors} issue{summary.totalErrors !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="sif-validation-summary">
        {summary.companyErrors > 0 && (
          <div className="sif-summary-item sif-summary-item--company">
            <span className="sif-summary-icon">🏢</span>
            <span className="sif-summary-text">{summary.companyErrors} company field(s)</span>
          </div>
        )}
        {summary.employeeErrors > 0 && (
          <div className="sif-summary-item sif-summary-item--employee">
            <span className="sif-summary-icon">👥</span>
            <span className="sif-summary-text">{summary.employeeErrors} employee issue(s)</span>
          </div>
        )}
      </div>

      <ul className="sif-error-list" role="list">
        {errors.map((error, index) => (
          <li key={index} className={`sif-error-item sif-error-item--${error.type}`} role="listitem">
            <div className="sif-error-icon">
              {error.type === 'company' && '🏢'}
              {error.type === 'employee' && '👤'}
              {error.type === 'employees' && '👥'}
            </div>
            <div className="sif-error-content">
              {error.employeeName && (
                <div className="sif-error-context">
                  Employee #{error.employeeIndex + 1}: {error.employeeName}
                </div>
              )}
              <div className="sif-error-field">
                {error.field && <span className="sif-field-name">{error.field}</span>}
                <span className="sif-error-code">{error.code}</span>
              </div>
              <div className="sif-error-message">{error.message}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="sif-hint sif-hint--warning">⚠️ Fix all issues before generating SIF file</div>
    </section>
  );
}
