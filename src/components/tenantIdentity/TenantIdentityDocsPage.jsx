import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APP_PAGES } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';
import { updateDocumentSection } from '../../store/documentSlice';
import { pushToast } from '../../store/uiSlice';
import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from '../../services/fileExtractionService';
import {
  buildTenantIdentityNumberedItems,
  evaluateTenantIdentityReadiness,
  normalizeTenantIdentityType,
  parseTenantIdentityText,
} from '../../services/tenantIdentityExtractionService';
import { resolvePreferredBilingualValue } from '../../services/multilingualTextUtils';
import { persistRecordFile } from '../../records/archiveService';
import { loadTenantDocumentReferences, saveTenantDocumentReference } from '../../records/tenantDocumentStore';
import { Badge, Button, Card, FormField, Input, Select } from '../ui';
import JourneyModal from '../workflow/JourneyModal';
import FieldDiffPanel from '../workflow/FieldDiffPanel';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'residence-permit', label: 'Residence Permit / Visa' },
  { value: 'visa', label: 'Residence Permit / Visa (legacy alias)' },
];

const LANGUAGE_PREFERENCE_OPTIONS = [
  { value: 'auto', label: 'Auto (use extracted default)' },
  { value: 'en', label: 'English value' },
  { value: 'ar', label: 'Arabic value' },
];

const JOURNEY_STEPS = [
  { id: 'review', label: 'Review Extraction' },
  { id: 'bilingual', label: 'Bilingual Check' },
  { id: 'confirm', label: 'Confirm Apply' },
];

const CONFIDENCE_TONE_MAP = {
  high: 'success',
  medium: 'warning',
  low: 'critical',
};

