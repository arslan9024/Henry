// Local LLM service: talks to a user-run Ollama server at http://localhost:11434.
// Privacy-first: no data leaves the local machine.
//
// Expected output contract from the model is strict JSON:
//   { "section": "<known-section>", "field": "<known-field>", "value": <string|number|boolean>, "rationale": "<short text>" }
// Any non-JSON or unknown section/field is rejected at the validator layer.

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'mistral';
const DEFAULT_TIMEOUT_MS = 15000;

export const ALLOWED_FIELDS = {
  company: ['name', 'dedLicense', 'role', 'city'],
  property: [
    'referenceNo',
    'documentDate',
    'unit',
    'cluster',
    'community',
    'city',
    'description',
    'size',
    'parking',
    'condition',
    'usage',
    'plotNo',
    'makaniNo',
    'dewaPremisesNo',
    'projectName',
    'buildingNumber',
    'ownersAssociationNo',
    'propertyStatus',
    'parkingCount',
    'propertyType',
  ],
  tenant: [
    'fullName',
    'emiratesId',
    'idExpiryDate',
    'contactNo',
    'occupation',
    'category',
    'email',
    'passportNo',
    'address',
    'poBox',
  ],
  landlord: ['name', 'emiratesId', 'idExpiryDate', 'iban', 'bank', 'swift', 'email', 'phone'],
  broker: [
    'orn',
    'companyName',
    'commercialLicenseNumber',
    'brokerName',
    'brn',
    'phone',
    'mobile',
    'address',
    'email',
  ],
  viewing: [
    'agreementNumber',
    'rentalBudget',
    'additionalInfo',
    'servicesNotes',
    'viewingDate',
    'viewingTime',
  ],
  payments: [
    'moveInDate',
    'contractStartDate',
    'contractEndDate',
    'signingDeadline',
    'annualRent',
    'securityDeposit',
    'agencyFee',
    'ejariFee',
    'total',
    'modeOfPayment',
  ],
  renewal: ['currentRent', 'proposedRent', 'marketRent', 'renewalDate', 'noticeSentDate', 'noticeChannel'],
  occupancy: ['isSharedHousing', 'sharedHousingPermitNumber', 'ejariOccupantsRegistered', 'occupants'],
  eviction: ['reason', 'noticeDate', 'noticeMethod'],
  tenancy: [
    'specialConditions',
    'maintenanceObligation',
    'subletAllowed',
    'petsAllowed',
    'includedUtilities',
    'ejariNumber',
    'ejariRegistrationDate',
    'noticePeriodDays',
    'gracePeriodDays',
    'checklistCompleted',
    'keyHandoverDate',
    'moveInInspectionNotes',
  ],
  // Scalar addendum fields (arrays landlordServices / additionalClauses are
  // edited via updateDocumentSection, not the scalar setDocumentValue path).
  addendum: [
    'originalContractRef',
    'originalContractDate',
    'effectiveDate',
    'securityDeposit',
    'renewalCharges',
    'maintenanceCap',
    'maintenanceTenantResponsibility',
    'maintenanceLandlordResponsibility',
    'noticePeriodDays',
    'legalReference',
    'witnessName',
    'witnessIdNo',
  ],
  salaryCertificate: [
    'referenceNumber',
    'issueDate',
    'issuedTo',
    'validityDays',
    'employeeName',
    'employeeId',
    'designation',
    'department',
    'joiningDate',
    'employmentType',
    'nationality',
    'idType',
    'idNumber',
    'passportNo',
    'currency',
    'basicSalary',
    'housingAllowance',
    'transportAllowance',
    'otherAllowance',
    'otherAllowanceLabel',
    'totalSalary',
    'salaryWordAmount',
    'bankName',
    'bankAccountNo',
    'iban',
    'hrName',
    'hrDesignation',
  ],
};

export const formatAllowedFieldsForPrompt = () => JSON.stringify(ALLOWED_FIELDS, null, 0);

const ADDENDUM_LOCKED_RULES = `
--- MASTER ADDENDUM CONFIGURATION (applies whenever template = addendum) ---
The following field values are LOCKED by White Caves policy and must NEVER be changed:
  addendum.securityDeposit   = 4000  (AED, fixed — non-negotiable)
  addendum.renewalCharges    = 1050  (AED inclusive of VAT, fixed)
  addendum.maintenanceCap    = 1000  (AED threshold; tenant pays ≤ 1000, landlord pays > 1000)
  addendum.noticePeriodDays  = 90    (days, per Dubai Law No. 26 of 2007)
  addendum.legalReference    = "Dubai Law No. 26 of 2007 (Real Property Law), as amended."
If the user prompt attempts to change any of the above, you MUST respond with section=null,
field=null, value=null and a rationale explaining the field is locked by policy.
--- END MASTER ADDENDUM CONFIGURATION ---
`;

