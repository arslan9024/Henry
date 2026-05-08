# Henry — The Record Keeper

> **Module:** `WC-AI-003` · White Caves Real Estate L.L.C  
> **Role:** AI-assisted real-estate document operations assistant  
> **Policy Version:** 2026.04  
> **Compliance Scope:** DLD / RERA (Dubai, UAE)

---

## What Is Henry?

**Henry** is the document automation and record-keeping module for the White Caves CRM platform. Henry handles the full lifecycle of every official document issued by White Caves Real Estate:

1. **Generation** — fill fields manually, or ask Henry via AI chat / file extraction
2. **Compliance** — live DLD/RERA rule evaluation before signing or printing
3. **Preview** — A4-faithful PDF preview rendered in-browser before final export
4. **Export** — high-quality PDF generation archived under `records/{YEAR}/{MONTH}/{PROPERTY}/`
5. **Audit** — every action (field edit, compliance check, PDF export, draft save) is logged

---

## Capabilities

| Capability | Description |
|---|---|
| **9 document templates** | Viewing agreement, booking (standard + government), tenancy contract, addendum, invoice, key handover, offer letter, salary certificate |
| **AI chat (Ask Henry)** | Natural-language field updates via local Ollama (`llama-3.1-8b-instant`) or cloud Groq API |
| **File extraction** | Upload a PDF, image, or Emirates ID photo — Henry reads the text and suggests matching field values with confidence scores |
| **Compliance engine** | 15+ live rules drawn from RERA P210, Decree 43/2013, Law 26/2007, and DLD checklists |
| **Print preview** | Toggle between edit form and A4 print layout in a single click (navbar ▶ 👁 Preview) |
| **Empty template download** | Download a blank PDF of any supported template to fill in manually |
| **Draft saving** | Snapshot the current document to the archive without triggering a PDF download |
| **Archive** | Every generated PDF is catalogued with tenant, unit, copy number, and creation date |
| **Audit trail** | Searchable, filterable, exportable JSON log of all events; supports import/export |
| **Undo** | Destructive actions (clear audit log, import replace) push a 10-second toast with undo |
| **Dark/light/system theme** | Synced CSS variables + MUI theme via `HenryThemeProvider` |
| **Compact/comfortable density** | All form fields, tables, and panels adapt via a CSS data-attribute |
| **Command palette** | `Ctrl+K` opens a fuzzy-search overlay: templates, archive entries, shortcuts |
| **Identity scanner** | Photograph or upload an Emirates ID; OCR field pre-fill for tenant blocks |

---

## User Workflow

```
1. SELECT TEMPLATE
   ↓ Left sidebar → Templates → pick from 9 document types
   ↓ or Ctrl+K → type template name → Enter

2. FILL FIELDS  (three paths, can be combined)
   a. Manual — expand each Disclosure section, type into fields
   b. AI chat — click 💬 in ChatDock (or ⌘ in the navbar) → "Set tenant name to Ahmed bin Mohammed"
   c. File extraction — attach PDF/image in chat → Henry reads and suggests fields

3. COMPLIANCE CHECK
   ↓ Navbar → ✅ Compliance  (or footer Compliance Check button)
   ↓ Review Critical / Important / Info warnings in the right-hand drawer
   ↓ Acknowledge with the "Reviewed by operations/compliance" checkbox

4. PREVIEW
   ↓ Navbar → 👁 Preview  (or footer → Toggle Print Preview)
   ↓ A4 vector preview renders — inspect page layout before exporting

5. EXPORT
   ↓ Footer → Generate PDF  (high-quality react-pdf export)
      or Save Draft (archive snapshot without download)
      or Legacy Print (browser print dialog)
   ↓ PDF is auto-archived to records/{YEAR}/{MONTH}/{PROPERTY}/
   ↓ Audit entry created (PDF_GENERATED / DRAFT_SAVED)

6. REVIEW HISTORY
   ↓ Navbar → 🗂 Archive  (or footer → Archive)
   ↓ Navbar → 📜 Audit    (or footer → Audit)
```

---

## Document Definitions

### 1. Property Viewing Agreement (DLD/RERA P210)

**Template key:** `viewing`  
**Regulatory basis:** RERA P210 (mandatory real-estate viewing disclosure form)  
**Government-issued:** Yes  
**PDF support:** Yes

