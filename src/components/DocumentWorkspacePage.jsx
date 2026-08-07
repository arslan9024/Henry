import React, { useEffect, useMemo, useState } from 'react';
import { APP_PAGES } from '../store/appRouteSlice';
import useAppNavigation from '../hooks/useAppNavigation';
import { Badge, Button, Card, FormField, Input, Modal, Select } from './ui';

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

const LAYOUT_PRESETS = [
  { value: 'split', label: 'Split View (recommended)' },
  { value: 'focus', label: 'Focus Mode (form-first)' },
  { value: 'compact', label: 'Compact Operations' },
];

const PAPER_SIZE_OPTIONS = [
  { value: 'A4', label: 'A4 (default)' },
  { value: 'Letter', label: 'Letter' },
  { value: 'Legal', label: 'Legal' },
];

const ORIENTATION_OPTIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

const DEFAULT_PAGE_SETUP = {
  layoutPreset: 'split',
  paperSize: 'A4',
  orientation: 'portrait',
  previewScale: 100,
  previewPaneWidth: 38,
};

const PAGE_SETUP_STORAGE_KEY = 'henry.documentWorkspace.pageSetup.v1';
const LAST_JOURNEY_STORAGE_KEY = 'henry.documentWorkspace.lastJourney.v1';

const PAGE_SETUP_PROFILES = [
  {
    id: 'standard-review',
    label: 'Standard Review',
    setup: {
      layoutPreset: 'split',
      paperSize: 'A4',
      orientation: 'portrait',
      previewScale: 100,
      previewPaneWidth: 38,
    },
  },
  {
    id: 'wide-preview',
    label: 'Wide Preview',
    setup: {
      layoutPreset: 'split',
      paperSize: 'A4',
      orientation: 'landscape',
      previewScale: 90,
      previewPaneWidth: 46,
    },
  },
  {
    id: 'compact-audit',
    label: 'Compact Audit',
    setup: {
      layoutPreset: 'compact',
      paperSize: 'Letter',
      orientation: 'portrait',
      previewScale: 95,
      previewPaneWidth: 34,
    },
  },
];

const clamp = (value, min, max, fallback) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const isValidOption = (value, options) => options.some((option) => option.value === value);

const normalizePageSetup = (candidate) => ({
  layoutPreset: isValidOption(candidate?.layoutPreset, LAYOUT_PRESETS)
    ? candidate.layoutPreset
    : DEFAULT_PAGE_SETUP.layoutPreset,
  paperSize: isValidOption(candidate?.paperSize, PAPER_SIZE_OPTIONS)
    ? candidate.paperSize
    : DEFAULT_PAGE_SETUP.paperSize,
  orientation: isValidOption(candidate?.orientation, ORIENTATION_OPTIONS)
    ? candidate.orientation
    : DEFAULT_PAGE_SETUP.orientation,
  previewScale: clamp(candidate?.previewScale, 60, 140, DEFAULT_PAGE_SETUP.previewScale),
  previewPaneWidth: clamp(candidate?.previewPaneWidth, 30, 50, DEFAULT_PAGE_SETUP.previewPaneWidth),
});

