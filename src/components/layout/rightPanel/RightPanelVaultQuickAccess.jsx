/**
 * [Category 1: View]
 * White Caves Real Estate - Right Panel Document Vault Quick Access
 * Quick access to persistent local storage vault & saved records (< 85 lines).
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleVaultModal, setVaultDocuments } from '../../../store/documentVaultSlice';
import { listVaultDocuments } from '../../../services/vault/documentVaultService';

const EMPTY_LIST = [];

export const RightPanelVaultQuickAccess = () => {
  const dispatch = useDispatch();
  const savedDocs = useSelector((state) => state.documentVault?.documents ?? EMPTY_LIST);

  useEffect(() => {
    listVaultDocuments().then((docs) => {
      if (Array.isArray(docs)) dispatch(setVaultDocuments(docs));
    });
  }, [dispatch]);

  const docCount = savedDocs.length;

  return (
    <div className="right-panel__section-card">
      <div className="right-panel__section-header">
        <span>🗄️ Document Vault (Local Storage)</span>
        <span className="right-panel__counter-tag">{docCount} Saved</span>
      </div>

      <p className="right-panel__vault-caption">
        In-browser persistent IndexedDB storage for all White Caves contracts, receipts, KYC, and title deeds.
      </p>

      <button
        type="button"
        className="right-panel__vault-btn"
        onClick={() => dispatch(toggleVaultModal())}
        title="Open Persistent Document Vault"
      >
        <span>📂 Open Document Vault</span>
        <span className="right-panel__vault-chip">{docCount} files</span>
      </button>

      {savedDocs.length > 0 && (
        <div className="right-panel__recent-docs">
          <small className="right-panel__recent-label">Latest Saved:</small>
          <div className="right-panel__recent-item">
            <span>📄 {savedDocs[0].title || 'Tenancy Contract'}</span>
            <small>
              {savedDocs[0].savedAt ? new Date(savedDocs[0].savedAt).toLocaleDateString() : 'Ready'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(RightPanelVaultQuickAccess);
