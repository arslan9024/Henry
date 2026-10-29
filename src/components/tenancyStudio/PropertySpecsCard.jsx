/**
 * [Category 1: View]
 * White Caves Real Estate - Property Specifications Card (PropertySpecsCard.jsx)
 * Inputs for building, unit, type, community, plot, and DEWA (< 90 lines, zero inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage1Field } from '../../store/tenancyStudioSlice';
import { PROPERTY_TYPES, DUBAI_COMMUNITIES } from '../../config/tenancyOptionsConfig';

export const PropertySpecsCard = () => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio?.page1 || {});

  const onChange = (field, value) => {
    dispatch(updatePage1Field({ field, value }));
  };

  return (
    <div className="studio-card">
      <div className="studio-card-title">🏢 Property Specifications &amp; Location</div>
      <div className="studio-grid-3">
        <div className="studio-field-group">
          <label className="studio-field-label">Building / Project Name</label>
          <input
            type="text"
            className="studio-input"
            value={page1.building_name || ''}
            onChange={(e) => onChange('building_name', e.target.value)}
            placeholder="e.g. Marina Gate 1"
          />
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Property / Unit No</label>
          <input
            type="text"
            className="studio-input"
            value={page1.property_no || ''}
            onChange={(e) => onChange('property_no', e.target.value)}
            placeholder="e.g. 1402"
          />
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Property Type</label>
          <select
            className="studio-select"
            value={page1.property_type || 'Apartment'}
            onChange={(e) => onChange('property_type', e.target.value)}
          >
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Location / Community</label>
          <select
            className="studio-select"
            value={DUBAI_COMMUNITIES.includes(page1.location) ? page1.location : 'Other / Custom Location'}
            onChange={(e) => {
              if (e.target.value !== 'Other / Custom Location') {
                onChange('location', e.target.value);
              }
            }}
          >
            {DUBAI_COMMUNITIES.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">Plot Number</label>
          <input
            type="text"
            className="studio-input"
            value={page1.plot_no || ''}
            onChange={(e) => onChange('plot_no', e.target.value)}
            placeholder="e.g. 392-1044"
          />
        </div>

        <div className="studio-field-group">
          <label className="studio-field-label">DEWA Premise Number</label>
          <input
            type="text"
            className="studio-input"
            value={page1.dewa_premises || ''}
            onChange={(e) => onChange('dewa_premises', e.target.value)}
            placeholder="e.g. 209384729"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertySpecsCard;
