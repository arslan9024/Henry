import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APP_PAGES } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';
import { updateDocumentSection } from '../../store/documentSlice';
import { pushToast } from '../../store/uiSlice';
import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from '../../services/fileExtractionService';
import {
  buildTitleDeedNumberedItems,
  evaluateTitleDeedReadiness,
  parseTitleDeedText,
} from '../../services/titleDeedExtractionService';
import { persistRecordFile } from '../../records/archiveService';
import { loadTitleDeedReferences, saveTitleDeedReference } from '../../records/titleDeedStore';
import { Badge, Button, Card, FormField, Input } from '../ui';
import JourneyModal from '../workflow/JourneyModal';
import FieldDiffPanel from '../workflow/FieldDiffPanel';

const JOURNEY_STEPS = [
  { id: 'review', label: 'Review Extraction' },
  { id: 'mapping', label: 'Mapping Check' },
  { id: 'confirm', label: 'Confirm Apply' },
];

const CONFIDENCE_TONE_MAP = {
  high: 'success',
  medium: 'warning',
  low: 'critical',
};

const TitleDeedModulePage = () => {
  const dispatch = useDispatch();
  const { goToPage } = useAppNavigation();
  const documentData = useSelector((state) => state.document);
  const [isBusy, setIsBusy] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyStep, setJourneyStep] = useState(0);
  const [lastExtractionMeta, setLastExtractionMeta] = useState(null);
  const [references, setReferences] = useState(() => loadTitleDeedReferences());

  const numberedItems = useMemo(() => {
    if (!parsed) return [];
    return buildTitleDeedNumberedItems(parsed);
  }, [parsed]);

  const readiness = useMemo(() => {
    if (!parsed) return null;
    return evaluateTitleDeedReadiness(parsed);
  }, [parsed]);

  const toast = (tone, title, body) => dispatch(pushToast({ tone, title, body }));

  const buildSizeValue = (sourceParsed) => {
    const sqm = sourceParsed?.areaSqMeter;
    const sqf = sourceParsed?.areaSqFeet;
    if (sqm && sqf) return `${sqm} sqm / ${sqf} sqft`;
    if (sqm) return `${sqm} sqm`;
    if (sqf) return `${sqf} sqft`;
    return '';
  };

  const buildApplyPlan = (sourceParsed = parsed) => {
    if (!sourceParsed) return null;

    const previousValues = {
      documentDate: documentData?.property?.documentDate || '',
      propertyType: documentData?.property?.propertyType || '',
      community: documentData?.property?.community || '',
      plotNo: documentData?.property?.plotNo || '',
      size: documentData?.property?.size || '',
      buildingNumber: documentData?.property?.buildingNumber || '',
    };

    const nextValues = {
      ...previousValues,
      documentDate: sourceParsed.issueDate || previousValues.documentDate,
      propertyType: sourceParsed.propertyType || previousValues.propertyType,
      community: sourceParsed.community || previousValues.community,
      plotNo: sourceParsed.plotNo || previousValues.plotNo,
      size: buildSizeValue(sourceParsed) || previousValues.size,
      buildingNumber: sourceParsed.municipalityNo || previousValues.buildingNumber,
    };

    const diffRows = [
      {
        key: 'property.documentDate',
        label: 'Property Document Date',
        currentValue: previousValues.documentDate,
        nextValue: nextValues.documentDate,
        changed: previousValues.documentDate !== nextValues.documentDate,
      },
      {
        key: 'property.propertyType',
        label: 'Property Type',
        currentValue: previousValues.propertyType,
        nextValue: nextValues.propertyType,
        changed: previousValues.propertyType !== nextValues.propertyType,
      },
      {
        key: 'property.community',
        label: 'Community',
        currentValue: previousValues.community,
        nextValue: nextValues.community,
        changed: previousValues.community !== nextValues.community,
      },
      {
        key: 'property.plotNo',
        label: 'Plot Number',
        currentValue: previousValues.plotNo,
        nextValue: nextValues.plotNo,
        changed: previousValues.plotNo !== nextValues.plotNo,
      },
      {
        key: 'property.size',
        label: 'Size',
        currentValue: previousValues.size,
        nextValue: nextValues.size,
        changed: previousValues.size !== nextValues.size,
      },
      {
        key: 'property.buildingNumber',
        label: 'Municipality / Building Number',
        currentValue: previousValues.buildingNumber,
        nextValue: nextValues.buildingNumber,
        changed: previousValues.buildingNumber !== nextValues.buildingNumber,
      },
    ];

    return {
      previousValues,
      nextValues,
      diffRows,
      successBody:
        'Selected title deed fields were applied to the property section (date, type, community, plot, size, municipality/building).',
    };
  };

  const applyToCurrentContract = (sourceParsed = parsed) => {
    if (!sourceParsed) {
      toast('warning', 'Nothing to apply', 'Scan a title deed first.');
      return;
    }

    const applyPlan = buildApplyPlan(sourceParsed);
    if (!applyPlan) return;

    dispatch(updateDocumentSection({ section: 'property', values: applyPlan.nextValues }));
    dispatch(
      pushToast({
        tone: 'success',
        title: 'Title deed fields applied',
        body: applyPlan.successBody,
        action: {
          label: 'Undo',
          type: 'document/updateDocumentSection',
          payload: { section: 'property', values: applyPlan.previousValues },
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

  const currentApplyPlan = parsed ? buildApplyPlan(parsed) : null;

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsBusy(true);
    try {
      const extraction = await extractTextFromFile(file);
      if (!extraction.ok) {
        toast('error', 'Could not read title deed', extraction.reason || 'Extraction failed.');
        return;
      }

      const parsedDoc = parseTitleDeedText(extraction.text);
      const scanItems = buildTitleDeedNumberedItems(parsedDoc);

      const recordPath = `title-deed/master/${Date.now()}`;
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
        fileName: 'title-deed-reference.json',
        blob: jsonBlob,
      });

      if (!referenceSave.ok) {
        toast(
          'warning',
          'Reference save incomplete',
          referenceSave.reason || 'Could not save JSON reference file.',
        );
      }

      const localEntry = saveTitleDeedReference({
        fileName: file.name,
        sourcePath: sourceSave.path || null,
        parsed: parsedDoc,
        numberedItems: scanItems,
        extractedText: extraction.text,
        detectedLanguage: extraction.detectedLanguage || 'unknown',
        languageStats: extraction.languageStats || null,
        ocrLanguages: extraction.ocrLanguages || null,
      });

      setReferences(loadTitleDeedReferences());
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
        'Title deed analyzed',
        `Saved source + reference. Captured ${scanItems.length} numbered scan items (detected language: ${
          extraction.detectedLanguage || 'unknown'
        }).`,
      );

      if (!localEntry?.id) {
        toast('info', 'Local reference', 'Parsed data available in current session.');
      }
    } catch (error) {
      toast('error', 'Title deed workflow failed', error.message || 'Unexpected error.');
    } finally {
      setIsBusy(false);
      event.target.value = '';
    }
  };

  return (
    <main className="title-deed-page workflow-page shell-page" id="main" tabIndex={-1}>
      <section className="title-deed-header workflow-page__header">
        <div className="workflow-page__header-copy">
          <h2>Title Deed Information Extractor</h2>
          <p>
            Upload title deed PDF/image to extract structured property data and save numbered reference items
            for future autofill.
          </p>
        </div>
        <div className="tenancy-gate-actions">
          <Button variant="primary" onClick={() => openJourneyAtStep(0)} disabled={!parsed}>
            Open apply journey
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
            ← Back to Document Hub
          </Button>
        </div>
      </section>

      <section className="title-deed-grid title-deed-grid--primary workflow-page__grid workflow-page__grid--three-rail">
        <Card variant="outlined" className="title-deed-upload" as="aside">
          <Card.Header>
            <h3>Upload</h3>
          </Card.Header>
          <Card.Body>
            <FormField label="Title deed document (PDF/PNG/JPG)">
              <Input type="file" accept={SUPPORTED_FILE_ACCEPT} onChange={handleUpload} disabled={isBusy} />
            </FormField>
            <p className="title-deed-note">
              Source file is stored under <code>records/title-deed/master/...</code> and reference JSON is
              saved alongside it.
            </p>
          </Card.Body>
        </Card>

        <Card variant="elevated" className="title-deed-results">
          <Card.Header>
            <h3>Extracted Property Information</h3>
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
              <p className="title-deed-note">No title deed analyzed yet.</p>
            )}
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
              <p className="title-deed-note">Numbered scan list will appear after upload.</p>
            )}
          </Card.Body>
        </Card>
      </section>

      <section className="title-deed-grid title-deed-grid--secondary">
        <Card variant="outlined" className="title-deed-history">
          <Card.Header>
            <h3>Saved References</h3>
          </Card.Header>
          <Card.Body>
            {references.length ? (
              <ul className="title-deed-history-list">
                {references.slice(0, 8).map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.fileName}</strong>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    <span>{entry.numberedItems?.length || 0} items scanned</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="title-deed-note">No saved title deed references yet.</p>
            )}
          </Card.Body>
        </Card>

        <Card variant="outlined" className="title-deed-text">
          <Card.Header>
            <h3>Raw Extracted Text (for audit)</h3>
          </Card.Header>
          <Card.Body>
            <pre className="title-deed-pre">{extractedText || 'No extracted text yet.'}</pre>
          </Card.Body>
        </Card>
      </section>

      <JourneyModal
        open={journeyOpen}
        onClose={() => setJourneyOpen(false)}
        title="Title Deed Apply Journey"
        steps={JOURNEY_STEPS}
        currentStep={journeyStep}
        onStepChange={setJourneyStep}
        onBack={() => setJourneyStep((value) => Math.max(value - 1, 0))}
        onNext={() => setJourneyStep((value) => Math.min(value + 1, JOURNEY_STEPS.length - 1))}
        onFinish={() => {
          applyToCurrentContract(parsed);
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
              <li>Parsed fields: {numberedItems.length}</li>
              <li>
                Readiness:{' '}
                {readiness ? `${readiness.completedCount}/${readiness.requiredCount}` : 'No readiness data'}
              </li>
              <li>Owner name detected: {parsed?.ownerName || 'Not detected'}</li>
            </ul>
          </div>
        ) : null}

        {journeyStep === 1 ? (
          <div className="workspace-journey-modal">
            <p>Verify the contract field mapping before final confirmation.</p>
            <ul>
              <li>Issue Date → Property Document Date</li>
              <li>Property Type → Property Type</li>
              <li>Community → Community</li>
              <li>Plot No → Plot Number</li>
              <li>Area Sq Meter/Sq Feet → Size</li>
              <li>Municipality No → Municipality/Building Number</li>
            </ul>
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

export default TitleDeedModulePage;