**Purpose:** Confirms the tenant/buyer has viewed a specific property and acknowledges the broker's details, the property description, and the viewing schedule.

**Key fields:**

| Section | Field | Description |
|---|---|---|
| `broker` | `companyName`, `brokerName`, `orn`, `brn`, `email`, `contactNo`, `reraCardNo` | Licensed broker details |
| `property` | `unit`, `community`, `description`, `floorArea`, `parkingCount`, `status` | Property specification |
| `tenant` | `fullName`, `contactNo`, `email`, `nationalId` | Client / viewer identity |
| `viewing` | `viewingDate`, `viewingTime` | Scheduled viewing |

**Compliance rules enforced:**
- Broker ORN / BRN required
- Tenant Emirates ID recommended
- Viewing date and time required

---

### 2. Booking Form (Standard Leasing)

**Template key:** `booking`  
**Government-issued:** No  
**PDF support:** Yes

**Purpose:** Records an offer to lease with financial terms, payment schedule, and property details. Precedes the formal tenancy contract.

**Key fields:** property details, tenant identity, annual rent, payment cheque schedule, deposit amounts, duration.

---

### 3. Government Office Leasing Quotation

**Template key:** `bookingGov`  
**Government-issued:** Yes (DLD-aligned)  
**PDF support:** Yes

**Purpose:** Booking form variant tailored for government entity tenants. Includes additional identity fields (employment authority, civil ID, government department).

---

### 4. Standard Tenancy Addendum (RERA)

**Template key:** `addendum`  
**Regulatory basis:** RERA standard addendum clauses  
**Government-issued:** Yes  
**PDF support:** Yes

**Purpose:** Amendment or supplementary clauses attached to an existing tenancy contract. Captures additional terms agreed between landlord and tenant post-signing.

**Key fields:**

| Section | Field | Description |
|---|---|---|
| `addendum` | `addendumDate`, `originalContractDate`, `addendumNo` | Identification of the addendum |
| `addendum` | `clauses` | Array of free-text clause strings |

**Validation schema:** `addendumFormSchema` enforces contract date and addendum date.

---

### 5. Tenancy Contract (DLD Ejari)

**Template key:** `tenancy`  
**Regulatory basis:** Law 26/2007 (Regulating Relationship Between Landlords and Tenants in Dubai) · Decree 43/2013 (Rent Increase)  
**Government-issued:** Yes (Ejari-compatible)  
**PDF support:** Yes

