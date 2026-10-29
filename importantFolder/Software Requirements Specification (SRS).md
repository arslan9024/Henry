# Software Requirements Specification (SRS)
## White Caves Real Estate - Tenancy Contract, RERA Addendum & Payment Receipt Studio

---

### Document Information
* **Project Name:** White Caves Tenancy Contract Studio
* **System Version:** 2.0.0
* **Architecture Pattern:** 5-Way Single-Purpose File Architecture (`algorithm.md`)
* **Target Runtime:** Local Client-Side Execution (`file:///`) & Local-First Microservice (`http://localhost:3001`)
* **Compliance Standards:** Dubai Land Department (DLD) Unified Tenancy Contract v1.4, Real Estate Regulatory Agency (RERA), UAE Federal Law No. 26 of 2007 (as amended by Law No. 33 of 2008).

---

## 1. Executive Summary & Purpose

The **White Caves Tenancy Contract Studio** is an enterprise-grade, client-side digital workstation engineered for UAE real estate brokerage operations. It automates the generation, calibration, verification, and multi-document vector compilation of:
1. **Document 1 (Pages 1–3):** Official Dubai Land Department (DLD) Unified Tenancy Contract.
2. **Document 2 (Pages 4–6):** 3-Page Standardized RERA Legal Addendum with 25 comprehensive clauses and dual-party signature blocks.
3. **Document 3 (Page 7):** Agency Brokerage Commission & VAT Payment Receipt (5% standard fee + 5% UAE VAT).

The studio provides an end-to-end interactive journey featuring client-side PDF stamping, real-time visual coordinate calibration, automatic renewal calculations (+1 year date advancement), KYC / Old Contract Document Intelligence (OCR / MRZ / EID), and a 3-document selective combiner.

---

## 2. Architectural Architecture & Separation Matrix

The codebase strictly complies with the **5-Way Single-Purpose File Architecture** defined in `algorithm.md`. Zero crossover is permitted between layout markup, data configurations, in-memory state, event switchboards, and computation workers.

