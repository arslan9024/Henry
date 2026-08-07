import React, { useMemo, useState } from 'react';
import { APP_PAGES } from '../store/appRouteSlice';
import useAppNavigation from '../hooks/useAppNavigation';
import { Badge, Button, Card, Modal } from './ui';

const JOURNEY_TASKS = [
  {
    id: 'scan-extract-apply',
    title: 'Upload → Extract → Review → Confirm → Apply',
    description:
      'Run guided document extraction with bilingual review, confidence badges, and mandatory diff confirmation before write-back.',
    quickLinks: [
      { label: 'Emirates ID', page: APP_PAGES.EMIRATES_ID },
      { label: 'Title Deed', page: APP_PAGES.TITLE_DEED },
      { label: 'Tenant Identity', page: APP_PAGES.TENANT_IDENTITY_DOCS },
    ],
    steps: [
      'Upload document',
      'Run extraction',
      'Review + confidence',
      'Compare field diff',
      'Apply with undo',
    ],
  },
  {
    id: 'reference-preview-apply',
    title: 'Open saved reference → Preview → Apply',
    description:
      'Load archived extraction references, preview source and parsed values, then apply selected fields to the active contract.',
    quickLinks: [
      { label: 'Document Hub', page: APP_PAGES.DOCUMENT_HUB },
      { label: 'Tenancy Builder', page: APP_PAGES.TENANCY_BUILDER },
    ],
    steps: [
      'Search reference',
      'Preview source file',
      'Review parsed fields',
      'Confirm mapping diff',
      'Apply + undo window',
    ],
  },
  {
    id: 'package-preview-export',
    title: 'Generate/Preview package → Export',
    description:
      'Build tenancy package with readiness checks, preview pages, and export as separate or merged package in one controlled journey.',
    quickLinks: [{ label: 'Tenancy Builder', page: APP_PAGES.TENANCY_BUILDER }],
    steps: ['Validate readiness gates', 'Preview package', 'Choose export mode', 'Export and archive'],
  },
  {
    id: 'cross-document-compare',
    title: 'Cross-document comparison',
    description:
      'Compare passport, residence permit, and Emirates ID values side-by-side to resolve mismatches before final apply.',
    quickLinks: [
      { label: 'Tenant Identity', page: APP_PAGES.TENANT_IDENTITY_DOCS },
      { label: 'Emirates ID', page: APP_PAGES.EMIRATES_ID },
    ],
    steps: [
      'Load candidate records',
      'Compare bilingual fields',
      'Resolve conflicts',
      'Approve final values',
    ],
  },
];

const PREVIEW_CAPABILITIES = [
  'PDF/image preview',
  'Field diff before apply',
  'Confidence + detected-language badges',
  'Undo apply action window',
  'Side-by-side bilingual field toggle',
];

const DocumentWorkspacePage = () => {
  const { goToPage } = useAppNavigation();
  const [activeJourneyId, setActiveJourneyId] = useState(null);

  const activeJourney = useMemo(
    () => JOURNEY_TASKS.find((journey) => journey.id === activeJourneyId) || null,
    [activeJourneyId],
  );

  return (
    <main className="workspace-page shell-page" id="main" tabIndex={-1}>
      <section className="workspace-page__header">
        <div>
          <h2>Document Operations Task Workspace</h2>
          <p>
            Single mission-control surface for journey-based workflows. Launch guided modal tasks for
            extraction, review, comparison, and export with controlled confirmation.
          </p>
        </div>
        <div className="workspace-page__header-actions">
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
            Open legacy Document Hub
          </Button>
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.TENANCY_BUILDER)}>
            Open Tenancy Builder
          </Button>
        </div>
      </section>

      <section className="workspace-page__meta">
        <Badge tone="info">Workspace-first UI (Phase 1)</Badge>
        <Badge tone="success">Enterprise clean</Badge>
        <Badge tone="warning">Big-bang migration in progress</Badge>
      </section>

      <section className="workspace-page__grid" aria-label="Journey launcher cards">
        {JOURNEY_TASKS.map((journey) => (
          <Card key={journey.id} variant="outlined" className="workspace-task-card" as="article">
            <Card.Header>
              <h3>{journey.title}</h3>
            </Card.Header>
            <Card.Body>
              <p>{journey.description}</p>
              <div className="workspace-task-card__links">
                {journey.quickLinks.map((link) => (
                  <Button
                    key={`${journey.id}-${link.page}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(link.page)}
                  >
                    Open {link.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
            <Card.Footer>
              <Button variant="primary" onClick={() => setActiveJourneyId(journey.id)}>
                Launch Journey Modal
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </section>

      <Modal
        open={Boolean(activeJourney)}
        onClose={() => setActiveJourneyId(null)}
        title={activeJourney ? activeJourney.title : 'Journey'}
        size="lg"
      >
        <Modal.Body>
          {activeJourney ? (
            <div className="workspace-journey-modal">
              <p>{activeJourney.description}</p>
              <h4>Journey Steps</h4>
              <ol>
                {activeJourney.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <h4>Required Preview & Safety Controls (v1)</h4>
              <ul>
                {PREVIEW_CAPABILITIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setActiveJourneyId(null)}>
            Close
          </Button>
          {activeJourney?.quickLinks?.[0] ? (
            <Button
              variant="primary"
              onClick={() => {
                goToPage(activeJourney.quickLinks[0].page);
                setActiveJourneyId(null);
              }}
            >
              Start in {activeJourney.quickLinks[0].label}
            </Button>
          ) : null}
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default DocumentWorkspacePage;
