/**
 * [Category 1: View]
 * White Caves Real Estate - Tenant Details Card
 * Unified Tenant contact & EID verification (< 60 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const TenantDetailsCard = ({ page1, onChange }) => {
  return (
    <div className="studio-card">
      <div className="studio-card-title">👥 Tenant Details</div>
      <div className="studio-grid-2">
        <div className="studio-field-group">
          <label className="studio-field-label">Tenant Full Legal Name</label>
          <input
            type="text"
            className="studio-input"
            value={page1.tenant_name || ''}
            onChange={(e) => onChange('tenant_name', e.target.value)}
            placeholder="As per Passport / Emirates ID"
          />
        </div>
        <div className="studio-field-group">
          <label className="studio-field-label">Tenant Emirates ID Number</label>
          <input
            type="text"
            className="studio-input"
            value={page1.tenant_eid || ''}
            onChange={(e) => onChange('tenant_eid', e.target.value)}
            placeholder="784-XXXX-XXXXXXX-X"
          />
        </div>
        <div className="studio-field-group">
          <label className="studio-field-label">Tenant Email Address</label>
          <input
            type="email"
            className="studio-input"
            value={page1.tenant_email || ''}
            onChange={(e) => onChange('tenant_email', e.target.value)}
            placeholder="tenant@domain.com"
          />
        </div>
        <div className="studio-field-group">
          <label className="studio-field-label">Tenant Mobile Phone</label>
          <input
            type="text"
            className="studio-input"
            value={page1.tenant_phone || ''}
            onChange={(e) => onChange('tenant_phone', e.target.value)}
            placeholder="+971 5X XXX XXXX"
          />
        </div>
      </div>
    </div>
  );
};

TenantDetailsCard.propTypes = {
  page1: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TenantDetailsCard;