```
css/
  styles.css                     <-- Category 1: View Presentational Styling
js/
  config/                        <-- Category 2: Metadata Guidelines & Schemas
    contract_mapper.js           (Outbound Stamping & Calibration Coordinate Matrix ONLY)
    contract_inbound_mapper.js   (Inbound Extraction Schema & Rejection Guard Dictionary ONLY)
    contract_content_config.js   (Default form presets, DLD guidelines & clauses)
    addendum_content_config.js   (25 Addendum clauses, default provisions & layout specs)
    receipt_content_config.js    (Agency fee configuration, VAT rates & receipt numbering)
    viewer_controls_config.js    (Zoom levels, page navigation bounds & nudge increments)
    upload_config.js             (Accepted MIME types, file size limits & KYC document targets)
  state/                         <-- Category 3: Live In-Memory RAM State Buffers
    workflow_engine.js           (Master session state machine, step transitions & verification gates)
    form_metrics.js              (Real-time Step 1 form fields & Page 3 clauses RAM buffer)
    addendum_data.js             (Live Step 3 Addendum fields buffer)
    receipt_data.js              (Live Step 4 Commission receipt metrics & auto-calculations)
    document_upload_state.js     (Uploaded file streams, file references & status tracking)
    contract_diff_state.js       (Side-by-side comparison buffer: Old Contract vs Form Metrics)
    mapper_storage.js            (localStorage persistence for adjusted calibration coordinates)
    template_cache.js            (Base64 embedded cache of blank DLD template)
    template_autoloader.js       (Zero-click auto-loader for Tenancy Contract Template.pdf)
    pdf_modal_state.js           (Fullscreen PDF preview modal state buffer)
  view/                          <-- Category 1: Presentational HTML Builders & Shells
    form_layout.js               (DOM builder for Step 1 input fields, chips & sections)
    sidebar_status.js            (DOM builder for Column C verification gates & deal snapshot)
    navigation_view.js           (Top stepper navigation pills & progress indicators)
    viewer_toolbar_view.js       (Column B page switcher, zoom controls & nudge button shells)
    layout_toggle_view.js        (Collapsible column controller for Column B & Column C)
    addendum_form_view.js        (DOM builder for Step 3 Addendum fields)
    document_upload_view.js      (DOM builder for Step 0/1 KYC & contract upload cards)
    contract_diff_view.js        (Side-by-side comparison modal table builder)
    pdf_modal_view.js            (Fullscreen multi-page PDF preview modal builder)
    pdf_viewer.js                (HTML5 Canvas playground view shell)
  handlers/                      <-- Category 4: Central Event Switchboards
    event_orchestrator.js        (Master DOM event listener switchboard: zero inline HTML handlers)
    pdf_drag_controller.js       (Interactive drag-and-drop & keyboard 1pt nudge event bridge)
    pdf_modal_event_handler.js   (Keyboard Esc, modal click-outside & toggle event handlers)
  engine/                        <-- Category 5: Pure Processing & Algorithmic Workers
    pdf_processor.js             (High-level PDF compilation coordinator)
    pdf_verifier.js              (Pre-compilation integrity & mandatory field validation engine)
    pdf_render_engine.js         (PDF.js page rasterization & canvas rendering worker)
    pdf_blueprint_canvas.js      (Live calibration overlays, bounding boxes & drag handles)
    addendum_engine.js           (Facade for Addendum generation)
    addendum_canvas_renderer.js  (HTML5 Canvas 2D live preview renderer for Addendum)
    addendum_pdf_builder.js      (PDF-lib binary vector page builder for Pages 4-6)
    receipt_engine.js            (Facade for Receipt generation)
    receipt_canvas_renderer.js   (HTML5 Canvas 2D live preview renderer for Payment Receipt)
    receipt_pdf_builder.js       (PDF-lib binary vector page builder for Page 7)
    contract_parser_engine.js    (Client-side PDF.js text layer parser & +1y renewal engine)
    doc_intelligence_client.js   (Connector to local Node.js microservice with client fallback)
    pdf_library_loader.js        (Safe loader for Native PDF-1.7 engine / PDFLib)
    pdf-lib.min.js               (Offline Native PDF-1.7 vector stamper & binary compiler)
    download_handler.js          (Binary Blob trigger & auto-generated file naming)
    whatsapp_sharer.js           (WhatsApp Web/App deal summary payload generator)
server/                          <-- High-Performance Local-First Document Intelligence Service
  server.js                      (Express API on :3001 with AES-256-GCM encryption)
  config/
    security_config.js           (AES-256-GCM encryption, decryption & sensitive data masking)
  controllers/
    extract_controller.js        (Document intake, auto-classification & routing controller)
  services/
    image_preprocessor.js        (sharp: grayscale, normalisation, auto-contrast & sharpening)
    ocr_engine.js                (Dual-tier: Google Cloud Vision API + local Tesseract.js worker pool)
    mrz_parser.js                (Passport TD3 & EID Back TD1 machine-readable zone parser)
    eid_parser.js                (Emirates ID Front regex 784-YYYY-NNNNNNN-X & name extractor)
    contract_parser.js           (DLD Unified Tenancy Contract anchor parser & renewal calculator)
```

---

## 3. Functional Requirements Specification

### 3.1 Streamlined 4-Phase Workflow Journey

1. **Phase 1: Deal Intake & DLD Inputs (`#step-form`)**
   * **Hero Deal Intake & Mode Selector:**
     * **Renewal Contract (`RENEWAL`):** Pre-loads returning tenant & property presets (Unit 142 Primrose, DAMAC Hills 2) and activates the +1 Year Renewal date engine.
     * **New Contract (`NEW`):** First-time tenancy setup with tenant and KYC verification.
   * **Smart KYC & Document Intelligence Upload Card (`#step1UploadRoot`):**
     * Drag-and-drop file upload for Old Tenancy Contracts, Ejari Certificates, Passports, and Emirates IDs.
     * Instant background extraction with side-by-side comparison modal (`ContractDiffView`).
   * **Complete 24 Page 1 Form Fields & 5 Page 3 Clauses:**
     * Section A (Header), Section B (Lessor), Section C (Tenant), Section D (Property with ✓ Usage Tick), Section E (Financials & Period), and Section F (Page 3 Clauses).
   * **Smart Auto-Formatting & Currency in Words (`SmartFormatter`):**
     * Real-time Emirates ID masking (`784-YYYY-NNNNNNN-X`).
     * Real-time UAE phone formatting (`+971 50 ...`).
     * Live English words conversion for Annual Rent (*"One Hundred Fifteen Thousand UAE Dirhams Only"*).
   * **1-Click "⚡ Load Demo Deal":** Rapid testing button in top navbar and header.

2. **Phase 2: RERA Legal Addendum (`#step-addendum-builder`)**
   * 25 Standard Real Estate Regulatory Agency (RERA) statutory clauses.
   * Interactive controls for Landlord/Tenant Representatives, Maintenance Threshold Cap (default: AED 500), Notice Period (default: 90 days), and special terms.
   * Real-time HTML5 2D Canvas live preview of Pages 4, 5, and 6 on the center stage.

