import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveOcrDraft, clearOcrDraft, setOcrDraft, setOcrProcessing } from '../store/ocrSlice';
import { updateDocumentSection } from '../store/documentSlice';
import { addAuditLog } from '../store/auditSlice';
import { parseEmiratesIdText } from '../ocr/parseEmiratesIdText';

const IdentityScanner = () => {
  const dispatch = useDispatch();
  const { draft, processing } = useSelector((state) => state.ocr);
  const [target, setTarget] = useState('tenant');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const canApprove = useMemo(
    () => Boolean(draft?.fullName || draft?.emiratesId || draft?.expiryDate),
    [draft],
  );

  const handleScan = async () => {
    if (!file) {
      setError('Please upload a PNG or JPG image first.');
      return;
    }

    try {
      setError('');
      dispatch(setOcrProcessing(true));
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const result = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseEmiratesIdText(result.data.text);
      dispatch(
        setOcrDraft({
          ...parsed,
          target,
          fileName: file.name,
          scannedAt: new Date().toISOString(),
        }),
      );
      dispatch(
        addAuditLog({
          type: 'OCR_SCANNED',
          target,
          fileName: file.name,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (scanError) {
      console.error(scanError);
      setError('OCR scan failed. Please retry with a clearer ID image.');
      dispatch(clearOcrDraft());
    } finally {
      dispatch(setOcrProcessing(false));
    }
  };

  const handleApprove = () => {
    if (!draft) return;

    if (draft.target === 'tenant') {
      dispatch(
        updateDocumentSection({
          section: 'tenant',
          values: {
            fullName: draft.fullName,
            emiratesId: draft.emiratesId,
            idExpiryDate: draft.expiryDate,
          },
        }),
      );
    } else {
      dispatch(
        updateDocumentSection({
          section: 'landlord',
          values: {
            emiratesId: draft.emiratesId,
            idExpiryDate: draft.expiryDate,
          },
        }),
      );
    }

    dispatch(
      approveOcrDraft({
        ...draft,
        approvedAt: new Date().toISOString(),
      }),
    );
  };

  return (
    <section className="assistant-card" aria-label="Identity scanner">
      <div className="assistant-card__header">
        <h4>Identity Scanner</h4>
        <p>Upload Emirates ID, review OCR output, then approve to map fields.</p>
      </div>

      <div className="assistant-card__body">
        <label className="editor-field">
          <span>Map to</span>
          <select className="editor-input" value={target} onChange={(event) => setTarget(event.target.value)}>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </label>

        <label className="editor-field">
          <span>Emirates ID Image</span>
          <input
            className="editor-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>

        <button className="utility-btn" type="button" onClick={handleScan} disabled={processing}>
          {processing ? 'Scanning…' : 'Scan ID'}
        </button>

        {error ? <p className="assistant-error">{error}</p> : null}

        {draft ? (
          <div className="review-card">
            <p className="review-card__title">Review & Approve</p>
            <p>
              <strong>Target:</strong> {draft.target}
            </p>
            <p>
              <strong>Full Name:</strong> {draft.fullName || 'Not confidently detected'}
            </p>
            <p>
              <strong>ID Number:</strong> {draft.emiratesId || 'Not confidently detected'}
            </p>
            <p>
              <strong>Expiry Date:</strong> {draft.expiryDate || 'Not confidently detected'}
            </p>
            <p className="muted">
              Confidence — Name: {draft.confidence?.fullName}, ID: {draft.confidence?.emiratesId}, Expiry:{' '}
              {draft.confidence?.expiryDate}
            </p>
            <div className="action-button-row action-button-row--start">
              <button className="utility-btn" type="button" onClick={handleApprove} disabled={!canApprove}>
                Approve Mapping
              </button>
              <button
                className="utility-btn secondary"
                type="button"
                onClick={() => dispatch(clearOcrDraft())}
              >
                Clear Draft
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default React.memo(IdentityScanner);
