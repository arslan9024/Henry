/**
 * [Category 1: View]
 * White Caves Real Estate - Document Vault & Archive Explorer Modal
 * Search, filter, and inspect stored contracts, receipts & KYC scans (< 90 lines, 0 inline CSS).
 */

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setVaultDocuments,
  setVaultSearchQuery,
  setActivePreviewDoc,
  toggleVaultModal,
  removeVaultDocument,
} from '../../store/documentVaultSlice';
import { listVaultDocuments, deleteVaultDocument } from '../../services/vault/documentVaultService';
import { useModalA11y } from '../../hooks/useModalA11y';
import { VaultSearchBar } from './VaultSearchBar';
import { VaultDocumentList } from './VaultDocumentList';

const EMPTY_DOCS = [];

export const DocumentVaultModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.documentVault?.isVaultModalOpen);
  const documents = useSelector((state) => state.documentVault?.documents ?? EMPTY_DOCS);
  const searchQuery = useSelector((state) => state.documentVault?.searchQuery || '');

  const handleClose = useCallback(() => {
    dispatch(toggleVaultModal(false));
  }, [dispatch]);

  const trapRef = useModalA11y(isOpen, handleClose);

  useEffect(() => {
    if (isOpen) {
      listVaultDocuments().then((docs) => dispatch(setVaultDocuments(docs)));
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const filtered = documents.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.title && d.title.toLowerCase().includes(q)) ||
      (d.tenantName && d.tenantName.toLowerCase().includes(q)) ||
      (d.propertyNo && d.propertyNo.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this saved document from your vault?')) {
      await deleteVaultDocument(id);
      dispatch(removeVaultDocument(id));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="White Caves Document Vault"
      className="vault-modal__backdrop"
      onClick={handleClose}
    >
      <div ref={trapRef} className="vault-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="vault-modal__header">
          <div>
            <h3 className="vault-modal__title">🗄️ White Caves Document Vault</h3>
            <p className="vault-modal__subtitle">
              Offline persistent storage for contracts, receipts, and client KYC documents.
            </p>
          </div>
          <button
            type="button"
            className="vault-modal__close-btn"
            onClick={handleClose}
            aria-label="Close vault"
          >
            ✕
          </button>
        </div>

        <VaultSearchBar value={searchQuery} onChange={(val) => dispatch(setVaultSearchQuery(val))} />

        <VaultDocumentList
          documents={filtered}
          onPreview={(doc) => dispatch(setActivePreviewDoc(doc))}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default DocumentVaultModal;
