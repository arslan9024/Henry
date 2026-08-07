import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { APP_PAGES } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';
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

const TitleDeedModulePage = () => {
  const dispatch = useDispatch();
  const { goToPage } = useAppNavigation();
  const [isBusy, setIsBusy] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [parsed, setParsed] = useState(null);
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
    }
  };

  return (
    <main className="title-deed-page shell-page" id="main" tabIndex={-1}>
      <section className="title-deed-header">
        <div>
          <h2>Title Deed Information Extractor</h2>
          <p>
            Upload title deed PDF/image to extract structured property data and save numbered reference items
            for future autofill.
          </p>
        </div>
        <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
          ← Back to Document Hub
        </Button>
      </section>

      <section className="title-deed-grid">
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

      <section className="title-deed-grid">
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
    </main>
  );
};

export default TitleDeedModulePage;
