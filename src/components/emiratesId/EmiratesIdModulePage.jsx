import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APP_PAGES, selectRouteContext } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';
import { updateDocumentSection } from '../../store/documentSlice';
import { pushToast } from '../../store/uiSlice';
import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from '../../services/fileExtractionService';
import {
  buildEmiratesIdNumberedItems,
  evaluateEmiratesIdReadiness,
  parseEmiratesIdText,
} from '../../services/emiratesIdExtractionService';
import { resolvePreferredBilingualValue } from '../../services/multilingualTextUtils';
import { mapEmiratesIdToParty } from '../../services/extractionAutofillService';
import { persistRecordFile } from '../../records/archiveService';
import { loadEmiratesIdReferences, saveEmiratesIdReference } from '../../records/emiratesIdStore';
import { Badge, Button, Card, FormField, Input, Select } from '../ui';
import JourneyModal from '../workflow/JourneyModal';
import FieldDiffPanel from '../workflow/FieldDiffPanel';

const OWNER_TAG_OPTIONS = [
  { value: '', label: 'Select owner tag (required)...' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'landlord', label: 'Landlord' },
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

const EmiratesIdModulePage = () => {
  const dispatch = useDispatch();
  const { goToPage } = useAppNavigation();
  const documentData = useSelector((state) => state.document);
  const routeContext = useSelector(selectRouteContext);
  const [ownerTag, setOwnerTag] = useState(() => routeContext?.ownerTag || '');
  const [languagePreference, setLanguagePreference] = useState('auto');
  const [isBusy, setIsBusy] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [lastExtractionMeta, setLastExtractionMeta] = useState(null);
  const [references, setReferences] = useState(() => loadEmiratesIdReferences());

  const numberedItems = useMemo(() => {
    if (!parsed) return [];
    return buildEmiratesIdNumberedItems(parsed, ownerTag || 'unassigned');
  }, [parsed, ownerTag]);

  const readiness = useMemo(() => {
    if (!parsed) return null;
    return evaluateEmiratesIdReadiness(parsed);
  }, [parsed]);

  const toast = (tone, title, body) => dispatch(pushToast({ tone, title, body }));

  const getPreferredIdentityFields = (sourceParsed) => {
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

  const buildApplyPlan = (sourceParsed = parsed, sourceOwnerTag = ownerTag) => {
    if (!sourceParsed) {
      return null;
    }

    if (!sourceOwnerTag) {
      return null;
    }

    const preferred = getPreferredIdentityFields(sourceParsed);

    if (sourceOwnerTag === 'tenant') {
      const section = 'tenant';
      const previousValues = { ...documentData.tenant };
      const nextValues = mapEmiratesIdToParty({
        parsed: sourceParsed,
        current: previousValues,
        preferred,
        ownerTag: sourceOwnerTag,
      });
      const fields = [
        ['fullName', 'Tenant Full Name'],
        ['nationality', 'Tenant Nationality'],
        ['emiratesId', 'Tenant Emirates ID'],
        ['dateOfBirth', 'Date of Birth'],
        ['gender', 'Gender'],
        ['idIssueDate', 'ID Issue Date'],
        ['idExpiryDate', 'ID Expiry Date'],
        ['identityCardNumber', 'Card Number'],
        ['occupation', 'Occupation'],
        ['employer', 'Employer'],
        ['idIssuingPlace', 'Issuing Place'],
      ];
      const diffRows = fields.map(([field, label]) => ({
        key: `tenant.${field}`,
        label,
        currentValue: previousValues[field],
        nextValue: nextValues[field],
        changed: previousValues[field] !== nextValues[field],
      }));

      return {
        section,
        previousValues,
        nextValues,
        preferred,
        diffRows,
        successTitle: 'Tenant Emirates ID applied',
        successBody: `Tenant values applied (name ${preferred.name.selectedLanguage}, nationality ${preferred.nationality.selectedLanguage}).`,
      };
    }

    const section = 'landlord';
    const previousValues = { ...documentData.landlord };
    const nextValues = mapEmiratesIdToParty({
      parsed: sourceParsed,
      current: previousValues,
      preferred,
      ownerTag: sourceOwnerTag,
    });
    const fields = [
      ['nationality', 'Landlord Nationality'],
      ['emiratesId', 'Landlord Emirates ID'],
      ['dateOfBirth', 'Date of Birth'],
      ['gender', 'Gender'],
      ['idIssueDate', 'ID Issue Date'],
      ['idExpiryDate', 'ID Expiry Date'],
      ['identityCardNumber', 'Card Number'],
      ['occupation', 'Occupation'],
      ['employer', 'Employer'],
      ['idIssuingPlace', 'Issuing Place'],
    ];
    const diffRows = fields.map(([field, label]) => ({
      key: `landlord.${field}`,
      label,
      currentValue: previousValues[field],
      nextValue: nextValues[field],
      changed: previousValues[field] !== nextValues[field],
    }));

    return {
      section,
      previousValues,
      nextValues,
      preferred,
      diffRows,
      successTitle: 'Landlord Emirates ID applied',
      successBody: 'Landlord Emirates ID identity and employment metadata were copied into the contract.',
    };
  };

  const applyToCurrentContract = (sourceParsed = parsed, sourceOwnerTag = ownerTag) => {
    if (!sourceParsed) {
      toast('warning', 'Nothing to apply', 'Scan an Emirates ID first.');
      return;
    }
    if (!sourceOwnerTag) {
      toast('warning', 'Owner tag required', 'Select tenant or landlord before applying values.');
      return;
    }

    const applyPlan = buildApplyPlan(sourceParsed, sourceOwnerTag);
    if (!applyPlan) return;

    dispatch(updateDocumentSection({ section: applyPlan.section, values: applyPlan.nextValues }));
    dispatch(
      pushToast({
        tone: 'success',
        title: applyPlan.successTitle,
        body: applyPlan.successBody,
        action: {
          label: 'Undo',
          type: 'document/updateDocumentSection',
          payload: { section: applyPlan.section, values: applyPlan.previousValues },
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

  const currentApplyPlan = parsed && ownerTag ? buildApplyPlan(parsed, ownerTag) : null;

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ownerTag) {
      toast(
        'warning',
        'Owner tag required',
        'Please select whether this Emirates ID is for tenant or landlord.',
      );
      return;
    }

    setIsBusy(true);
    try {
      const extraction = await extractTextFromFile(file);
      if (!extraction.ok) {
        toast('error', 'Could not read Emirates ID', extraction.reason || 'Extraction failed.');
        return;
      }

      if (!extraction.text || extraction.text.trim().length === 0) {
        toast(
          'warning',
          'No text parsed from this file',
          'This usually means scan-only PDF. Please upload page images (PNG/JPG) for OCR extraction.',
        );
        return;
      }

      const parsedDoc = parseEmiratesIdText(extraction.text);
      const scanItems = buildEmiratesIdNumberedItems(parsedDoc, ownerTag);

      const recordPath = `emirates-id/master/${ownerTag}/${Date.now()}`;

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
        ownerTag,
        parsed: parsedDoc,
        numberedItems: scanItems,
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
        fileName: 'emirates-id-reference.json',
        blob: jsonBlob,
      });

      if (!referenceSave.ok) {
        toast(
          'warning',
          'Reference save incomplete',
          referenceSave.reason || 'Could not save JSON reference file.',
        );
      }

      const localEntry = saveEmiratesIdReference({
        fileName: file.name,
        ownerTag,
        sourcePath: sourceSave.path || null,
        parsed: parsedDoc,
        numberedItems: scanItems,
        extractedText: extraction.text,
        detectedLanguage: extraction.detectedLanguage || 'unknown',
        languageStats: extraction.languageStats || null,
        ocrLanguages: extraction.ocrLanguages || null,
      });

      setReferences(loadEmiratesIdReferences());
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
        'Emirates ID analyzed',
        `Saved with ${ownerTag.toUpperCase()} tag, ${scanItems.length} numbered scan items, detected language: ${
          extraction.detectedLanguage || 'unknown'
        }.`,
      );

      if (localEntry?.id && routeContext?.autoReturn && routeContext?.returnTo) {
        goToPage(routeContext.returnTo);
      }
    } catch (error) {
      toast('error', 'Emirates ID workflow failed', error.message || 'Unexpected error.');
    } finally {
      setIsBusy(false);
      event.target.value = '';
    }
  };

  return (
    <main className="title-deed-page workflow-page shell-page" id="main" tabIndex={-1}>
      <section className="title-deed-header workflow-page__header">
        <div className="workflow-page__header-copy">
          <h2>Emirates ID Extractor</h2>
          <p>
            Upload Emirates ID to extract personal information for tenancy workflows. Owner tag is mandatory
            before saving.
          </p>
        </div>
        <div className="tenancy-gate-actions workflow-page__header-actions">
          <Button variant="primary" onClick={() => openJourneyAtStep(0)} disabled={!parsed || !ownerTag}>
            Open apply journey
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
            ← Back to Document Hub
          </Button>
          {routeContext?.returnTo && routeContext.returnTo !== APP_PAGES.DOCUMENT_HUB ? (
            <Button variant="secondary" onClick={() => goToPage(routeContext.returnTo)}>
              ← Back to Tenancy Builder
            </Button>
          ) : null}
        </div>
      </section>

      <section className="title-deed-grid title-deed-grid--primary workflow-page__grid workflow-page__grid--three-rail">
        <Card variant="outlined" className="title-deed-upload workflow-page__rail" as="aside">
          <Card.Header>
            <h3>Upload + Tag</h3>
          </Card.Header>
          <Card.Body>
            <FormField label="Owner tag (required)">
              <Select
                value={ownerTag}
                onChange={(e) => setOwnerTag(e.target.value)}
                options={OWNER_TAG_OPTIONS}
              />
            </FormField>

            <FormField label="Apply value language preference">
              <Select
                value={languagePreference}
                onChange={(e) => setLanguagePreference(e.target.value)}
                options={LANGUAGE_PREFERENCE_OPTIONS}
              />
            </FormField>

            <FormField label="Emirates ID document (PDF/PNG/JPG)">
              <Input type="file" accept={SUPPORTED_FILE_ACCEPT} onChange={handleUpload} disabled={isBusy} />
            </FormField>

            <p className="title-deed-note">
              Save path: <code>records/emirates-id/master/&lt;tenant|landlord&gt;/...</code>
            </p>
          </Card.Body>
        </Card>

        <Card variant="elevated" className="title-deed-results workflow-page__main">
          <Card.Header>
            <h3>Extracted Personal Information</h3>
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
                  const preferred = getPreferredIdentityFields(parsed);
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

                <div className="tenancy-gate-actions" style={{ marginTop: 'var(--space-3)' }}>
                  <Button variant="secondary" onClick={() => openJourneyAtStep(0)}>
                    Review & apply with journey
                  </Button>
                </div>
              </div>
            ) : (
              <p className="title-deed-note">No Emirates ID analyzed yet.</p>
            )}
          </Card.Body>
        </Card>

        <Card variant="outlined" className="title-deed-numbered workflow-page__rail" as="aside">
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
              <p className="title-deed-note">Numbered list appears after successful extraction.</p>
            )}
          </Card.Body>
        </Card>
      </section>

      <section className="title-deed-grid title-deed-grid--secondary">
        <Card variant="outlined" className="title-deed-history">
          <Card.Header>
            <h3>Saved Emirates ID References</h3>
          </Card.Header>
          <Card.Body>
            {references.length ? (
              <ul className="title-deed-history-list">
                {references.slice(0, 10).map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.fileName}</strong>
                    <span>Tag: {entry.ownerTag}</span>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    <span>{entry.numberedItems?.length || 0} items scanned</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="title-deed-note">No saved Emirates ID references yet.</p>
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
        title="Emirates ID Apply Journey"
        steps={JOURNEY_STEPS}
        currentStep={journeyStep}
        onStepChange={setJourneyStep}
        onBack={() => setJourneyStep((value) => Math.max(value - 1, 0))}
        onNext={() => setJourneyStep((value) => Math.min(value + 1, JOURNEY_STEPS.length - 1))}
        onFinish={() => {
          applyToCurrentContract(parsed, ownerTag);
          setJourneyOpen(false);
          setJourneyStep(0);
        }}
        nextDisabled={!parsed || !ownerTag}
        finishDisabled={!currentApplyPlan || !currentApplyPlan.diffRows.some((row) => row.changed)}
        finishLabel="Confirm Apply"
      >
        {journeyStep === 0 ? (
          <div className="workspace-journey-modal">
            <p>Review extraction readiness and language metadata before applying values to the contract.</p>
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
              <li>Owner tag: {ownerTag || 'Not selected'}</li>
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

export default EmiratesIdModulePage;
