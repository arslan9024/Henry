/**
 * [Category 1: View]
 * VaultDocumentList - Scrollable list of filtered vault documents (< 55 lines).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { VaultDocumentItem } from './VaultDocumentItem';

export const VaultDocumentList = ({ documents, onPreview, onDelete }) => {
  if (documents.length === 0) {
    return (
      <div className="vault-modal__list">
        <div className="vault-modal__empty">
          No documents found in vault. Process a package or save a deal to store it here.
        </div>
      </div>
    );
  }

  return (
    <div className="vault-modal__list">
      {documents.map((doc) => (
        <VaultDocumentItem key={doc.id} doc={doc} onPreview={onPreview} onDelete={onDelete} />
      ))}
    </div>
  );
};

VaultDocumentList.propTypes = {
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  onPreview: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default VaultDocumentList;
