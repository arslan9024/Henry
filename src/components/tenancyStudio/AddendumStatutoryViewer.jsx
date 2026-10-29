/**
 * [Category 1: View]
 * White Caves Real Estate - RERA Addendum Statutory Clauses Viewer
 * Interactive section tabs displaying the 25 official statutory clauses (< 60 lines, 0 inline CSS).
 */

import React, { useState } from 'react';
import { ADDENDUM_CONTENT_CONFIG } from '../../config/tenancyStudio/addendumConfig';

export const AddendumStatutoryViewer = () => {
  const [activeTab, setActiveTab] = useState(0);
  const sections = ADDENDUM_CONTENT_CONFIG.sections || [];

  return (
    <div className="studio-card">
      <div className="studio-card-title">📜 25 Standard Statutory RERA Clauses (Pages 4–6)</div>
      <div className="studio-tabs-row">
        {sections.map((sec, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`studio-tab-btn ${activeTab === idx ? 'studio-tab-btn--active' : ''}`}
          >
            Section {idx + 1}: {sec.title.substring(0, 16)}...
          </button>
        ))}
      </div>

      {sections[activeTab] && (
        <div className="studio-clause-card">
          <h4 className="studio-clause-card__title">{sections[activeTab].title}</h4>
          <div className="studio-clause-card__list">
            {sections[activeTab].clauses.map((c, i) => (
              <div key={i} className="studio-clause-row">
                <span className="studio-clause-num">{c.number}.</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddendumStatutoryViewer;
