# Henry — The Record Keeper

> **AI assistant `WC-AI-003`** · the White Caves CRM real-estate document automation module.

Henry generates, verifies, and archives every official real-estate document White Caves issues — viewing forms, booking forms, tenancy contracts, addenda, invoices, key-handover checklists, government-employee bookings, and DLD offer letters — with built-in **RERA / DLD compliance checking** and a full **auditable trail**.

[![CI](https://github.com/USER/Henry/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/Henry/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-307%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.75%25-brightgreen)
![Lint](https://img.shields.io/badge/eslint-0%20warnings-brightgreen)
![Format](https://img.shields.io/badge/prettier-passing-brightgreen)
![React](https://img.shields.io/badge/react-18.3-61dafb)
![Vite](https://img.shields.io/badge/vite-5.4-646cff)

---

## ✨ Features

- **8 templates** with inline luxury print layout — each section is a collapsible `<Disclosure>` on screen, force-expanded for print.
- **Compliance engine** — every template runs against a curated catalog of RERA / DLD rules (e.g. RERA P210 mandatory disclosure, Decree 43/2013 rent-increase brackets, DLD offer-letter checklist) plus a knowledge-base evaluator. Critical / important / info severities are surfaced in the side panel.
- **AI extraction (chat dock)** — drop a PDF / image / Emirates ID and Henry suggests field updates with confidence scores. Every applied field is logged.
- **Audit log** — persisted to `localStorage` (capped at 100), groupable by date, searchable, exportable, and re-importable as JSON. Destructive operations push a 10-second toast with **Undo**.
- **Records archive** — every generated PDF is filed under `records/{YEAR}/{MONTH}/{PROPERTY}/` via the in-repo Vite dev plugin (`vite-plugins/henryRecordsApi.js`) in development or the production server (`scripts/records-server.mjs`) in deployed builds.
- **Density toggle** + `Ctrl+/` chat shortcut + `inert`-shielded backgrounds when a drawer / chat overlay is open.
- **Global toast system** with `info` / `success` / `warning` / `error` tones and inline action buttons.

---

## 🚀 Quickstart

```powershell
npm install
npm run dev          # http://localhost:5000
```

```powershell
npm test             # 141 tests, ~10s
npm run test:watch   # vitest watch mode
npm run test:coverage   # writes coverage/ + index.html
npm run lint         # 0 errors / 0 warnings
npm run lint:fix     # auto-fix what we can
npm run format       # apply Prettier to src/
npm run format:check # CI gate — fails if anything is unformatted
npm run build        # production bundle to dist/
npm run preview      # serve the built bundle
npm run serve:prod   # production server (serves dist + /api/records/*)
```

### Production runtime (filesystem persistence enabled)

```powershell
npm run build
npm run serve:prod
```

- Default host/port: `0.0.0.0:5000`
- Override with env vars:
  - PowerShell: `$env:PORT=8080; npm run serve:prod`
  - PowerShell: `$env:HOST='127.0.0.1'; npm run serve:prod`

The server provides the same records API contract used in dev:

- `GET /api/records/archive`
- `POST /api/records/archive`
- `POST /api/records/file` (binary body + `x-record-path` + `x-file-name` headers)

---

## 🧪 Testing

| Layer                                 | Tool                                   | Files  | Tests   |
| ------------------------------------- | -------------------------------------- | ------ | ------- |
| Pure logic (slices, selectors, utils) | Vitest                                 | 11     | 92      |
| Hooks (jsdom + RTL `renderHook`)      | Vitest + Testing Library               | 4      | 23      |
| Components (jsdom + RTL `render`)     | Vitest + Testing Library + `userEvent` | 3      | 26      |
| **Total**                             |                                        | **18** | **141** |

**Coverage on the included surface: 97.75% lines / 88.7% functions** (entry points and pure-render JSX templates are intentionally excluded — see `vite.config.js → test.coverage.include`).

Coverage trend over the last sessions:

| Session | Tests | Lines           |
| ------- | ----- | --------------- |
| T-20    | 53    | 48.76% baseline |
| T-21    | 98    | 68.28%          |
| T-22    | 120   | 92.67%          |
| T-23    | 141   | 97.75%          |

### Test infrastructure

- `src/test/setup.js` — installs an in-memory `localStorage` shim (jsdom's was incomplete) and runs RTL `cleanup()` after each test.
- `src/test/factories.js` — `makeDoc()` factory matching `documentSlice.initialState` for compliance tests.
- `src/test/renderWithStore.jsx` — RTL helper that mounts components inside a real `<Provider>` over a configured store with `audit + ui` slices, accepts a `preloaded` state.

---

## 🏛️ Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                       App.jsx (root)                             │
│  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐   │
│  │  TopNavbar   │  │ DocumentHubPage    │  │   ToastHost       │   │
│  │  • template  │  │ • 8 templates      │  │  • global toasts  │   │
│  │  • density   │  │ • compliance panel │  │  • inline actions │   │
│  └──────────────┘  │ • drawer (3 tabs)  │  └──────────────────┘   │
│                    │   - Compliance     │                          │
│                    │   - Archive        │                          │
│                    │   - Audit log      │                          │
│                    └───────────────────┘                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────┐
                │       Redux store        │
                │  template / document     │
                │  compliance / policyMeta │
                │  audit / sidebar / henry │
                │  archive / ocr / ui      │
                └──────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Compliance engine             │
              │  • leasingRules / buyingRules  │
              │  • knowledgeBase evaluator     │
              │  • dateUtils (RERA brackets)   │
              └───────────────────────────────┘
```

### Stack

- **React 18.3** + **Redux Toolkit 2.2** + **Vite 5.4**
- **Vitest 2.1** + **jsdom 25** + **Testing Library** (`react@16`, `jest-dom@6`, `user-event@14`) + **`@vitest/coverage-v8`**
- **`@react-pdf/renderer`** for PDF generation (lazy-loaded — large chunk warning silenced)
- **`pdfjs-dist`** + **`tesseract.js`** for OCR draft extraction

---

## 📁 Project layout

```
src/
  App.jsx, main.jsx               — entry points
  compliance/
    ruleEngine.js                 — evaluator: catalog + knowledge base
    knowledgeBase.js              — knowledge-base rules
    ruleCatalog/
      leasingRules.js             — VIEW / BOOK / GOV / ADD / TEN / INV / KEY
      buyingRules.js              — OFR (DLD offer letter)
    utils/dateUtils.js            — parseDateValue, RERA increase brackets, …
  components/
    AuditLogPanel.jsx             — searchable, exportable, importable audit
    ComplianceChecklistPanel.jsx
    Disclosure.jsx                — controlled/uncontrolled collapsible
    DocumentHubPage.jsx           — main shell + drawer
    DocumentSelector.jsx
    InfoArticlesPanel.jsx
    PrintButton.jsx, PrintLayout.jsx, TemplateLayout.jsx
    ToastHost.jsx                 — top-right toast stack
    TopNavbar.jsx
  hooks/
    useActiveTemplate.js
    useBackgroundInert.js         — ref-counted `inert` shield
    useComplianceCheck.js
    useDensity.js                 — compact / comfortable + persistence
    useDocumentData.js
    useFocusTrap.js               — drawer / dialog focus trap
    useSidebarContent.js
  store/                          — Redux slices (10 + selectors.js)
  templates/                      — 8 luxury document templates
  test/                           — setup, factories, renderWithStore helper
records/                          — generated PDFs filed by year/month/property
plans/implementation/             — IMPLEMENTATION_TRACKER.md (T-01 … T-23)
vite-plugins/henryRecordsApi.js   — dev API for filesystem record persistence
```

---

## 🤖 Henry's identity

| Field  | Value                          |
| ------ | ------------------------------ |
| AI ID  | `WC-AI-003`                    |
| Name   | Henry                          |
| Title  | The Record Keeper              |
| Module | Henry (within White Caves CRM) |
| Status | `Ready to file` (default)      |

The canonical landlord name **`MUHAMMAD NAEEM MUHAMMAD H K KHAN`** is enforced at the slice level in `documentSlice` — both `updateDocumentSection` and `setDocumentValue` re-stamp it on every write, so no chat extraction or import can overwrite it.

---

## 📜 License

Proprietary — White Caves Real Estate, Dubai.
