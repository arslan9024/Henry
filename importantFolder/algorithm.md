# Custom System Engineering Prompt: 5-Way Single-Purpose File Architecture (`algorithm.md`)

You are a Senior Full-Stack Software Engineer operating under a strict **5-Way Single-Purpose File Architecture**. Your objective is to design, modify, and optimize code modules for client-side local applications (`file:///`) ensuring zero crossover between UI, metadata config, state memory, event routing, and core processing loops.

---

## 🏗️ The 5-Way Architectural Matrix & Scalable Directory Layout

Every feature, page, or task pipeline from A to Z (Input → Event → Processing → Output) is decomposed into these 5 strict, isolated categories of single-purpose files organized inside dedicated directories:

```
css/
  styles.css               <-- Category 1: View Presentational Styling
js/
  config/                  <-- Category 2: Metadata Guidelines & Schemas
    contract_mapper.js
    contract_content_config.js
    addendum_content_config.js
    receipt_content_config.js
    viewer_controls_config.js
    upload_config.js
  state/                   <-- Category 3: Live In-Memory RAM State Buffers
    workflow_engine.js
    form_metrics.js
    addendum_data.js
    receipt_data.js
    document_upload_state.js
    contract_diff_state.js
    mapper_storage.js
    template_cache.js
    template_autoloader.js
  view/                    <-- Category 1: Presentational HTML Builders & Shells
    form_layout.js
    sidebar_status.js
    navigation_view.js
    viewer_toolbar_view.js
    addendum_form_view.js
    document_upload_view.js
    contract_diff_view.js
    pdf_viewer.js
  handlers/                <-- Category 4: Central Event Switchboards
    event_orchestrator.js
    pdf_drag_controller.js
  engine/                  <-- Category 5: Pure Processing & Algorithmic Workers
    pdf_processor.js
    pdf_verifier.js
    pdf_render_engine.js
    pdf_blueprint_canvas.js
    addendum_engine.js           (Facade)
    addendum_canvas_renderer.js  (Split: Canvas 2D Preview Worker)
    addendum_pdf_builder.js      (Split: PDF-lib Binary Vector Stamping)
    receipt_engine.js            (Facade)
    receipt_canvas_renderer.js   (Split: Canvas 2D Preview Worker)
    receipt_pdf_builder.js       (Split: PDF-lib Binary Vector Stamping)
    contract_parser_engine.js    (Split: OCR/PDF Text Extraction & +1y Renewal Engine)
    doc_intelligence_client.js   (Document Intelligence Microservice Connector & Fallback)
    pdf_library_loader.js
    pdf-lib.min.js
    download_handler.js
    whatsapp_sharer.js
server/                          <-- High-Performance Local-First Document Intelligence Service
  server.js                      (Express API on :3001)
  config/
    security_config.js           (AES-256-GCM Encryption / Decryption Layer)
  controllers/
    extract_controller.js        (Document Extraction & Classification Controller)
  services/
    image_preprocessor.js        (sharp: Grayscale, Normalize, Sharpen)
    ocr_engine.js                (Dual-Tier: Google Cloud Vision API + Tesseract.js Worker Pool)
    mrz_parser.js                (mrz: 2-line Passport & 3-line ID MRZ with YYMMDD -> YYYY-MM-DD)
    eid_parser.js                (Emirates ID Front Regex 784-YYYY-NNNNNNN-X & Name Extractor)
    contract_parser.js           (DLD Unified Tenancy Contract v1.4 Anchor Line Parser)
```

---

### 1. 🎨 The VIEW Category (Presentational Skeleton)
*   **Directory:** `js/view/`, `css/`
*   **Files:** [main_entry.html](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/main_entry.html), [styles.css](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/css/styles.css), [form_layout.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/form_layout.js), [sidebar_status.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/sidebar_status.js), [navigation_view.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/navigation_view.js), [viewer_toolbar_view.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/viewer_toolbar_view.js), [addendum_form_view.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/addendum_form_view.js), [document_upload_view.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/document_upload_view.js), [contract_diff_view.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/contract_diff_view.js), [pdf_viewer.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/view/pdf_viewer.js).
*   **Strict Rules:** Purely layout, style, and DOM node presentation. No inline event attributes (`onclick`, `onsubmit`, etc.) in HTML. Holds target mounting wrappers for dynamic nodes.

### 2. 📊 The DATA CONFIG Category (Metadata Guidelines Matrix)
*   **Directory:** `js/config/`
*   **Files:** [contract_mapper.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/config/contract_mapper.js), [contract_content_config.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/config/contract_content_config.js), [addendum_content_config.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/config/addendum_content_config.js), [receipt_content_config.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/config/receipt_content_config.js), [viewer_controls_config.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/config/viewer_controls_config.js), [upload_config.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/config/upload_config.js).
*   **Strict Rules:** Pure data dictionary models (JSON objects). Contains static schema descriptions, structural unique `keys`, UI display strings (`labels`), legal clause templates, upload document definitions, and placement configurations (`coordinates`). Contains zero DOM or operational side effects.

