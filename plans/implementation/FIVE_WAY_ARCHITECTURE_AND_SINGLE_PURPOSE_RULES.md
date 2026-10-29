# White Caves Real Estate — 5-Way File Category & Single-Purpose Architecture Rules

**Standard Mandatory Project Specification**  
**Audience:** All engineers, AI agents, subagents, and reviewers working on Henry.

---

## 1. The 5-Way File Categorization Rule

Every folder, module, and feature in Henry must strictly partition its files across these 5 distinct categories:

| Category | Type & Role | Location / Suffix | Strict Constraints |
| :---: | :--- | :--- | :--- |
| **Category 1** | **View / Presentation** | `src/components/**/<Name>.jsx` | • **Strictly &le; 120 lines per file**<br>• **Zero inline CSS (`style={{}}` strictly prohibited)**<br>• Must reuse shared components from `src/components/ui/`<br>• Focus on rendering JSX and user event delegation only |
| **Category 2** | **Business Logic / Hooks** | `src/hooks/**/use<Name>.js`<br>`src/utils/**` | • Pure functions, custom hooks, mathematical calculators (PDC math, date math, gratuity)<br>• Reusable formatting and validation logic<br>• Zero JSX rendering |
| **Category 3** | **In-Memory State** | `src/store/**/<name>Slice.js` | • Redux Toolkit slices, action creators, reducers<br>• Memoized Reselect selectors (`createSelector`)<br>• Immutable updates only |
| **Category 4** | **Services, Storage & I/O** | `src/services/**/<name>Service.js` | • Client-side IndexedDB vault operations (`documentVaultService.js`)<br>• PDF-Lib rendering and compilation engines<br>• Tesseract OCR and Machine Readable Zone (MRZ) parsers<br>• Zero DOM / JSX dependencies |
| **Category 5** | **Config, Schemas & Constants** | `src/config/**`<br>`src/templates/schemas/**`<br>`src/constants/**` | • DLD 24-field coordinate registries<br>• RERA statutory clause blueprints<br>• UAE Federal laws, Decrees, and regulatory metadata<br>• Immutable configuration objects |

---

## 2. The Single-Purpose File Rule

1. **One Responsibility:** A file must do exactly one thing. If a component handles both form inputs and export logic, it must be decomposed into an input component, an export hook, and a view action component.
2. **Strict Size Budget:** No file may exceed **120 lines**. If a file approaches 100 lines, it is a candidate for splitting into modular subcomponents or custom hooks.
3. **Component Reusability & De-duplication:** 
   - Never duplicate buttons, input fields, badges, tabs, or modal containers.
   - Always consume standard UI primitives (`Button`, `Card`, `Badge`, `Tabs`, `Input`, `Select`, `Modal`, `Disclosure`).
4. **Need-to-Know Isolation:**
   - UI/UX refactors and styling enhancements touch **Category 1 (View)** only.
   - Categories 2, 3, 4, and 5 must remain undisturbed during visual polish, ensuring 100% regression freedom.