3. **Phase 3: Cheques Schedule & Payment Receipt (`#step-receipt-builder`)**
   * **Payment Receipt (Page 7):**
     * Agency Commission = 5% of Annual Rent.
     * UAE VAT = 5% of Agency Commission.
     * Total Payable = Commission + VAT.
   * **Dynamic Cheque Schedule Generator (`ChequeScheduleView`):**
     * Selector for 1, 2, 4 (Standard UAE), 6, or 12 cheques.
     * Auto-calculates instalment due dates and amounts evenly spaced across 1 year from contract commencement.
     * Editable fields for Cheque Number and Drawn-on Bank Name.

4. **Phase 4: Studio Review, Verification & Package Export (`#step-process-export`)**
   * Deal summary card and quick page jump buttons (`P1` to `P7`).
   * **Selective 3-Document Combiner Checkboxes:**
     * `[x] 1. DLD Tenancy Contract (Pages 1–3)`
     * `[x] 2. RERA Legal Addendum (Pages 4–6)`
     * `[x] 3. Payment Receipt (Page 7)`
   * Single-click compile button: `⚡ Process Selected PDF`.
   * **Client Handover Pack Generator (`ClientHandoverView`):**
     * Formats complete move-in breakdown (Rent, Cheques, Deposit, Fee, VAT, Ejari, Initial Total Due).
     * 1-click clipboard copy and direct WhatsApp Web messaging.
   * Direct download button (`⬇️ Download Final PDF`).

### 3.2 On-Demand Precision Calibration (Column B Toolbar)
* **Zero Roadmap Roadblock:** Calibration is decoupled from the primary form journey and integrated as an on-demand precision bar (`📐 Calibrate Positions ▾`) in the Center PDF Viewer toolbar.
* Live `(X, Y)` coordinate readout in points (`pt`).
* 1pt Micro-Nudge directional buttons (`▲ Up`, `▼ Down`, `◀ Left`, `▶ Right`).
* Reset to Factory Default button and mapper export.

### 3.3 Interactive "Jump-to-Missing" Verification Gates (Column C)
* Clicking any pending gate in Column C automatically switches to the relevant step, smoothly scrolls to the required input field, focuses it, and triggers a 3-cycle pulsating attention glow (`.field-attention-pulse`).

---

## 4. Document Intelligence & OCR Extraction Engine

### 4.1 Strict Architectural Separation of Mappers
* **Outbound Stamping Mapper (`contract_mapper.js`):**
  * Dedicated strictly to PDF-lib coordinate stamping on the blank DLD template.
  * Coordinates measured from bottom-left origin in points ($595 \times 842\text{ pt}$).
* **Inbound Extraction Mapper (`contract_inbound_mapper.js`):**
  * Dedicated strictly to reading and parsing uploaded documents (Old Contracts, Ejari, Passports, Emirates IDs).
  * Defines the 29 target schema nodes, regex anchors, and the **Label Rejection Token Dictionary**.

### 4.2 Inbound Extraction Target Schema (29 Elements)
1. `contract_date` (Header)
2. `owner_name` (Lessor)
3. `lessor_name` (Lessor)
4. `lessor_id` (Lessor)
5. `lessor_email` (Lessor)
6. `lessor_phone` (Lessor)
7. `tenant_name` (Tenant)
8. `tenant_eid` (Tenant)
9. `tenant_email` (Tenant)
10. `tenant_phone` (Tenant)
11. `prop_usage` (Property - Tick Mark ✓)
12. `plot_no` (Property)
13. `building_name` (Property)
14. `property_no` (Property / Unit)
15. `property_type` (Property)
16. `property_area` (Property Area s.m)
17. `location` (Property)
18. `dewa_premises` (DEWA 9-digit / 10-digit number)
19. `date_from` (Financials - Auto +1y advance)
20. `date_to` (Financials - Auto +1y advance)
21. `contract_value` (Financials)
22. `annual_rent` (Financials)
23. `security_deposit` (Financials)
24. `mode_of_payment` (Financials - Cheque count)
25. `term_line_1` (Page 3 Clause: Integral Addendum)
26. `term_line_2` (Page 3 Clause: 1-Year Validity)
27. `term_line_3` (Page 3 Clause: Deposit Refund)
28. `term_line_4` (Page 3 Clause: Maintenance & AC)
29. `term_line_5` (Page 3 Clause: Handover & Permits)

