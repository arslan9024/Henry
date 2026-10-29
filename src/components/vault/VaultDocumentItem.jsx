/**
 * [Category 1: View]
 * VaultDocumentItem - Row display for a single archived document in Vault (< 50 lines).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const VaultDocumentItem = ({ doc, onPreview, onDelete }) => {
  return (
    <div
      className="vault-modal__item"
      onClick={() => onPreview(doc)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onPreview(doc)}
    >
      <div>
        <div className="vault-modal__item-title">{doc.title}</div>
        <div className="vault-modal__item-subtitle">
          {doc.propertyNo ? `Unit ${doc.propertyNo}` : ''} {doc.buildingName ? `· ${doc.buildingName}` : ''}{' '}
          {doc.tenantName ? `· Tenant: ${doc.tenantName}` : ''}
        </div>
      </div>

      <div className="vault-modal__item-actions">
        <span className="vault-modal__view-tag">👁️ View</span>
        <button
          type="button"
          className="vault-modal__delete-btn"
          onClick={(e) => onDelete(e, doc.id)}
          title="Delete document"
          aria-label={`Delete ${doc.title}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

VaultDocumentItem.propTypes = {
  doc: PropTypes.object.isRequired,
  onPreview: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default VaultDocumentItem;
