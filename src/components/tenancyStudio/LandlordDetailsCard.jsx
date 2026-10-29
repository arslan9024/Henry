/**
 * [Category 1: View]
 * White Caves Real Estate - Landlord / Lessor Details Card
 * Unified Landlord / Lessor contact & EID verification (< 60 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const LandlordDetailsCard = ({ page1, onChange }) => {
  return (
    <div className="studio-card">
      <div className="studio-card-title">👤 Landlord / Lessor Details</div>
      <div className="studio-grid-2">
        <div className="studio-field-group">
          <label className="studio-field-label">Landlord Full Name</label>
          <input
            type="text"
            className="studio-input"
            value={page1.owner_name || ''}
            onChange={(e) => onChange('owner_name', e.target.value)}
            placeholder="As per Title Deed"
          />
        </div>
        <div className="studio-field-group">
          <label className="studio-field-label">Lessor / Representative Name</label>
          <input
            type="text"
            className="studio-input"
            value={page1.lessor_name || ''}
            onChange={(e) => onChange('lessor_name', e.target.value)}
            placeholder="POA or Agency Representative"
          />
        </div>
        <div className="studio-field-group">
          <label className="studio-field-label">Landlord Emirates ID / Trade License</label>
          <input
            type="text"
            className="studio-input"
            value={page1.lessor_id || ''}
            onChange={(e) => onChange('lessor_id', e.target.value)}
            placeholder="784-XXXX-XXXXXXX-X"
          />
        </div>
        <div className="studio-field-group">
          <label className="studio-field-label">Landlord Phone Number</label>
          <input
            type="text"
            className="studio-input"
            value={page1.lessor_phone || ''}
            onChange={(e) => onChange('lessor_phone', e.target.value)}
            placeholder="+971 50 XXX XXXX"
          />
        </div>
      </div>
    </div>
  );
};

LandlordDetailsCard.propTypes = {
  page1: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LandlordDetailsCard;