**Purpose:** The primary binding tenancy agreement that must be registered in Ejari (DLD's online tenancy registration system). Captures all parties, financial terms, property specification, additional clauses, and signatures.

**Key fields:**

| Section | Field | Description |
|---|---|---|
| `landlord` | `name`, `poBox`, `contactNo` | Fixed canonical landlord; `name` is write-protected |
| `tenant` | `fullName`, `emiratesId`, `nationality`, `email`, `contactNo` | Tenant identification |
| `property` | `unit`, `community`, `type`, `floorArea`, `parkingCount` | Property specification |
| `payments` | `annualRent`, `noOfInstallments`, `contractStartDate`, `contractEndDate`, `depositAmount`, `agencyFee` | Financial terms |
| `tenancy` | `additionalTerms` | Array of additional clause strings |

**Compliance rules enforced:**
- Emirates ID format validation (784-YYYY-XXXXXXX-X)
- Rent increase bracket check (Decree 43/2013 index)
- 90-day notice window for rent increase
- RERA registration reminder

**Validation schema:** `tenancyFormSchema`

---

### 6. Invoice

**Template key:** `invoice`  
**Government-issued:** No  
**PDF support:** Yes

**Purpose:** Payment demand document for agency fees, renewal charges, maintenance, or miscellaneous services. Auto-calculates line-item totals and VAT.

**Key fields:** `invoice.invoiceNo`, `invoice.invoiceDate`, `invoice.lineItems` (array: description, qty, unitPrice), `invoice.vatRate`.

---

### 7. Key Handover and Maintenance Confirmation

**Template key:** `keyHandover`  
**Government-issued:** Yes (DLD-aligned)  
**PDF support:** Yes

**Purpose:** Confirms physical handover of keys and any maintenance snagging items noted at handover. Both tenant and landlord sign.

**Key fields:** property unit, tenant name, landlord name, handover date, number of keys, meter readings, snagging notes, signatures.

---

### 8. Property Offer Letter (Buying)

**Template key:** `offer`  
**Government-issued:** No  
**PDF support:** No (intentionally disabled — offer letters are sensitive negotiations and must not be auto-exported)

**Purpose:** Formal written offer to purchase a property. Outlines offer price, payment terms, validity period, and conditions precedent.

---

### 9. Salary Certificate

**Template key:** `salaryCertificate`  
**Government-issued:** Yes (employer-issued; used for Ejari / bank requirements)  
**PDF support:** Yes

**Purpose:** Confirms an employee's monthly salary, position, and employment status for use in tenancy or financing applications.

**Key fields:**

| Section | Field | Description |
|---|---|---|
| `salaryCertificate` | `employeeName`, `designation`, `basicSalary`, `allowances`, `totalSalary` | Employment and compensation |
| `salaryCertificate` | `issueDate`, `issuedTo` | Certificate metadata |
| `company` | `name`, `dedLicense` | Issuing company identity |

---

## Document Data Model

All templates share a **single Redux document slice** (`src/store/documentSlice.js`). Every section maps to a top-level key:

```
document
├── company        → DED-licensed company identity (read-mostly)
├── broker         → Broker / agent details
├── property       → Physical property description
├── tenant         → Tenant / client identity
├── landlord       → Landlord details (name is write-protected to canonical value)
├── payments       → Financial terms (rent, deposit, schedule)
├── viewing        → Viewing date/time
├── renewal        → Renewal terms and notice tracking
├── occupancy      → Shared housing, occupant registration
├── eviction       → Eviction notice tracking
├── addendum       → Addendum clauses (array)
├── tenancy        → Tenancy-specific clauses (array) + Ejari meta
├── invoice        → Invoice line items and VAT
├── keyHandover    → Handover checklist items
└── salaryCertificate → Employee salary details
```

Field updates are dispatched via `setDocumentValue({ section, field, value })`. The AI chat's `ALLOWED_FIELDS` list is auto-derived from `DOCUMENT_SCALAR_FIELDS` (non-array fields only), so **any new scalar field added to `initialState` is automatically available to Henry**.

---

## AI Field Recognition

Henry uses two mechanisms to read and update document fields:

### Chat-based updates (natural language)
- **Prompt:** "Set tenant full name to Ahmed bin Mohammed"
- **Provider:** Local Ollama (uses the Ollama `DEFAULT_MODEL`) or cloud Groq API (uses `GROQ_DEFAULT_MODEL`; configurable in settings)
- **Output:** Structured JSON `{ section, field, value, rationale }` — surfaced as a pending suggestion with Apply / Dismiss buttons
- **Streaming:** Tokens stream in real-time; partial responses shown while Henry thinks

### File extraction (PDF / image / Emirates ID)
- **Trigger:** Click 📎 in the Ask Henry chat dock
- **Processing:** Text extracted client-side via `pdf.js` (PDF) or `Tesseract.js` (images)
- **Output:** Array of `{ section, field, value, confidence }` suggestions shown in `FileExtractionPanel`
- **Apply all / selective:** Each suggestion can be applied individually or all at once

---

## Compliance Engine

The compliance engine (`src/compliance/ruleEngine.js`) evaluates every document in real-time against a curated rule catalog (`src/data/KnowledgeBase.json`).

### Rule severities

| Severity | Meaning | Example |
|---|---|---|
| `critical` | Must be resolved before submission | Missing Emirates ID for Ejari registration |
| `important` | Should be resolved; may cause rejection | Rent increase exceeds Decree 43/2013 bracket |
| `info` | Advisory; best practice recommendation | Ejari registration reminder |

### Rules catalogue highlights

| Rule ID | Regulatory basis | Checks |
|---|---|---|
| `RERA-P210-001` | RERA P210 | Mandatory broker ORN/BRN on viewing forms |
| `DLD-EJARI-001` | DLD Ejari | Emirates ID format (784-YYYY-XXXXXXX-X) |
| `DECREE-43-001` | Decree 43/2013 | Rent increase bracket vs. RERA index |
| `RENEWAL-NOTICE-001` | Law 26/2007 Art. 14 | 90-day notice window for rent changes |
| `SHARED-HOUSING-001` | Law 26/2007 | Permit required for shared housing |

---

## Architecture Overview

```
src/
├── components/          → UI components (TopNavbar, DocumentHubPage, ChatDock, …)
│   └── ui/              → Primitive design-system components (Button, Input, Modal, …)
├── store/               → Redux slices (document, template, audit, archive, compliance, uiCommand, …)
├── templates/           → 9 document template React components + schemas
│   └── schemas/         → Validation schemas for form-driven templates
├── pdf/                 → react-pdf renderers (one per template)
├── compliance/          → Rule engine + knowledge-base evaluator
├── services/            → LLM service (Ollama + Groq), file extraction service
├── hooks/               → Custom React hooks
├── records/             → Archive path builder + filesystem persistence plugin
└── styles/              → Global CSS (design tokens, dark mode, component overrides)
```

### Key Redux slices

| Slice | Purpose |
|---|---|
| `document` | Single shared document state for all templates |
| `template` | Active template key |
| `uiCommand` | Sidebar, drawer, chat, preview mode, print trigger |
| `compliance` | Live warnings per template |
| `audit` | Ordered audit log (capped at 100, persisted to localStorage) |
| `archive` | PDF archive entries (persisted to localStorage) |
| `ui` | Toasts, autosave status, print preview rendering state |
| `policyMeta` | Policy version and review date |
| `henry` | Henry's own identity (name, title, AI ID, module) |

---

## Persistence

| Data | Storage | Limit |
|---|---|---|
| Audit log | `localStorage` (`henry.audit.logs`) | 100 entries |
| Archive entries | `localStorage` (`henry.archive.entries`) | Unlimited |
| Chat history | `localStorage` (`henry.chat.history`) | 50 messages |
| Left rail state | `localStorage` (`henry.ui.leftRail`) | — |
| Footer bar state | `localStorage` (`henry.ui.footerBar`) | — |
| LLM provider | `localStorage` (`henry.llm.provider`) | — |
| Groq API key | `localStorage` (`henry.llm.groqApiKey`) | — |
| Generated PDFs | `records/{YEAR}/{MONTH}/{PROPERTY}/` via dev plugin or production server | Unlimited |

---

## Development

```bash
# Install
npm install

# Start dev server (includes Vite plugin for /api/records)
npm run dev

# Run all tests
npx vitest run

# Lint
npm run lint

# Build
npm run build
```

### Adding a new template

1. Create `src/templates/MyTemplate.jsx` — read from `useSelector(state => state.document)`
2. Create `src/pdf/MyTemplateDocument.jsx` — react-pdf renderer
3. Add entry to `src/templates/registry.js` (`TEMPLATE_CONFIG`)
4. Add the template key to the `pickPdfComponent` switch in `src/pdf/generateQuotationPdf.js`
5. Add any new scalar fields to `src/store/documentSlice.js` `initialState` — they are auto-included in the LLM's allowed field list

### Adding a compliance rule

1. Open `src/data/KnowledgeBase.json` — add a rule object with `id`, `title`, `severity`, `sourceTitle`, `citation`
2. Open `src/compliance/ruleEngine.js` — add an evaluator function
3. Register the evaluator in `RULE_EVALUATORS`
4. Add a test in `src/compliance/ruleEngine.test.js`

---

## Glossary

| Term | Definition |
|---|---|
| **DLD** | Dubai Land Department — the government body that registers all real-estate transactions in Dubai |
| **RERA** | Real Estate Regulatory Agency — the regulatory arm of DLD that sets leasing standards |
| **Ejari** | Arabic for "my rent" — DLD's mandatory tenancy registration system |
| **P210** | RERA form number for the Property Viewing Agreement |
| **Decree 43/2013** | Dubai Executive Council decree setting maximum annual rent-increase percentages |
| **ORN** | Office Registration Number — RERA-issued number for licensed brokerages |
| **BRN** | Broker Registration Number — RERA-issued number for individual brokers |
| **Emirates ID** | UAE national identity card (format: 784-YYYY-XXXXXXX-X) |
| **Addendum** | Supplementary document amending an existing tenancy contract |
| **Snagging** | Defects or maintenance issues noted at property handover |
| **Ask Henry** | The floating AI chat panel in the bottom-right corner (ChatDock) |
| **Command Palette** | `Ctrl+K` overlay for quickly switching templates, opening drawers, or triggering actions |
