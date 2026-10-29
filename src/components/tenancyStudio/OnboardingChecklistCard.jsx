/**
 * [Category 1: View]
 * White Caves Real Estate - Move-In & Verification Onboarding Checklist Card
 * Interactive pre-handover verification checklist (< 50 lines, 0 inline CSS).
 */

import React, { useState } from 'react';
import { HANDOVER_CHECKLIST_ITEMS } from '../../config/tenancyOptionsConfig';

export const OnboardingChecklistCard = () => {
  const [items, setItems] = useState(HANDOVER_CHECKLIST_ITEMS);

  const toggleCheck = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  return (
    <div className="studio-card">
      <div className="studio-card-title">🛡️ Move-In Handover Checklist &amp; Compliance</div>
      <div className="onboarding-checklist-list">
        {items.map((it) => (
          <label key={it.id} className="footer-checkbox-label onboarding-label">
            <input type="checkbox" checked={it.checked} onChange={() => toggleCheck(it.id)} />
            <span className={it.checked ? 'onboarding-text--checked' : 'onboarding-text--pending'}>
              {it.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default OnboardingChecklistCard;