const TenantIdentityDocsPage = () => {
  const dispatch = useDispatch();
  const { goToPage } = useAppNavigation();
  const documentData = useSelector((state) => state.document);
  const [documentType, setDocumentType] = useState('passport');
  const [isBusy, setIsBusy] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [languagePreference, setLanguagePreference] = useState('auto');
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [lastExtractionMeta, setLastExtractionMeta] = useState(null);
  const [references, setReferences] = useState(() => loadTenantDocumentReferences());

  const normalizedType = useMemo(() => normalizeTenantIdentityType(documentType), [documentType]);

  const numberedItems = useMemo(() => {
    if (!parsed) return [];
    return buildTenantIdentityNumberedItems(parsed);
  }, [parsed]);

  const readiness = useMemo(() => {
    if (!parsed) return null;
    return evaluateTenantIdentityReadiness(parsed);
  }, [parsed]);

  const toast = (tone, title, body) => dispatch(pushToast({ tone, title, body }));

  const getPreferredTenantFields = (sourceParsed) => {
    const name = resolvePreferredBilingualValue({
      primary: sourceParsed?.fullName,
      english: sourceParsed?.fullNameEn,
      arabic: sourceParsed?.fullNameAr,
      preference: languagePreference,
    });

    const nationality = resolvePreferredBilingualValue({
      primary: sourceParsed?.nationality,
      english: sourceParsed?.nationalityEn,
      arabic: sourceParsed?.nationalityAr,
      preference: languagePreference,
    });

    return { name, nationality };
  };

  const buildApplyPlan = (sourceParsed = parsed, sourceType = normalizedType) => {
    if (!sourceParsed) {
      return null;
    }

    const preferred = getPreferredTenantFields(sourceParsed);
    const previousValues = {
      passportNo: documentData?.tenant?.passportNo || '',
      nationality: documentData?.tenant?.nationality || '',
      idExpiryDate: documentData?.tenant?.idExpiryDate || '',
      fullName: documentData?.tenant?.fullName || '',
    };

    const nextValues = {
      ...previousValues,
      passportNo: sourceParsed.passportNo || previousValues.passportNo,
      nationality: preferred.nationality.value || previousValues.nationality,
      idExpiryDate: sourceParsed.expiryDate || previousValues.idExpiryDate,
      fullName: preferred.name.value || previousValues.fullName,
    };

    const diffRows = [
      {
        key: 'tenant.fullName',
        label: 'Tenant Full Name',
        currentValue: previousValues.fullName,
        nextValue: nextValues.fullName,
        changed: previousValues.fullName !== nextValues.fullName,
      },
      {
        key: 'tenant.passportNo',
        label: sourceType === 'passport' ? 'Passport Number' : 'Permit / Visa Number',
        currentValue: previousValues.passportNo,
        nextValue: nextValues.passportNo,
        changed: previousValues.passportNo !== nextValues.passportNo,
      },
      {
        key: 'tenant.nationality',
        label: 'Tenant Nationality',
        currentValue: previousValues.nationality,
        nextValue: nextValues.nationality,
        changed: previousValues.nationality !== nextValues.nationality,
      },
      {
        key: 'tenant.idExpiryDate',
        label: 'ID Expiry Date',
        currentValue: previousValues.idExpiryDate,
        nextValue: nextValues.idExpiryDate,
        changed: previousValues.idExpiryDate !== nextValues.idExpiryDate,
      },
    ];

    return {
      sourceType,
      previousValues,
      nextValues,
      preferred,
      diffRows,
      successBody: `${sourceType === 'passport' ? 'Passport' : 'Residence permit'} fields copied into the tenancy contract (${preferred.name.selectedLanguage}/${preferred.nationality.selectedLanguage}).`,
    };
  };

  const applyToCurrentContract = (sourceParsed = parsed, sourceType = normalizedType) => {
    if (!sourceParsed) {
      toast('warning', 'Nothing to apply', 'Scan a passport or residence permit first.');
      return;
    }

    const applyPlan = buildApplyPlan(sourceParsed, sourceType);
    if (!applyPlan) return;

    dispatch(updateDocumentSection({ section: 'tenant', values: applyPlan.nextValues }));
    dispatch(
      pushToast({
        tone: 'success',
        title: 'Tenant details applied',
        body: applyPlan.successBody,
        action: {
          label: 'Undo',
          type: 'document/updateDocumentSection',
          payload: { section: 'tenant', values: applyPlan.previousValues },
        },
      }),
    );
  };

  const openJourneyAtStep = (step) => {
    setJourneyStep(step);
    setJourneyOpen(true);
  };

  const resolveExtractionConfidence = () => {
    if (!readiness) return 'low';
    if (readiness.ready) return 'high';
    if (readiness.completedCount >= Math.ceil(readiness.requiredCount / 2)) return 'medium';
    return 'low';
  };

  const currentApplyPlan = parsed ? buildApplyPlan(parsed, normalizedType) : null;

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsBusy(true);
    try {
      const extraction = await extractTextFromFile(file);
      if (!extraction.ok) {
        toast('error', 'Could not read document', extraction.reason || 'Extraction failed.');
        return;
      }

      if (!extraction.text || extraction.text.trim().length === 0) {
        toast(
          'warning',
          'No text parsed from this file',
          'This usually means a scan-only image or PDF. Please upload a clearer photo or a front/back scan.',
        );
        return;
      }

      const parsedDoc = parseTenantIdentityText(extraction.text, normalizedType);
      const scanItems = buildTenantIdentityNumberedItems(parsedDoc);
      const readCheck = evaluateTenantIdentityReadiness(parsedDoc);

      const recordPath = `tenant-identity/master/${normalizedType}/${Date.now()}`;
      const sourceSave = await persistRecordFile({
        recordPath,
        fileName: file.name,
        blob: file,
      });

      if (!sourceSave.ok) {
        toast('warning', 'File parsed but not saved to records', sourceSave.reason || 'Disk save failed.');
      }

      const referencePayload = {
        sourceFileName: file.name,
        documentType: normalizedType,
        parsed: parsedDoc,
        numberedItems: scanItems,
        readiness: readCheck,
        extractedText: extraction.text,
        extractionMeta: {
          detectedLanguage: extraction.detectedLanguage || 'unknown',
          languageStats: extraction.languageStats || null,
          ocrLanguages: extraction.ocrLanguages || null,
        },
        createdAt: new Date().toISOString(),
      };

      const jsonBlob = new Blob([JSON.stringify(referencePayload, null, 2)], {
        type: 'application/json',
      });

      const referenceSave = await persistRecordFile({
        recordPath,
        fileName: 'tenant-identity-reference.json',
        blob: jsonBlob,
      });

      if (!referenceSave.ok) {
        toast(
          'warning',
          'Reference save incomplete',
          referenceSave.reason || 'Could not save JSON reference file.',
        );
      }

      saveTenantDocumentReference({
        type: normalizedType,
        fileName: file.name,
        sourcePath: sourceSave.path || null,
        parsed: parsedDoc,
        numberedItems: scanItems,
        extractedText: extraction.text,
        readiness: readCheck,
        detectedLanguage: extraction.detectedLanguage || 'unknown',
        languageStats: extraction.languageStats || null,
        ocrLanguages: extraction.ocrLanguages || null,
        createdFrom: 'tenant-identity-module',
        documentLabel: normalizedType === 'passport' ? 'Passport' : 'Residence Permit',
        fileKind: extraction.kind || file.type || null,
      });

      setReferences(loadTenantDocumentReferences());
      setExtractedText(extraction.text);
      setParsed(parsedDoc);
      setLastExtractionMeta({
        detectedLanguage: extraction.detectedLanguage || 'unknown',
        kind: extraction.kind || 'unknown',
        ocrLanguages: extraction.ocrLanguages || null,
      });
      openJourneyAtStep(0);

      toast(
        'success',
        'Tenant identity document analyzed',
        `Saved ${normalizedType === 'passport' ? 'passport' : 'residence permit'} reference with ${
          scanItems.length
        } numbered items (detected language: ${extraction.detectedLanguage || 'unknown'}).`,
      );
    } catch (error) {
      toast('error', 'Tenant identity workflow failed', error.message || 'Unexpected error.');
    } finally {
      setIsBusy(false);
      event.target.value = '';
    }
  };

  return (
    <main className="title-deed-page workflow-page shell-page" id="main" tabIndex={-1}>
      <section className="title-deed-header workflow-page__header">
        <div className="workflow-page__header-copy">
          <h2>Tenant Passport & Residence Permit Scanner</h2>
          <p>
            Upload tenant passport or residence permit images/PDFs to extract identity details, preserve the
            source file, and save a reusable autofill reference.
          </p>
        </div>
        <div className="tenancy-gate-actions">
          <Button variant="primary" onClick={() => openJourneyAtStep(0)} disabled={!parsed}>
            Open apply journey
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.TENANCY_BUILDER)}>
            ← Back to Tenancy Builder
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
            ← Back to Document Hub
          </Button>
        </div>
      </section>

      <section className="title-deed-grid title-deed-grid--primary workflow-page__grid workflow-page__grid--three-rail">
        <Card variant="outlined" className="title-deed-upload" as="aside">
          <Card.Header>
            <h3>Upload + Scan</h3>
          </Card.Header>
          <Card.Body>
            <FormField label="Document type">
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                options={DOCUMENT_TYPE_OPTIONS}
              />
            </FormField>

            <FormField label="Apply value language preference">
              <Select
                value={languagePreference}
                onChange={(e) => setLanguagePreference(e.target.value)}
                options={LANGUAGE_PREFERENCE_OPTIONS}
              />
            </FormField>

            <FormField label="Tenant document (PDF/PNG/JPG)">
              <Input type="file" accept={SUPPORTED_FILE_ACCEPT} onChange={handleUpload} disabled={isBusy} />
            </FormField>

            <p className="title-deed-note">
              Save path: <code>records/tenant-identity/master/&lt;passport|residence-permit&gt;/...</code>
            </p>
          </Card.Body>
        </Card>

        <Card variant="elevated" className="title-deed-results">
          <Card.Header>
            <h3>Extracted Identity Information</h3>
            {readiness ? (
              <Badge tone={readiness.ready ? 'success' : 'warning'}>
                {readiness.ready
                  ? `Ready (${readiness.completedCount}/${readiness.requiredCount})`
                  : `Missing ${readiness.missing.length} required fields`}
              </Badge>
            ) : null}
          </Card.Header>
          <Card.Body>
            {parsed ? (
              <div className="title-deed-facts">
                {(() => {
                  const preferred = getPreferredTenantFields(parsed);
                  return preferred.name.hasBoth || preferred.nationality.hasBoth ? (
                    <div className="title-deed-fact">
                      <strong>Bilingual value mode</strong>
                      <span>
                        Name: {preferred.name.selectedLanguage} | Nationality:{' '}
                        {preferred.nationality.selectedLanguage}
                      </span>
                    </div>
                  ) : null;
                })()}
                {Object.entries(parsed).map(([key, value]) => (
                  <div className="title-deed-fact" key={key}>
                    <strong>{key}</strong>
                    <span>{String(value ?? '') || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="title-deed-note">No tenant identity document analyzed yet.</p>
            )}

            {parsed ? (
              <div className="tenancy-gate-actions" style={{ marginTop: 'var(--space-3)' }}>
                <Button variant="secondary" onClick={() => openJourneyAtStep(0)}>
                  Review & apply with journey
                </Button>
                <Button variant="ghost" onClick={() => goToPage(APP_PAGES.TENANCY_BUILDER)}>
                  Go to tenancy builder
                </Button>
              </div>
            ) : null}
          </Card.Body>
        </Card>

        <Card variant="outlined" className="title-deed-numbered" as="aside">
          <Card.Header>
            <h3>Numbered Scan Items</h3>
          </Card.Header>
          <Card.Body>
            {numberedItems.length ? (
              <ol className="title-deed-list">
                {numberedItems.map((item) => (
                  <li key={`${item.no}-${item.label}`}>
                    <strong>{item.label}:</strong> {String(item.value)}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="title-deed-note">Numbered scan list appears after upload.</p>
            )}
          </Card.Body>
        </Card>
      </section>

      <section className="title-deed-grid title-deed-grid--secondary">
        <Card variant="outlined" className="title-deed-history">
          <Card.Header>
            <h3>Saved Tenant Identity References</h3>
          </Card.Header>
          <Card.Body>
            {references.length ? (
              <ul className="title-deed-history-list">
                {references.slice(0, 10).map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.fileName}</strong>
                    <span>Type: {entry.documentLabel || entry.type}</span>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    <span>{entry.numberedItems?.length || 0} items scanned</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="title-deed-note">No saved tenant identity references yet.</p>
            )}
          </Card.Body>
        </Card>

        <Card variant="outlined" className="title-deed-text">
          <Card.Header>
            <h3>Raw Extracted Text (audit)</h3>
          </Card.Header>
          <Card.Body>
            <pre className="title-deed-pre">{extractedText || 'No extracted text yet.'}</pre>
          </Card.Body>
        </Card>
      </section>

      <JourneyModal
        open={journeyOpen}
        onClose={() => setJourneyOpen(false)}
        title="Tenant Identity Apply Journey"
        steps={JOURNEY_STEPS}
        currentStep={journeyStep}
        onStepChange={setJourneyStep}
        onBack={() => setJourneyStep((value) => Math.max(value - 1, 0))}
        onNext={() => setJourneyStep((value) => Math.min(value + 1, JOURNEY_STEPS.length - 1))}
        onFinish={() => {
          applyToCurrentContract(parsed, normalizedType);
          setJourneyOpen(false);
          setJourneyStep(0);
        }}
        nextDisabled={!parsed}
        finishDisabled={!currentApplyPlan || !currentApplyPlan.diffRows.some((row) => row.changed)}
        finishLabel="Confirm Apply"
      >
        {journeyStep === 0 ? (
          <div className="workspace-journey-modal">
            <p>Review extraction readiness and source metadata before applying values to the contract.</p>
            <div className="workspace-page__meta">
              <Badge tone={CONFIDENCE_TONE_MAP[resolveExtractionConfidence()] || 'warning'}>
                Confidence: {resolveExtractionConfidence()}
              </Badge>
              <Badge tone="info">Language: {lastExtractionMeta?.detectedLanguage || 'unknown'}</Badge>
              <Badge tone="neutral">Source: {lastExtractionMeta?.kind || 'unknown'}</Badge>
              {lastExtractionMeta?.ocrLanguages ? (
                <Badge tone="accent">OCR: {lastExtractionMeta.ocrLanguages}</Badge>
              ) : null}
            </div>
            <ul>
              <li>Document type: {normalizedType === 'passport' ? 'Passport' : 'Residence Permit'}</li>
              <li>Parsed fields: {numberedItems.length}</li>
              <li>
                Readiness:{' '}
                {readiness ? `${readiness.completedCount}/${readiness.requiredCount}` : 'No readiness data'}
              </li>
            </ul>
          </div>
        ) : null}

        {journeyStep === 1 ? (
          <div className="workspace-journey-modal">
            <p>
              Validate bilingual values side-by-side. Selected preference:{' '}
              <strong>{languagePreference}</strong>
            </p>
            <div className="journey-review-bilingual">
              <div className="journey-review-bilingual__row">
                <strong>Full Name</strong>
                <div className="journey-review-bilingual__values">
                  <span>EN: {parsed?.fullNameEn || '—'}</span>
                  <span>AR: {parsed?.fullNameAr || '—'}</span>
                  <span>Selected: {currentApplyPlan?.preferred?.name?.value || parsed?.fullName || '—'}</span>
                </div>
              </div>
              <div className="journey-review-bilingual__row">
                <strong>Nationality</strong>
                <div className="journey-review-bilingual__values">
                  <span>EN: {parsed?.nationalityEn || '—'}</span>
                  <span>AR: {parsed?.nationalityAr || '—'}</span>
                  <span>
                    Selected: {currentApplyPlan?.preferred?.nationality?.value || parsed?.nationality || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {journeyStep === 2 ? (
          <div className="workspace-journey-modal">
            <p>Confirm field-level changes before writing values to the active contract.</p>
            <FieldDiffPanel title="Apply Preview Diff" rows={currentApplyPlan?.diffRows || []} />
          </div>
        ) : null}
      </JourneyModal>
    </main>
  );
};

export default TenantIdentityDocsPage;
