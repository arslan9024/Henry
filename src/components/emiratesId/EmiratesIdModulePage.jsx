import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { goToDocumentHub } from '../../store/appRouteSlice';
import { pushToast } from '../../store/uiSlice';
import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from '../../services/fileExtractionService';
import {
  buildEmiratesIdNumberedItems,
  evaluateEmiratesIdReadiness,
  parseEmiratesIdText,
} from '../../services/emiratesIdExtractionService';
import { persistRecordFile } from '../../records/archiveService';
import { loadEmiratesIdReferences, saveEmiratesIdReference } from '../../records/emiratesIdStore';
import { Badge, Button, Card, FormField, Input, Select } from '../ui';

const OWNER_TAG_OPTIONS = [
  { value: '', label: 'Select owner tag (required)...' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'landlord', label: 'Landlord' },
];

const EmiratesIdModulePage = () => {
  const dispatch = useDispatch();
  const [ownerTag, setOwnerTag] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsed, setParsed] = useState(null);
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

      saveEmiratesIdReference({
        fileName: file.name,
        ownerTag,
        sourcePath: sourceSave.path || null,
        parsed: parsedDoc,
        numberedItems: scanItems,
        extractedText: extraction.text,
      });

      setReferences(loadEmiratesIdReferences());
      setExtractedText(extraction.text);
      setParsed(parsedDoc);

      toast(
        'success',
        'Emirates ID analyzed',
        `Saved with ${ownerTag.toUpperCase()} tag and ${scanItems.length} numbered scan items.`,
      );
    } catch (error) {
      toast('error', 'Emirates ID workflow failed', error.message || 'Unexpected error.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main className="title-deed-page" id="main" tabIndex={-1}>
      <section className="title-deed-header">
        <div>
          <h2>Emirates ID Extractor</h2>
          <p>
            Upload Emirates ID to extract personal information for tenancy workflows. Owner tag is mandatory
            before saving.
          </p>
        </div>
        <Button variant="secondary" onClick={() => dispatch(goToDocumentHub())}>
          ← Back to Document Hub
        </Button>
      </section>

      <section className="title-deed-grid">
        <Card variant="outlined" className="title-deed-upload" as="aside">
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

            <FormField label="Emirates ID document (PDF/PNG/JPG)">
              <Input type="file" accept={SUPPORTED_FILE_ACCEPT} onChange={handleUpload} disabled={isBusy} />
            </FormField>

            <p className="title-deed-note">
              Save path: <code>records/emirates-id/master/&lt;tenant|landlord&gt;/...</code>
            </p>
          </Card.Body>
        </Card>

        <Card variant="elevated" className="title-deed-results">
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
                {Object.entries(parsed).map(([key, value]) => (
                  <div className="title-deed-fact" key={key}>
                    <strong>{key}</strong>
                    <span>{String(value ?? '') || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="title-deed-note">No Emirates ID analyzed yet.</p>
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
              <p className="title-deed-note">Numbered list appears after successful extraction.</p>
            )}
          </Card.Body>
        </Card>
      </section>

      <section className="title-deed-grid">
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
    </main>
  );
};

export default EmiratesIdModulePage;
