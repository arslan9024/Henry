import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCompanyInfo, updateCompanyInfo } from '../../store/payrollSlice';

/**
 * CompanyInfoSection
 * Displays form for collecting company/employer information
 * Includes organization, bank details, and contact info
 */
export default function CompanyInfoSection() {
  const dispatch = useDispatch();
  const companyInfo = useSelector(selectCompanyInfo);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    dispatch(updateCompanyInfo({ [field]: value }));
  };

  const fields = [
    { name: 'employerOrgNo', label: 'Employer Org Number *', placeholder: '13 digits' },
    { name: 'organizationName', label: 'Organization Name *', placeholder: 'e.g., ABC Company LLC' },
    { name: 'accountHolderName', label: 'Account Holder Name *', placeholder: 'Full name' },
    { name: 'iban', label: 'IBAN (AE) *', placeholder: 'AE000000000000000000000' },
    { name: 'routingCode', label: 'Routing Code *', placeholder: '9 digits' },
    { name: 'accountNumber', label: 'Account Number *', placeholder: 'Bank account number' },
    { name: 'bankCode', label: 'Bank Code', placeholder: 'Optional' },
    { name: 'email', label: 'Email *', placeholder: 'contact@company.ae', type: 'email' },
    { name: 'phone', label: 'Phone *', placeholder: '+971 XX XXX XXXX' },
  ];

  return (
    <section className="sif-section sif-company-section">
      <div className="sif-section__header">
        <h3 className="sif-section__title">🏢 Company Information</h3>
        <button type="button" className="sif-btn sif-btn--text" onClick={() => setEditMode(!editMode)}>
          {editMode ? '✓ Done' : '✎ Edit'}
        </button>
      </div>

      <div className="sif-company-grid">
        {fields.map((field) => (
          <div key={field.name} className="sif-field">
            <label className="sif-label">{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={companyInfo[field.name] || ''}
              onChange={handleChange(field.name)}
              placeholder={field.placeholder}
              disabled={!editMode}
              className="sif-input"
            />
          </div>
        ))}
      </div>

      <div className="sif-hint">ℹ️ Fields marked with * are required for SIF file generation</div>
    </section>
  );
}