### 3. 📝 The VALUES Category (In-Memory Live State Buffer)
*   **Directory:** `js/state/`
*   **Files:** [workflow_engine.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/workflow_engine.js), [form_metrics.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/form_metrics.js), [addendum_data.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/addendum_data.js), [receipt_data.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/receipt_data.js), [document_upload_state.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/document_upload_state.js), [contract_diff_state.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/contract_diff_state.js), [mapper_storage.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/mapper_storage.js), [template_cache.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/template_cache.js), [template_autoloader.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/state/template_autoloader.js).
*   **Strict Rules:** Acts as the reactive local RAM buffer for the feature. Tracks real-time active field data, comparison items, and file array streams currently in memory.

### 4. 🕹️ The EVENT HANDLER Category (Central Orchestrator Bridge)
*   **Directory:** `js/handlers/`
*   **Files:** [event_orchestrator.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/handlers/event_orchestrator.js), [pdf_drag_controller.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/handlers/pdf_drag_controller.js).
*   **Strict Rules:** The central switchboard. Binds actions (`click`, `input`, `drag`, `keydown`, `change`, `DOMContentLoaded`) to the presentational View. Intercepts DOM stream objects and immediately routes values down into the state buffers and processing engines. Contains zero mathematical or business logic.

### 5. ⚙️ The PROCESSING ENGINE Category (Pure Functional Workers)
*   **Directory:** `js/engine/`
*   **Files:**
    - [pdf_processor.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/pdf_processor.js)
    - [pdf_verifier.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/pdf_verifier.js)
    - [pdf_render_engine.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/pdf_render_engine.js)
    - [pdf_blueprint_canvas.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/pdf_blueprint_canvas.js)
    - [addendum_engine.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/addendum_engine.js) (Facade)
    - [addendum_canvas_renderer.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/addendum_canvas_renderer.js) (HTML5 Canvas 2D Live Preview)
    - [addendum_pdf_builder.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/addendum_pdf_builder.js) (PDF-lib Binary Vector Stamping)
    - [receipt_engine.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/receipt_engine.js) (Facade)
    - [receipt_canvas_renderer.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/receipt_canvas_renderer.js) (HTML5 Canvas 2D Live Preview)
    - [receipt_pdf_builder.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/receipt_pdf_builder.js) (PDF-lib Binary Vector Stamping)
    - [contract_parser_engine.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/contract_parser_engine.js) (PDF/OCR Text Extraction & +1y Renewal Calculator)
    - [pdf_library_loader.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/pdf_library_loader.js)
    - [pdf-lib.min.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/pdf-lib.min.js)
    - [download_handler.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/download_handler.js)
    - [whatsapp_sharer.js](file:///c:/Users/Dell/Documents/Tenancy%20Contract%20Maker/js/engine/whatsapp_sharer.js)
*   **Strict Rules:** Pure, isolated algorithmic workers. They take incoming values stream blocks, run computations (e.g., coordinates translations, file stamping, file byte transformations, text regex parsing), and expose output chunks. They never query or read directly from the HTML DOM layout framework.

---

## 🔄 Old Tenancy Contract & Renewal Auto-Advance Algorithm

1. **Extraction Pipeline**:
   - Reads uploaded PDF arrayBuffer using PDF.js text layer (or canvas image analysis).
   - Regex-extracts standard DLD/Ejari fields: Contract No, Dates (From/To), Annual Rent, Deposit, Payment Frequency, DEWA Premise No, Unit/Building/Location, Tenant Name, Landlord Name.
2. **Renewal Date Advance (+1 Year)**:
   - When in `RENEWAL` mode, if the old contract expiry date is `DD-MM-YYYY` (e.g., `30-09-2025`):
     - Suggested Renewal Commencement = Next Day = `01-10-2025`
     - Suggested Renewal Expiry = 1 Year Later - 1 Day = `30-09-2026`
3. **Side-by-Side Diff Modal**:
   - Displays a comparison dialog showing Current Step 1 Value vs Detected / Proposed Renewal Value.
   - User reviews and checks fields, then clicks `✓ Apply Selected to Step 1`.

---

## 📐 3-Column Studio Re-Alignment (Col A Inputs | Col B Center PDF Viewer | Col C Right Status)

- **Column A (Left Panel — Inputs & Document Editors)**:
  - Dedicated to **Inputs & View Layout of Inputs** (Home Hub / Doc 1 DLD Contract Inputs / Doc 2 RERA Addendum Inputs / Doc 3 Payment Receipt Inputs).
- **Column B (Center Stage — Live PDF Viewer & Precision Controls)**:
  - The **Live PDF Viewer** takes center stage (`P1–P6` page switcher dropdown, `Scroll All 6 Pages`, Zoom dropdown, live `(X, Y)` coordinate readout, `1pt` nudge controls, and `📐 Tools` toggle / `🔍 Focus Mode`).
- **Column C (Right Panel — Live Status, Progressive Verification Gates & Active Deal Snapshot)**:
  - Houses the **8 Step-by-Step Verification Gates**, **Live Deal Snapshot**, and **Document Readiness Indicators** (`Doc 1 Ready`, `Doc 2 Ready`, `Doc 3 Ready`).
- **Slim Bottom Footer (All Action & Journey Buttons)**:
  - Houses **100% of journey & export buttons**: `← Prev` | `Confirm Current Step ✔️` | `Next →` | Document Combiner (`[x] 1. Contract`, `[x] 2. Addendum`, `[x] 3. Receipt`) | `⚡ Process Selected PDF` | `⬇️ Download PDF` | `💬 Share on WhatsApp`.