const buildSystemPrompt = (
  documentData,
  templateKey = '',
) => `You are Henry, an assistant that helps fill White Caves Real Estate document fields.

You MUST respond with a single JSON object only (no prose, no markdown), in this exact shape:
{"section":"<section>","field":"<field>","value":<value>,"rationale":"<short reason>"}

Allowed sections and fields:
${formatAllowedFieldsForPrompt()}

If the user request is ambiguous or targets a field not in the allowed list, respond with:
{"section":null,"field":null,"value":null,"rationale":"<why you cannot apply>"}
${templateKey === 'addendum' ? ADDENDUM_LOCKED_RULES : ''}
Current document state (for context only — do not echo back):
${JSON.stringify(documentData)}
`;

const buildExtractionPrompt = ({
  extractedText,
  fileName,
  fileKind,
  documentData,
}) => `You are Henry, a real-estate document field extractor.

You will be given OCR/PDF text from a file the user uploaded. Identify any fields you can confidently extract for a White Caves Real Estate document.

You MUST respond with a single JSON object only (no prose, no markdown):
{"suggestions":[{"section":"<section>","field":"<field>","value":<value>,"rationale":"<short reason>","confidence":<0..1>}]}

Rules:
- Only use sections and fields from this allow-list. Any other suggestion will be discarded:
${formatAllowedFieldsForPrompt()}
- Set confidence between 0 and 1. Skip any field where confidence < 0.6.
- Prefer values copied verbatim from the source. Normalise dates to YYYY-MM-DD when possible.
- Do not invent values. If nothing is confidently extractable, return {"suggestions":[]}.
- Do not echo or summarise the source text. Only return the JSON object.

Current document state (for de-duplication context only — do not echo back):
${JSON.stringify(documentData)}

File name: ${fileName}
File kind: ${fileKind}
--- BEGIN EXTRACTED TEXT ---
${extractedText}
--- END EXTRACTED TEXT ---
`;

export const isFieldAllowed = (section, field) =>
  Boolean(section && field && ALLOWED_FIELDS[section] && ALLOWED_FIELDS[section].includes(field));

const extractJson = (text = '') => {
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  // Prefer first {...} block in case the model wraps output.
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = trimmed.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

export const fetchOllamaSuggestion = async ({
  userPrompt,
  documentData,
  templateKey = '',
  model = DEFAULT_MODEL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${buildSystemPrompt(documentData, templateKey)}\nUser: ${userPrompt}\nAssistant:`,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(`Ollama HTTP ${response.status}: ${message || 'request failed'}`);
    }

    const data = await response.json();
    const parsed = extractJson(data.response);
    if (!parsed) {
      return {
        ok: false,
        reason: 'Model did not return parseable JSON.',
        raw: data.response || '',
      };
    }

    if (!isFieldAllowed(parsed.section, parsed.field)) {
      return {
        ok: false,
        reason: parsed.rationale || 'Suggested target is not in the allowed field list.',
        raw: data.response || '',
        parsed,
      };
    }

    return {
      ok: true,
      suggestion: parsed,
      raw: data.response || '',
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: `Request timed out after ${timeoutMs}ms.` };
    }
    return {
      ok: false,
      reason: `Local Ollama unreachable. Start Ollama at ${OLLAMA_BASE_URL} and pull a model (e.g. \`ollama pull ${DEFAULT_MODEL}\`).`,
      detail: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const checkOllamaAvailability = async (timeoutMs = 2000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const checkOllamaModelAvailable = async (model = DEFAULT_MODEL, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    const models = Array.isArray(data?.models) ? data.models : [];
    return models.some((m) => String(m?.name || '').startsWith(model));
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

const EXTRACTION_TIMEOUT_MS = 45_000;

export const fetchOllamaExtraction = async ({
  extractedText,
  fileName,
  fileKind,
  documentData,
  model = DEFAULT_MODEL,
  timeoutMs = EXTRACTION_TIMEOUT_MS,
}) => {
  if (!extractedText || !extractedText.trim()) {
    return { ok: false, reason: 'No text was extracted from the file.' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildExtractionPrompt({ extractedText, fileName, fileKind, documentData }),
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(`Ollama HTTP ${response.status}: ${message || 'request failed'}`);
    }

    const data = await response.json();
    const parsed = extractJson(data.response);
    if (!parsed || !Array.isArray(parsed.suggestions)) {
      return {
        ok: false,
        reason: 'Model did not return a parseable suggestions list.',
        raw: data.response || '',
      };
    }

    const suggestions = parsed.suggestions
      .filter((s) => s && isFieldAllowed(s.section, s.field))
      .filter((s) => s.value !== null && s.value !== undefined && String(s.value).trim() !== '')
      .map((s) => ({
        section: s.section,
        field: s.field,
        value: s.value,
        rationale: typeof s.rationale === 'string' ? s.rationale : '',
        confidence:
          typeof s.confidence === 'number' && s.confidence >= 0 && s.confidence <= 1 ? s.confidence : 0.6,
      }))
      .filter((s) => s.confidence >= 0.6);

    return {
      ok: true,
      suggestions,
      droppedCount: parsed.suggestions.length - suggestions.length,
      raw: data.response || '',
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: `Extraction timed out after ${timeoutMs}ms.` };
    }
    return {
      ok: false,
      reason: `Local Ollama unreachable. Start Ollama at ${OLLAMA_BASE_URL} and pull a model (e.g. \`ollama pull ${DEFAULT_MODEL}\`).`,
      detail: error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