const DocumentWorkspacePage = () => {
  const { goToPage } = useAppNavigation();
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [layoutPreset, setLayoutPreset] = useState(DEFAULT_PAGE_SETUP.layoutPreset);
  const [paperSize, setPaperSize] = useState(DEFAULT_PAGE_SETUP.paperSize);
  const [orientation, setOrientation] = useState(DEFAULT_PAGE_SETUP.orientation);
  const [previewScale, setPreviewScale] = useState(DEFAULT_PAGE_SETUP.previewScale);
  const [previewPaneWidth, setPreviewPaneWidth] = useState(DEFAULT_PAGE_SETUP.previewPaneWidth);
  const [savedAt, setSavedAt] = useState(null);
  const [lastJourneyId, setLastJourneyId] = useState(null);

  const activeJourney = useMemo(
    () => JOURNEY_TASKS.find((journey) => journey.id === activeJourneyId) || null,
    [activeJourneyId],
  );

  const lastJourney = useMemo(
    () => JOURNEY_TASKS.find((journey) => journey.id === lastJourneyId) || null,
    [lastJourneyId],
  );

  const applyPageSetup = (setup) => {
    const normalized = normalizePageSetup(setup);
    setLayoutPreset(normalized.layoutPreset);
    setPaperSize(normalized.paperSize);
    setOrientation(normalized.orientation);
    setPreviewScale(normalized.previewScale);
    setPreviewPaneWidth(normalized.previewPaneWidth);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(PAGE_SETUP_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      applyPageSetup(parsed);
    } catch {
      // non-blocking: malformed persisted setup should not break workspace rendering
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cachedJourneyId = window.localStorage.getItem(LAST_JOURNEY_STORAGE_KEY);
    if (!cachedJourneyId) return;
    if (JOURNEY_TASKS.some((journey) => journey.id === cachedJourneyId)) {
      setLastJourneyId(cachedJourneyId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      layoutPreset,
      paperSize,
      orientation,
      previewScale,
      previewPaneWidth,
    };
    window.localStorage.setItem(PAGE_SETUP_STORAGE_KEY, JSON.stringify(payload));
    setSavedAt(new Date());
  }, [layoutPreset, orientation, paperSize, previewPaneWidth, previewScale]);

  const workspaceLayoutClass = `workspace-ops-layout workspace-ops-layout--${layoutPreset}`;
  const safePreviewScale = clamp(previewScale, 60, 140, DEFAULT_PAGE_SETUP.previewScale);
  const safePreviewPaneWidth = clamp(previewPaneWidth, 30, 50, DEFAULT_PAGE_SETUP.previewPaneWidth);

  const resetPageSetup = () => {
    applyPageSetup(DEFAULT_PAGE_SETUP);
  };

  const clearSavedSetup = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PAGE_SETUP_STORAGE_KEY);
    }
    setSavedAt(null);
    applyPageSetup(DEFAULT_PAGE_SETUP);
  };

  const triggerPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const applySetupProfile = (profileId) => {
    const profile = PAGE_SETUP_PROFILES.find((item) => item.id === profileId);
    if (!profile) return;
    applyPageSetup(profile.setup);
  };

  const openJourney = (journeyId) => {
    setActiveJourneyId(journeyId);
    setLastJourneyId(journeyId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_JOURNEY_STORAGE_KEY, journeyId);
    }
  };

  const clearLastJourney = () => {
    setLastJourneyId(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LAST_JOURNEY_STORAGE_KEY);
    }
  };

  return (
    <main className="workspace-page workflow-page shell-page" id="main" tabIndex={-1}>
      <section className="workspace-page__header workflow-page__header">
        <div className="workflow-page__header-copy">
          <h2>Document Operations Task Workspace</h2>
          <p>
            Single mission-control surface for journey-based workflows. Launch guided modal tasks for
            extraction, review, comparison, and export with controlled confirmation.
          </p>
        </div>
        <div className="workspace-page__header-actions workflow-page__header-actions">
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

      {lastJourney ? (
        <section className="workspace-last-journey" aria-label="Resume last journey">
          <p>
            <strong>Resume:</strong> {lastJourney.title}
          </p>
          <div className="workspace-last-journey__actions">
            <Button variant="secondary" size="sm" onClick={() => openJourney(lastJourney.id)}>
              Re-open journey
            </Button>
            {lastJourney.quickLinks?.[0] ? (
              <Button variant="ghost" size="sm" onClick={() => goToPage(lastJourney.quickLinks[0].page)}>
                Continue in {lastJourney.quickLinks[0].label}
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={clearLastJourney}>
              Clear
            </Button>
          </div>
        </section>
      ) : null}

      <section
        className={workspaceLayoutClass}
        style={{ '--workspace-preview-width': `${safePreviewPaneWidth}%` }}
        aria-label="Document workspace layout"
      >
        <div className="workspace-ops-layout__main">
          <Card variant="outlined" className="workspace-page-setup" as="article">
            <Card.Header>
              <h3>Document View Setup</h3>
            </Card.Header>
            <Card.Body>
              <div className="workspace-page-setup__grid">
                <FormField label="Layout preset">
                  <Select
                    value={layoutPreset}
                    onChange={(e) => setLayoutPreset(e.target.value)}
                    options={LAYOUT_PRESETS}
                  />
                </FormField>
                <FormField label="Paper size">
                  <Select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    options={PAPER_SIZE_OPTIONS}
                  />
                </FormField>
                <FormField label="Orientation">
                  <Select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    options={ORIENTATION_OPTIONS}
                  />
                </FormField>
                <FormField label="Preview scale (%)">
                  <Input
                    type="number"
                    min="60"
                    max="140"
                    step="5"
                    value={previewScale}
                    onChange={(e) =>
                      setPreviewScale(clamp(e.target.value, 60, 140, DEFAULT_PAGE_SETUP.previewScale))
                    }
                  />
                </FormField>
              </div>

              <FormField label="Preview pane width">
                <input
                  type="range"
                  min="30"
                  max="50"
                  value={safePreviewPaneWidth}
                  onChange={(e) =>
                    setPreviewPaneWidth(clamp(e.target.value, 30, 50, DEFAULT_PAGE_SETUP.previewPaneWidth))
                  }
                />
              </FormField>

              <div className="workspace-page-setup__actions">
                <Button variant="ghost" onClick={resetPageSetup}>
                  Reset defaults
                </Button>
                <Button variant="ghost" onClick={clearSavedSetup}>
                  Clear saved setup
                </Button>
                <Button variant="secondary" onClick={triggerPrint}>
                  Print / Save as PDF
                </Button>
              </div>

              <p className="workspace-page-setup__saved-status" aria-live="polite">
                {savedAt ? `Setup autosaved at ${savedAt.toLocaleTimeString()}` : 'Setup not saved yet'}
              </p>

              <div className="workspace-page-setup__profiles" aria-label="Page setup profiles">
                {PAGE_SETUP_PROFILES.map((profile) => (
                  <Button
                    key={profile.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => applySetupProfile(profile.id)}
                  >
                    {profile.label}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

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
                  <Button variant="primary" onClick={() => openJourney(journey.id)}>
                    Launch Journey Modal
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </section>
        </div>

        <aside className="workspace-ops-layout__preview" aria-label="Document preview and export panel">
          <Card variant="elevated" className="workspace-preview-card">
            <Card.Header>
              <h3>Preview & Export Console</h3>
            </Card.Header>
            <Card.Body>
              <div className="workspace-preview-card__meta">
                <Badge tone="info">{paperSize}</Badge>
                <Badge tone="neutral">{orientation}</Badge>
                <Badge tone="success">Scale {safePreviewScale}%</Badge>
                <Badge tone="warning">Pane {safePreviewPaneWidth}%</Badge>
              </div>

              <div className="workspace-preview-card__canvas" role="img" aria-label="Document preview area">
                <div
                  className="workspace-preview-card__sheet"
                  style={{ '--preview-scale': safePreviewScale / 100 }}
                >
                  <p>Preview pane ready for generated documents and uploaded source files.</p>
                </div>
                <small>
                  Tip: use the Tenancy Builder export journey for final package generation, then return here
                  for cross-workflow review.
                </small>
              </div>

              <div className="workspace-preview-card__actions">
                <Button variant="secondary" onClick={() => goToPage(APP_PAGES.TENANCY_BUILDER)}>
                  Open package builder
                </Button>
                <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
                  Open preview/print tools
                </Button>
                <Button variant="ghost" onClick={() => goToPage(APP_PAGES.TITLE_DEED)}>
                  Open document scanner
                </Button>
              </div>
            </Card.Body>
          </Card>
        </aside>
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
