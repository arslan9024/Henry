import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateEmployee, removeEmployee } from '../../store/payrollSlice';

/**
 * EmployeeRow
 * Displays single employee record with inline edit capability
 * Shows: Emirates ID, Name, Account, Salary, Allowance, Total, Actions
 */
export default function EmployeeRow({ employee, index }) {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    emiratesId: employee.emiratesId || '',
    fullName: employee.fullName || '',
    accountNumber: employee.accountNumber || '',
    salary: employee.salary || '',
    allowance: employee.allowance || '',
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = () => {
    dispatch(
      updateEmployee({
        employeeId: employee.id,
        data: formData,
      }),
    );
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      emiratesId: employee.emiratesId || '',
      fullName: employee.fullName || '',
      accountNumber: employee.accountNumber || '',
      salary: employee.salary || '',
      allowance: employee.allowance || '',
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    if (confirm(`Delete employee "${employee.fullName}"?`)) {
      dispatch(removeEmployee(employee.id));
    }
  };

  const total = (parseFloat(formData.salary) || 0) + (parseFloat(formData.allowance) || 0);

  if (editMode) {
    return (
      <div className="sif-employee-row sif-employee-row--edit">
        <div className="sif-employee-field">
          <input
            type="text"
            placeholder="Emirates ID (15 digits)"
            value={formData.emiratesId}
            onChange={handleChange('emiratesId')}
            className="sif-input sif-input--compact"
          />
        </div>
        <div className="sif-employee-field">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            className="sif-input sif-input--compact"
          />
        </div>
        <div className="sif-employee-field">
          <input
            type="text"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={handleChange('accountNumber')}
            className="sif-input sif-input--compact"
          />
        </div>
        <div className="sif-employee-field">
          <input
            type="number"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange('salary')}
            className="sif-input sif-input--compact"
            step="0.01"
          />
        </div>
        <div className="sif-employee-field">
          <input
            type="number"
            placeholder="Allowance"
            value={formData.allowance}
            onChange={handleChange('allowance')}
            className="sif-input sif-input--compact"
            step="0.01"
          />
        </div>
        <div className="sif-employee-total">AED {total.toFixed(2)}</div>
        <div className="sif-employee-actions">
          <button
            type="button"
            className="sif-btn sif-btn--sm sif-btn--success"
            onClick={handleSave}
            title="Save employee"
          >
            ✓
          </button>
          <button
            type="button"
            className="sif-btn sif-btn--sm sif-btn--secondary"
            onClick={handleCancel}
            title="Cancel"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sif-employee-row">
      <div className="sif-employee-cell sif-employee-cell--number">{index + 1}</div>
      <div className="sif-employee-cell">{employee.emiratesId}</div>
      <div className="sif-employee-cell">{employee.fullName}</div>
      <div className="sif-employee-cell">{employee.accountNumber}</div>
      <div className="sif-employee-cell sif-employee-cell--amount">
        AED {(parseFloat(employee.salary) || 0).toFixed(2)}
      </div>
      {employee.allowance && (
        <div className="sif-employee-cell sif-employee-cell--amount">
          AED {(parseFloat(employee.allowance) || 0).toFixed(2)}
        </div>
      )}
      <div className="sif-employee-cell sif-employee-cell--total">
        AED {((parseFloat(employee.salary) || 0) + (parseFloat(employee.allowance) || 0)).toFixed(2)}
      </div>
      <div className="sif-employee-actions">
        <button
          type="button"
          className="sif-btn sif-btn--sm sif-btn--secondary"
          onClick={() => setEditMode(true)}
          title="Edit employee"
        >
          ✎
        </button>
        <button
          type="button"
          className="sif-btn sif-btn--sm sif-btn--danger"
          onClick={handleDelete}
          title="Delete employee"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
