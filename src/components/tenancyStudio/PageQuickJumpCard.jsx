/**
 * [Category 1: View]
 * PageQuickJumpCard - Page navigation buttons to center viewport (< 45 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { STUDIO_PREVIEW_PAGES } from '../../config/tenancyOptionsConfig';

export const PageQuickJumpCard = ({ onJump }) => {
  return (
    <div className="studio-card">
      <div className="studio-card-title">📜 Quick-Jump to Page in Center Viewport</div>
      <div className="quickjump-btn-row">
        {STUDIO_PREVIEW_PAGES.map((p) => (
          <button key={p.num} type="button" onClick={() => onJump(p.num)} className="quickjump-btn">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

PageQuickJumpCard.propTypes = {
  onJump: PropTypes.func.isRequired,
};

export default PageQuickJumpCard;
