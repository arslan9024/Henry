import React, { useState } from 'react';
import Spinner from './ui/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { addAuditLog } from '../store/auditSlice';
import { addArchiveEntry } from '../store/archiveSlice';
import { pushToast } from '../store/uiSlice';
import { selectActiveTemplateLabel, selectCanGeneratePdf, selectDocument } from '../store/selectors';
import { selectIsPreviewReady, selectPreviewState } from '../store/uiSlice';
import { useActiveTemplate } from '../hooks/useActiveTemplate';
import { buildLogicalRecordPath } from '../records/pathBuilder';
import { persistRecordFile } from '../records/archiveService';
import { getTemplateSourcePolicy } from '../templates/registry';

const PrintButton = () => {
  const dispatch = useDispatch();
  const { activeTemplate } = useActiveTemplate();
  const version = useSelector((state) => state.policyMeta.version);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const canGeneratePdf = useSelector(selectCanGeneratePdf);
  const documentData = useSelector(selectDocument);
  const isPreviewReady = useSelector(selectIsPreviewReady);
  const previewState = useSelector(selectPreviewState);
  const archiveEntries = useSelector((state) => state.archive.entries || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Draft-first workflow: snapshot the current document state to the archive
  // without triggering a PDF download.  Operators use this to preserve an
  // in-progress record before finalising.
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const createdAt = new Date().toISOString();
      const draftId = `draft-${activeTemplate}-${createdAt}`;
      dispatch(
        addArchiveEntry({
          id: draftId,
          createdAt,
          templateKey: activeTemplate,
          templateLabel: `${activeTemplateLabel} (Draft)`,
          fileName: `DRAFT_${activeTemplate}_${createdAt}.json`,
          recordPath: null,
          persistedPath: null,
          unit: documentData.property.unit,
          community: documentData.property.community,
          tenantName: documentData.tenant.fullName || 'Pending Review',
          documentSnapshot: documentData,
          isDraft: true,
        }),
      );
      dispatch(
        addAuditLog({
          type: 'DRAFT_SAVED',
          template: activeTemplate,
          policyVersion: version,
          timestamp: createdAt,
          draftId,
        }),
      );
      dispatch(
        pushToast({
          tone: 'success',
          title: 'Draft saved',
          body: `${activeTemplateLabel} draft recorded in archive.`,
          durationMs: 4000,
        }),
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePrint = () => {
    dispatch(
      addAuditLog({
        type: 'PRINT',
        template: activeTemplate,
        policyVersion: version,
        timestamp: new Date().toISOString(),
      }),
    );
    window.print();
  };

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      const createdAt = new Date().toISOString();
      const sourcePolicy = getTemplateSourcePolicy(activeTemplate);
      const copyNumber =
        archiveEntries.filter((entry) => entry.templateKey === activeTemplate && !entry.isDraft).length + 1;
      const { downloadQuotationPdf } = await import('../pdf/generateQuotationPdf');
      const { fileName, blob } = await downloadQuotationPdf({
        documentData,
        templateKey: activeTemplate,
        createdAt,
        copyNumber,
      });

      const recordPath = buildLogicalRecordPath({
        createdAt,
        property: documentData.property,
      });

      // Best-effort filesystem persistence to /records/{YEAR}/{MONTH}/{PROPERTY}/
      const persistResult = await persistRecordFile({ recordPath, fileName, blob });

      dispatch(
        addAuditLog({
          type: 'PDF_GENERATED',
          template: activeTemplate,
          policyVersion: version,
          timestamp: createdAt,
          fileName,
          persisted: persistResult.ok ? persistResult.path : false,
          copyNumber,
          sourceTemplateImmutable: sourcePolicy.immutable,
          sourceTemplateVersion: sourcePolicy.templateVersion,
          generationMode: 'copy-from-source-template',
        }),
      );

      dispatch(
        addArchiveEntry({
          id: `${activeTemplate}-${createdAt}`,
          createdAt,
          templateKey: activeTemplate,
          templateLabel: activeTemplateLabel,
          fileName,
          recordPath,
          persistedPath: persistResult.ok ? persistResult.path : null,
          unit: documentData.property.unit,
          community: documentData.property.community,
          tenantName: documentData.tenant.fullName || 'Pending Review',
          documentSnapshot: documentData,
          copyNumber,
          generationMode: 'copy-from-source-template',
          sourceTemplate: {
            key: activeTemplate,
            immutable: sourcePolicy.immutable,
            governmentIssued: sourcePolicy.governmentIssued,
            templateVersion: sourcePolicy.templateVersion,
          },
        }),
      );

      // T-14 contract: notify the user the PDF landed (and whether it was archived to disk).
      if (persistResult.ok) {
        dispatch(
          pushToast({
            tone: 'success',
            title: 'PDF generated',
            body: `${fileName} (copy #${copyNumber}) saved to ${persistResult.path}`,
            durationMs: 6000,
          }),
        );
      } else {
        dispatch(
          pushToast({
            tone: 'warning',
            title: 'PDF generated (not archived)',
            body: `${fileName} (copy #${copyNumber}) downloaded — filesystem write skipped.`,
            durationMs: 7000,
          }),
        );
      }
    } catch (err) {
      dispatch(
        pushToast({
          tone: 'error',
          title: 'PDF generation failed',
          body: err?.message || 'An unexpected error occurred. Please try again.',
          durationMs: 8000,
        }),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="print-target-wrap">
      <p className="print-target-label">Ready to print: {activeTemplateLabel}</p>
      <div className="action-button-row">
        {/* Draft-first: save a snapshot before exporting */}
        <button
          className="print-btn secondary"
          onClick={handleSaveDraft}
          aria-label="Save a draft snapshot to the archive"
          disabled={isSavingDraft}
        >
          {isSavingDraft ? (
            <>
              <Spinner size="sm" tone="white" label="Saving draft…" /> Saving…
            </>
          ) : (
            '💾 Save Draft'
          )}
        </button>
        {canGeneratePdf ? (
          <>
            {/* Stale-preview hint — visible only while re-rendering after an edit */}
            {previewState.status === 'rendering' && (
              <p className="print-preview-stale-hint" role="status">
                ⏳ Preview updating… export will unlock when ready.
              </p>
            )}
            <button
              className="print-btn"
              onClick={handleGeneratePdf}
              aria-label="Generate high-quality quotation PDF"
              disabled={isGenerating || !isPreviewReady}
              title={
                !isPreviewReady ? 'Wait for the preview to finish rendering before exporting.' : undefined
              }
            >
              {isGenerating ? (
                <>
                  <Spinner size="sm" tone="white" label="Generating PDF…" /> Generating…
                </>
              ) : (
                'Generate PDF'
              )}
            </button>
          </>
        ) : null}
        <button
          className="print-btn secondary"
          onClick={handlePrint}
          aria-label="Print selected document to PDF"
        >
          Legacy Print
        </button>
      </div>
    </div>
  );
};

export default React.memo(PrintButton);
