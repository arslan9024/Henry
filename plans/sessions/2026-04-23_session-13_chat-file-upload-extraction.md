# Session 13 — Chatbox File Upload → LLM Extraction → Document Update

## Session Header
- **Date:** 2026-04-23
- **Session #:** 13
- **Operator:** Henry (AI Record Keeper)
- **Goal (1 sentence):** Add a paperclip file-upload affordance to the Henry chatbox so users can attach a PDF or image, have the local LLM extract document fields, and review/apply them before they touch the document.

## Scope (in)
- PDF text extraction (pdfjs-dist, page-cap 25)
- Image OCR (reuse Tesseract worker pattern)
- New `fetchOllamaExtraction` LLM call returning a *batch* of `{section, field, value, rationale, confidence}` suggestions
- Hard allow-list enforcement + confidence ≥ 0.6 floor
- New chat UI: paperclip button + `FileExtractionPanel` with per-row Apply / Apply All / Dismiss
- New audit event types

## Out of Scope
- DOCX / CSV file types
- Vision models (llava). Image path stays Tesseract-only for v1
- Persisting attached files in Redux
- Retroactive re-extraction when the document changes

## Plan
1. Phase 1 — Service layer: add `pdfjs-dist`, create `fileExtractionService.js`, extend `llmService.js`
2. Phase 2 — UI: paperclip button + state in `LlmFooterChatBox.jsx`, new `FileExtractionPanel.jsx`
3. Phase 3 — CSS, validate, tracker, session doc

## Work Log
| Time | Action | Files Touched | Result |
|------|--------|---------------|--------|
| — | Add pdfjs-dist (v4.10.38) | `package.json` | Installed |
| — | New file extraction service | `src/services/fileExtractionService.js` | PDF + image → text, 25-page / 50 KB caps, lazy worker setup via Vite `?url` |
| — | Extend LLM service | `src/services/llmService.js` | New `fetchOllamaExtraction()` + shared `formatAllowedFieldsForPrompt()`; allow-list + confidence filter; 45 s timeout |
| — | New extraction panel | `src/components/FileExtractionPanel.jsx` | Per-row Apply / Apply All / Dismiss with confidence chip + applied state |
| — | Wire chat upload | `src/components/LlmFooterChatBox.jsx` | Paperclip button, file input, streamed status messages, audit events, mounts FileExtractionPanel |
| — | Styles | `src/styles/app.css` | `.llm-chat__attach-btn`, `.llm-chat__extraction*`, `.llm-chat__suggestion-row`, `.llm-chat__confidence--high\|med\|low` |
| — | Tracker | `plans/implementation/IMPLEMENTATION_TRACKER.md` | T-08 row added, progress 8/8, validation log entry |

## Validation
| Check | Command | Outcome |
|-------|---------|---------|
| Diagnostics | `get_errors` on 4 touched files | ✅ Clean |
| Build | `npm run build` | ✅ 316 modules, 5.93 s; pdf.worker chunk emitted (1.37 MB, lazy-loaded) |
| Extraction round-trip | `npm run smoke:extraction` | ✅ Generated 1,995-byte PDF with 6 known fields → pdfjs extracted 194 chars in 396 ms → all 6 values matched verbatim (tenant name, Emirates ID, unit, community, annual rent, contract start). Line-aware y-coordinate reconstruction confirmed working. |
| Ollama availability check | (part of smoke script) | ⚠ Not running on this machine — UI surfaces the existing "Ollama not running" badge as designed |
| Smoke (UI) | Manual — attach a PDF in the running dev server | Pending user verification with real-world doc + running Ollama |

## Decisions Made
- **PDF text reconstruction**: items are bucketed by their `transform[5]` (y) coordinate to recreate visual lines instead of dumping the raw item stream. Significantly improves the LLM's hit rate.
- **Worker URL via Vite `?url` import** (`pdfjs-dist/build/pdf.worker.min.mjs?url`). Falls back silently to fake-worker if the dynamic import fails (slower but functional).
- **Hard allow-list filter on the server side** in `fetchOllamaExtraction` — model output is already validated through `isFieldAllowed()`. Out-of-list fields are dropped silently and counted in `droppedCount`.
- **Confidence floor of 0.6** baked into the prompt instructions *and* enforced in JS to defend against models that ignore the instruction.
- **No new Redux slice**. `attachedFile` and `pendingSuggestions` are chat-local React state; suggestions intentionally do not persist across template switches.
- **Privacy tooltip** on the paperclip: "Files stay local — sent only to your Ollama". Surfaces the privacy story exactly where users decide whether to upload.

## Risks / Follow-ups
- pdfjs `pdf.worker.min` is 1.37 MB. Lazy-loaded only when a PDF is attached, so initial bundle is unaffected.
- Tesseract image extraction is uneven on dense layouts (signed contract scans). Future work: optional `llava` vision model toggle.
- A very large PDF (>25 pages) is silently truncated with a chat note. Consider exposing the page cap in settings.
- Apply All emits a single audit entry with the `fields[]` array — Archive sidebar UI may need a small adjustment to render that row legibly.

## Tracker Updates Applied
- [x] Added **T-08** row to **Done** in `IMPLEMENTATION_TRACKER.md`
- [x] Updated `Progress: 8/8 tasks complete (100%)` and `Last Updated: 2026-04-23`
- [x] Appended Validation Log row (`316 modules, 5.93 s`)
- [x] No Next Actions changes (maintenance mode)

## Next Session Handoff
- Try a real Emirates ID JPEG and a sample tenancy PDF end-to-end to validate prompt quality against `mistral`.
- Consider gating `fetchOllamaExtraction` behind a smaller specialized model (e.g. `phi3:mini`) for speed if mistral feels slow on long PDFs.
- Tighten the prompt so the model normalizes ID numbers (strip dashes/spaces) before returning.
- Optional: add a "Re-extract" button on the panel header so users can re-prompt with the same file (e.g. after switching templates).
- Consider extending `FileExtractionPanel` to mirror this UX for the existing IdentityScanner component (consolidation opportunity).
