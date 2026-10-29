/**
 * [Category 1: View]
 * VaultSearchBar - Live search input filter for Document Vault (< 35 lines).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const VaultSearchBar = ({ value, onChange }) => {
  return (
    <div className="vault-modal__search">
      <input
        type="text"
        className="studio-input"
        placeholder="🔍 Search vault by Tenant, Unit, or Title..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search stored documents"
      />
    </div>
  );
};

VaultSearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default VaultSearchBar;