### 4.3 +1 Year Renewal Date Advancement Algorithm
When an old contract expiry date is detected in `DD-MM-YYYY` format:
$$\text{Renewal Commencement} = \text{Old Expiry Date} + 1\text{ Day}$$
$$\text{Renewal Expiration} = \text{Renewal Commencement} + 1\text{ Year} - 1\text{ Day}$$

*Example:* Old Expiry `30-09-2025` $\rightarrow$ Suggested Renewal Period: `01-10-2025` to `30-09-2026`.

### 4.4 Label Rejection Guard
To eliminate false positives where the form label is accidentally captured as the field value, strings matching pure label tokens (e.g. `"TENANT'S NAME"`, `"ANNUAL RENT"`, `"LESSOR"`, `"EMIRATES ID"`, `"PROPERTY NO"`) are strictly dropped by the regex parser, ensuring only actual entity data is populated.

### 4.5 Side-by-Side Comparison Diff Modal
When an old contract or KYC document is processed:
1. Opens a centered modal presenting all 29 target elements grouped into 6 logical sections.
2. Displays: Current Form Value vs. Detected Value from Document vs. Status Badge (`🔄 +1 Year Renewal`, `✨ Detected`, `✔️ Same`, `📋 Keep Current`).
3. Pre-selects detected fields automatically.
4. Allows one-click bulk actions: `✨ Select Detected`, `☑️ Select All`, `⬜ Deselect All`.
5. Clicking `✓ Apply Selected to Form` updates `FormMetrics` and re-renders Step 1 & Step 3.

---

## 5. UI / UX Design & Collapsible 3-Column Studio Layout

The studio interface is divided into 3 responsive columns plus a slim sticky footer:
* **Column A (Left - Inputs & Editors):** Houses the active step form view (Home Hub, DLD Inputs, Addendum Inputs, Receipt Inputs, Summary).
* **Column B (Center - Live Stage & PDF Playground):** Houses the interactive canvas, page switcher (`P1`–`P6`), zoom controls (`50%`–`200%`), coordinate nudge controls, and fullscreen view trigger.
* **Column C (Right - Deal Status & Verification Gates):** Houses:
  * **8 Step Verification Gates:** Progressive checklist enforcing complete validation before download unlocks.
  * **3-Document Readiness Card:** Direct status indicators (`⏳ In Progress` / `🟢 Ready`) for Contract, Addendum, and Receipt.
  * **Active Deal Snapshot:** Live readouts of Contract Mode, Premises, Annual Rent, and Total Brokerage Fee.
* **Collapsible Column Controls:**
  * Top navbar buttons: `#btn-toggle-col-b` and `#btn-toggle-col-c`.
  * Column collapse buttons (`✕ Collapse`).
  * Floating uncollapse strips (`#strip-toggle-col-b` and `#strip-toggle-col-c`).
  * State remembered persistently in `localStorage`.
* **Sticky Bottom Footer:**
  * Left Cluster: `← Prev` and `Next →` navigation.
  * Center Cluster: Selective 3-Document Combiner checkboxes and `⚡ Process Selected PDF` button.
  * Right Cluster: `⬇️ Download Final PDF` (locked until verified) and `💬 Share on WhatsApp`.

---

## 6. Verification Gates & Quality Checklist

Download of the finalized contract package requires confirmation through the **8 Mandatory Verification Gates**:
1. `check-fields-p1`: Page 1 mandatory DLD parameters populated (Names, EID, Rent, Dates).
2. `check-fields-p3`: Page 3 additional clauses confirmed.
3. `check-template`: Base DLD template loaded into RAM buffer.
4. `check-engine`: Native PDF-1.7 processing runtime online.
5. `check-calibration`: Coordinate stamping verified.
6. `check-addendum`: RERA Addendum parameters confirmed (Pages 4–6).
7. `check-receipt`: Brokerage Commission & VAT calculated (Page 7).
8. `check-stamped-pdf`: Selective vector compilation successfully executed.

---

## 7. Security, Privacy & Local-First Principles

1. **Zero External Data Leakage:** The application is architected to run entirely offline on `file:///`. Sensitive passport numbers, Emirates IDs, and lease agreements are never transmitted to unauthorized third-party servers.
2. **Local-First Microservice (`server/`):**
   * Operates strictly on `localhost:3001`.
   * Employs memory buffers (`multer.memoryStorage()`) with zero disk footprint for uploaded documents.
   * AES-256-GCM authenticated encryption for sensitive tokens (`SecurityConfig`).
   * Offline Tesseract OCR utilizing bundled `server/eng.traineddata`.
3. **Pure Functional Separation:** Strict compliance with `algorithm.md` ensures that UI views cannot mutate backend logic, and engines cannot read DOM state directly.

