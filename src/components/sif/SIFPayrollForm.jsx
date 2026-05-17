import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectEmployees,
  selectCompanyInfo,
  selectValidationErrors,
  addEmployee,
  setValidationErrors,
  addToHistory,
  setGeneratingFile,
  setSuccessMessage,
  setErrorMessage,
} from '../../store/payrollSlice';
import { validateSIFFile } from '../../compliance/sifValidator';
import { generateAndDownloadSIFFile } from '../../pdf/generateSIFFile';
import CompanyInfoSection from './CompanyInfoSection';
import EmployeeRow from './EmployeeRow';
import ValidationPanel from './ValidationPanel';
import HistoryPanel from './HistoryPanel';
import TemplateManagerSection from './TemplateManagerSection';

/**
 * SIFPayrollForm
 * Main container for WPS SIF file generation
 * Orchestrates: company info, employees, validation, file generation
 */
export default function SIFPayrollForm() {
  const dispatch = useDispatch();
  const employees = useSelector(selectEmployees);
  const companyInfo = useSelector(selectCompanyInfo);
  const validationErrors = useSelector(selectValidationErrors);

  const [downloadFormat, setDownloadFormat] = useState('sif'); // 'sif' | 'both'
  const [isGenerating, setIsGenerating] = useState(false);

  // Add new employee form
  const [newEmployee, setNewEmployee] = useState({
    emiratesId: '',
    fullName: '',
    accountNumber: '',
    salary: '',
    allowance: '',
  });

  const handleAddEmployee = () => {
    if (
      !newEmployee.emiratesId ||
      !newEmployee.fullName ||
      !newEmployee.accountNumber ||
      !newEmployee.salary
    ) {
      dispatch(setErrorMessage('Please fill required employee fields'));
      return;
    }

    dispatch(addEmployee(newEmployee));
    setNewEmployee({
      emiratesId: '',
      fullName: '',
      accountNumber: '',
      salary: '',
      allowance: '',
    });
    dispatch(setSuccessMessage('Employee added'));
  };

  const handleGenerateSIF = async () => {
    // Validate
    const validation = validateSIFFile(employees, companyInfo);

    if (!validation.isValid) {
      dispatch(setValidationErrors(validation.errors));
      dispatch(setErrorMessage(`${validation.summary.totalErrors} validation issue(s) found`));
      return;
    }

    // Generate files
    setIsGenerating(true);
    dispatch(setGeneratingFile(true));

    try {
      const options = {
        downloadSif: true,
        downloadTxt: downloadFormat === 'both',
      };

      const result = await generateAndDownloadSIFFile(employees, companyInfo, options);

      if (result.success) {
        // Add to history
        dispatch(
          addToHistory({
            sifFilename: result.sifFilename,
            employeeCount: employees.length,
            totalSalary: employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0),
          }),
        );

        dispatch(setSuccessMessage(`✓ SIF file generated: ${result.sifFilename}`));
      } else {
        dispatch(setErrorMessage(`Failed to generate file: ${result.error}`));
      }
    } catch (error) {
      console.error('SIF generation error:', error);
      dispatch(setErrorMessage(`Error: ${error.message}`));
    } finally {
      setIsGenerating(false);
      dispatch(setGeneratingFile(false));
    }
  };

  const hasValidationErrors = validationErrors.length > 0;
  const totalSalary = employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);

  return (
    <div className="sif-payroll-form">
      {/* Company Info */}
      <CompanyInfoSection />

      {/* Template Management */}
      <TemplateManagerSection />

      {/* Employees */}
      <section className="sif-section sif-employees-section">
        <div className="sif-section__header">
          <h3 className="sif-section__title">👥 Employees ({employees.length})</h3>
        </div>

        {employees.length > 0 && (
          <div className="sif-employee-list">
            <div className="sif-employee-header">
              <div className="sif-employee-cell sif-employee-cell--number">#</div>
              <div className="sif-employee-cell">Emirates ID</div>
              <div className="sif-employee-cell">Full Name</div>
              <div className="sif-employee-cell">Account Number</div>
              <div className="sif-employee-cell sif-employee-cell--amount">Salary</div>
              <div className="sif-employee-cell sif-employee-cell--amount">Allowance</div>
              <div className="sif-employee-cell sif-employee-cell--total">Total</div>
              <div className="sif-employee-cell">Actions</div>
            </div>

            {employees.map((employee, index) => (
              <EmployeeRow key={employee.id} employee={employee} index={index} />
            ))}
          </div>
        )}

        {/* Add Employee Form */}
        <div className="sif-add-employee">
          <h4 className="sif-add-employee__title">➕ Add New Employee</h4>
          <div className="sif-add-employee-grid">
            <input
              type="text"
              placeholder="Emirates ID (15 digits)*"
              value={newEmployee.emiratesId}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, emiratesId: e.target.value }))}
              className="sif-input"
            />
            <input
              type="text"
              placeholder="Full Name*"
              value={newEmployee.fullName}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, fullName: e.target.value }))}
              className="sif-input"
            />
            <input
              type="text"
              placeholder="Account Number*"
              value={newEmployee.accountNumber}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, accountNumber: e.target.value }))}
              className="sif-input"
            />
            <input
              type="number"
              placeholder="Salary (AED)*"
              value={newEmployee.salary}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, salary: e.target.value }))}
              className="sif-input"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Allowance (AED)"
              value={newEmployee.allowance}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, allowance: e.target.value }))}
              className="sif-input"
              step="0.01"
            />
            <button type="button" className="sif-btn sif-btn--primary" onClick={handleAddEmployee}>
              ➕ Add Employee
            </button>
          </div>
        </div>
      </section>

      {/* Validation */}
      <ValidationPanel />

      {/* History */}
      <HistoryPanel />

      {/* Generation Controls */}
      <section className="sif-section sif-generation-section">
        <div className="sif-section__header">
          <h3 className="sif-section__title">📥 Generate Files</h3>
        </div>

        <div className="sif-summary">
          <div className="sif-summary-item">
            <span>Total Employees:</span>
            <strong>{employees.length}</strong>
          </div>
          <div className="sif-summary-item">
            <span>Total Salary:</span>
            <strong>AED {totalSalary.toFixed(2)}</strong>
          </div>
          <div className="sif-summary-item">
            <span>Status:</span>
            <strong className={hasValidationErrors ? 'sif-status--error' : 'sif-status--ok'}>
              {hasValidationErrors ? '⚠ Issues Found' : '✓ Ready'}
            </strong>
          </div>
        </div>

        <div className="sif-generation-options">
          <div className="sif-radio-group">
            <label className="sif-radio">
              <input
                type="radio"
                name="format"
                value="sif"
                checked={downloadFormat === 'sif'}
                onChange={(e) => setDownloadFormat(e.target.value)}
              />
              <span>Download SIF only</span>
            </label>
            <label className="sif-radio">
              <input
                type="radio"
                name="format"
                value="both"
                checked={downloadFormat === 'both'}
                onChange={(e) => setDownloadFormat(e.target.value)}
              />
              <span>Download SIF + Verification (TXT)</span>
            </label>
          </div>
        </div>

        <div className="sif-generation-actions">
          <button
            type="button"
            className="sif-btn sif-btn--primary sif-btn--lg"
            onClick={handleGenerateSIF}
            disabled={isGenerating || employees.length === 0 || hasValidationErrors}
          >
            {isGenerating ? '⏳ Generating...' : '📥 Generate & Download'}
          </button>
        </div>

        <div className="sif-hint">ℹ️ SIF file will be downloaded automatically after generation</div>
      </section>
    </div>
  );
}
