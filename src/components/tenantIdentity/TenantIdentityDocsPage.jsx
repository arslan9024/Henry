import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { APP_PAGES } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';
import { setDocumentValue } from '../../store/documentSlice';
import { pushToast } from '../../store/uiSlice';
import { extractTextFromFile, SUPPORTED_FILE_ACCEPT } from '../../services/fileExtractionService';
import {
  buildTenantIdentityNumberedItems,
  evaluateTenantIdentityReadiness,
  normalizeTenantIdentityType,
  parseTenantIdentityText,
} from '../../services/tenantIdentityExtractionService';
import { persistRecordFile } from '../../records/archiveService';
import { loadTenantDocumentReferences, saveTenantDocumentReference } from '../../records/tenantDocumentStore';
import { Badge, Button, Card, FormField, Input, Select } from '../ui';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'residence-permit', label: 'Residence Permit / Visa' },
  { value: 'visa', label: 'Residence Permit / Visa (legacy alias)' },
];

const TenantIdentityDocsPage = () => {
  const dispatch = useDispatch();
  const { goToPage } = useAppNavigation();
  const [documentType, setDocumentType] = useState('passport');
  const [isBusy, setIsBusy] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsed, setParsed] = useState(null);
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

  const applyToCurrentContract = (sourceParsed = parsed, sourceType = normalizedType) => {
    if (!sourceParsed) {
      toast('warning', 'Nothing to apply', 'Scan a passport or residence permit first.');
      return;
    }

    dispatch(setDocumentValue({ section: 'tenant', field: 'fullName', value: sourceParsed.fullName || '' }));
    dispatch(
      setDocumentValue({ section: 'tenant', field: 'passportNo', value: sourceParsed.passportNo || '' }),
    );
    dispatch(
      setDocumentValue({ section: 'tenant', field: 'nationality', value: sourceParsed.nationality || '' }),
    );
    dispatch(
      setDocumentValue({ section: 'tenant', field: 'idExpiryDate', value: sourceParsed.expiryDate || '' }),
    );

    toast(
      'success',
      'Tenant details applied',
      `${sourceType === 'passport' ? 'Passport' : 'Residence permit'} fields copied into the tenancy contract.`,
    );
  };

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
        createdFrom: 'tenant-identity-module',
        documentLabel: normalizedType === 'passport' ? 'Passport' : 'Residence Permit',
        fileKind: extraction.kind || file.type || null,
      });

      setReferences(loadTenantDocumentReferences());
      setExtractedText(extraction.text);
      setParsed(parsedDoc);

      toast(
        'success',
        'Tenant identity document analyzed',
        `Saved ${normalizedType === 'passport' ? 'passport' : 'residence permit'} reference with ${scanItems.length} numbered items.`,
      );
    } catch (error) {
      toast('error', 'Tenant identity workflow failed', error.message || 'Unexpected error.');
    } finally {
      setIsBusy(false);
      event.target.value = '';
    }
  };

  return (
    <main className="title-deed-page shell-page" id="main" tabIndex={-1}>
      <section className="title-deed-header">
        <div>
          <h2>Tenant Passport & Residence Permit Scanner</h2>
          <p>
            Upload tenant passport or residence permit images/PDFs to extract identity details, preserve the
            source file, and save a reusable autofill reference.
          </p>
        </div>
        <div className="tenancy-gate-actions">
          <Button variant="primary" onClick={() => applyToCurrentContract()} disabled={!parsed}>
            Use for current contract
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.TENANCY_BUILDER)}>
            ← Back to Tenancy Builder
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
            ← Back to Document Hub
          </Button>
        </div>
      </section>

      <section className="title-deed-grid">
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
                <Button variant="secondary" onClick={() => applyToCurrentContract()}>
                  Use current scan for contract
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

      <section className="title-deed-grid">
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
    </main>
  );
};

export default TenantIdentityDocsPage;
