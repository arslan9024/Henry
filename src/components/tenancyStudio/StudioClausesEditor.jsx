/**
 * [Category 1: View]
 * White Caves Real Estate - Page 3 Additional Terms & Clauses Editor
 * Clean, single-purpose component (< 45 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage3Clause } from '../../store/tenancyStudioSlice';

const CLAUSE_KEYS = ['term_line_1', 'term_line_2', 'term_line_3', 'term_line_4', 'term_line_5'];

export const StudioClausesEditor = () => {
  const dispatch = useDispatch();
  const page3 = useSelector((state) => state.tenancyStudio.page3);

  const handleClauseChange = (lineKey, value) => {
    dispatch(updatePage3Clause({ lineKey, value }));
  };

  return (
    <div className="studio-card" aria-label="Page 3 Additional Terms">
      <div className="studio-card-title">📜 Page 3 Special Conditions (5 Statutory Clauses)</div>
      <div className="clauses-editor-list">
        {CLAUSE_KEYS.map((key, idx) => (
          <div key={key} className="studio-field-group">
            <label className="studio-field-label">Special Condition #{idx + 1}</label>
            <input
              type="text"
              className="studio-input"
              value={page3[key] || ''}
              onChange={(e) => handleClauseChange(key, e.target.value)}
              placeholder={`Standard statutory clause ${idx + 1}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudioClausesEditor;
