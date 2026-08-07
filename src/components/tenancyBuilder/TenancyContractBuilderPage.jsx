import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addAddendumClause,
  addTenancyTerm,
  removeAddendumClause,
  removeTenancyTerm,
  setDocumentValue,
} from '../../store/documentSlice';
import { setActiveTemplate } from '../../store/templateSlice';
import { pushToast } from '../../store/uiSlice';
import { APP_PAGES } from '../../store/appRouteSlice';
import useAppNavigation from '../../hooks/useAppNavigation';
import useGateStatus from '../../hooks/useGateStatus';
import { generateQuotationPdfBlob } from '../../pdf/generateQuotationPdf';
import { buildPdfFileName, sanitizeFileNameSegment } from '../../pdf/pdfHelpers';
import { mergePdfBlobs } from '../../pdf/mergePdfBlobs';
import { persistRecordFile } from '../../records/archiveService';
import {
  createEditableTemplateCopy,
  getTenancyTemplateFolders,
  loadTenancyTemplates,
  saveTenancyTemplate,
} from '../../records/templateStore';
import { loadTitleDeedReferences } from '../../records/titleDeedStore';
import { loadEmiratesIdReferences } from '../../records/emiratesIdStore';
import { loadTenantDocumentReferences, saveTenantDocumentReference } from '../../records/tenantDocumentStore';
import { extractTextFromFile } from '../../services/fileExtractionService';
import { queueWhatsAppSharePackage } from '../../services/whatsappQueueService';
import {
  buildTenantIdentityNumberedItems,
  evaluateTenantIdentityReadiness,
  normalizeTenantIdentityType,
  parseTenantIdentityText,
} from '../../services/tenantIdentityExtractionService';
import { resolvePreferredBilingualValue } from '../../services/multilingualTextUtils';
import { Badge, Button, Card, FormField, Input, Select, Textarea } from '../ui';
import PlacementActionPanel from './PlacementActionPanel';
import { getTenancyFieldProfile, getRequiredMappedFields } from '../../pdf/templateFieldRegistry';

const DEFAULT_LANDLORD_PHONE = '+254 720 985595';
const DEFAULT_LANDLORD_EMAIL = 'mohamedkifaru@gmail.com';
const DEFAULT_TENANT_PHONE = '+971 52 864 3118';
const DEFAULT_TENANT_EMAIL = 'Mahmoud.mufty@gmail.com';

const STEP_CONFIG = [
  {
    key: 'landlord',
    title: 'Landlord',
    description: 'Capture landlord identity and contact details.',
    required: ['landlord.name', 'landlord.phone', 'landlord.email'],
  },
  {
    key: 'property',
    title: 'Property',
    description: 'Capture property identification and location fields.',
    required: ['property.unit', 'property.community'],
  },
  {
    key: 'tenant',
    title: 'Tenant',
    description: 'Capture tenant profile and identity details.',
    required: ['tenant.fullName', 'tenant.contactNo', 'tenant.email'],
  },
  {
    key: 'contract',
    title: 'Contract Details',
    description: 'Capture rent values and contract timeline.',
    required: ['payments.contractStartDate', 'payments.contractEndDate', 'payments.annualRent'],
  },
  {
    key: 'terms',
    title: 'Additional Terms',
    description: 'Add custom tenancy clauses and special conditions.',
    required: [],
  },
  {
    key: 'addendum',
    title: 'Addendum',
    description: 'Attach addendum details to include in final package.',
    required: ['addendum.originalContractRef', 'addendum.effectiveDate'],
  },
];

const readByPath = (obj, path) =>
  String(path)
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const isMissing = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  return false;
};

const getMissingFields = (documentData, requiredPaths) =>
  requiredPaths.filter((path) => isMissing(readByPath(documentData, path)));

const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <FormField label={label}>
    <Input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} />
  </FormField>
);

const modeOptions = [
  { value: 'separate', label: 'Separate files (contract + addendum)' },
  { value: 'merged', label: 'One merged PDF package' },
];

const templateTypeOptions = [
  { value: 'static', label: 'Static template (coordinate mapping)' },
  { value: 'fillable', label: 'Fillable PDF (AcroForm fields)' },
];

const tenantLanguagePreferenceOptions = [
  { value: 'auto', label: 'Auto (use extracted default)' },
  { value: 'en', label: 'English value' },
  { value: 'ar', label: 'Arabic value' },
];

const downloadBlobFile = ({ blob, fileName }) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const TenancyContractBuilderPage = () => {
  const dispatch = useDispatch();
  const { goToPage } = useAppNavigation();
  const documentData = useSelector((state) => state.document);
  const fieldProfile = useMemo(() => getTenancyFieldProfile(), []);
  const requiredMappedFields = useMemo(() => getRequiredMappedFields(), []);
  const folderConfig = useMemo(() => getTenancyTemplateFolders(), []);
  const [activeStep, setActiveStep] = useState(0);
  const [exportMode, setExportMode] = useState('separate');
  const [templateMode, setTemplateMode] = useState('static');
  const [templates, setTemplates] = useState(() => loadTenancyTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [newTenancyTerm, setNewTenancyTerm] = useState('');
  const [newAddendumClause, setNewAddendumClause] = useState('');
  const [tenantLanguagePreference, setTenantLanguagePreference] = useState('auto');
  const [sharePhone, setSharePhone] = useState('');
  const [shareMessage, setShareMessage] = useState(
    'Please find attached your tenancy contract package from Mr Henry.',
  );
  const [isBusy, setIsBusy] = useState(false);

  const currentStep = STEP_CONFIG[activeStep];

  useEffect(() => {
    dispatch(setActiveTemplate('tenancy'));
  }, [dispatch]);

  useEffect(() => {
    if (!documentData?.landlord?.phone?.trim()) {
      dispatch(setDocumentValue({ section: 'landlord', field: 'phone', value: DEFAULT_LANDLORD_PHONE }));
    }
    if (!documentData?.landlord?.email?.trim()) {
      dispatch(setDocumentValue({ section: 'landlord', field: 'email', value: DEFAULT_LANDLORD_EMAIL }));
    }
  }, [dispatch, documentData?.landlord?.phone, documentData?.landlord?.email]);

  useEffect(() => {
    if (!documentData?.tenant?.contactNo?.trim()) {
      dispatch(setDocumentValue({ section: 'tenant', field: 'contactNo', value: DEFAULT_TENANT_PHONE }));
    }
    if (!documentData?.tenant?.email?.trim()) {
      dispatch(setDocumentValue({ section: 'tenant', field: 'email', value: DEFAULT_TENANT_EMAIL }));
    }
  }, [dispatch, documentData?.tenant?.contactNo, documentData?.tenant?.email]);

  useEffect(() => {
    if (!sharePhone.trim()) {
      setSharePhone(documentData?.tenant?.contactNo?.trim() || documentData?.landlord?.phone?.trim() || '');
    }
  }, [documentData?.landlord?.phone, documentData?.tenant?.contactNo, sharePhone]);

  const { landlordGateStatus, tenantGateStatus, completionMap, getStepBlockCopy } = useGateStatus({
    documentData,
    steps: STEP_CONFIG,
  });

  const updateValue = (section, field, value) => {
    dispatch(setDocumentValue({ section, field, value }));
  };

  const getPreferredTenantValues = (parsedDoc = {}) => {
    const name = resolvePreferredBilingualValue({
      primary: parsedDoc.fullName,
      english: parsedDoc.fullNameEn,
      arabic: parsedDoc.fullNameAr,
      preference: tenantLanguagePreference,
    });
    const nationality = resolvePreferredBilingualValue({
      primary: parsedDoc.nationality,
      english: parsedDoc.nationalityEn,
      arabic: parsedDoc.nationalityAr,
      preference: tenantLanguagePreference,
    });

    return { name, nationality };
  };

  const applyLatestTitleDeedToProperty = () => {
    const refs = loadTitleDeedReferences();
    if (!refs.length) {
      toast('warning', 'No title deed reference found', 'Upload and analyze a title deed first.');
      return;
    }

    const latest = refs[0]?.parsed || {};
    updateValue('property', 'plotNo', latest.plotNo || '');
    updateValue('property', 'community', latest.community || documentData.property.community || '');
    updateValue('property', 'propertyType', latest.propertyType || documentData.property.propertyType || '');
    updateValue(
      'property',
      'size',
      latest.areaSqMeter ? `${latest.areaSqMeter}` : documentData.property.size || '',
    );

    toast('success', 'Property fields updated', 'Applied latest title deed values to property section.');
  };

  const applyLatestLandlordEmiratesId = () => {
    const refs = loadEmiratesIdReferences().filter((entry) => entry?.ownerTag === 'landlord');
    if (!refs.length) {
      toast(
        'warning',
        'No landlord Emirates ID reference found',
        'Upload Emirates ID with landlord tag first.',
      );
      return;
    }

    const latest = refs[0]?.parsed || {};
    updateValue('landlord', 'emiratesId', latest.idNumber || documentData.landlord.emiratesId || '');
    updateValue('landlord', 'idExpiryDate', latest.expiryDate || documentData.landlord.idExpiryDate || '');
    updateValue('landlord', 'phone', documentData.landlord.phone || DEFAULT_LANDLORD_PHONE);
    updateValue('landlord', 'email', documentData.landlord.email || DEFAULT_LANDLORD_EMAIL);

    toast('success', 'Landlord fields updated', 'Applied latest landlord Emirates ID details.');
  };

  const applyLatestTenantEmiratesId = () => {
    const refs = loadEmiratesIdReferences().filter((entry) => entry?.ownerTag === 'tenant');
    if (!refs.length) {
      toast('warning', 'No tenant Emirates ID reference found', 'Upload Emirates ID with tenant tag first.');
      return;
    }

    const latest = refs[0]?.parsed || {};
    const preferred = getPreferredTenantValues(latest);
    updateValue('tenant', 'fullName', preferred.name.value || documentData.tenant.fullName || '');
    updateValue('tenant', 'emiratesId', latest.idNumber || documentData.tenant.emiratesId || '');
    updateValue('tenant', 'idExpiryDate', latest.expiryDate || documentData.tenant.idExpiryDate || '');
    updateValue(
      'tenant',
      'nationality',
      preferred.nationality.value || documentData.tenant.nationality || '',
    );
    updateValue('tenant', 'contactNo', documentData.tenant.contactNo || DEFAULT_TENANT_PHONE);
    updateValue('tenant', 'email', documentData.tenant.email || DEFAULT_TENANT_EMAIL);

    toast(
      'success',
      'Tenant fields updated',
      `Applied latest tenant Emirates ID details (name ${preferred.name.selectedLanguage}, nationality ${preferred.nationality.selectedLanguage}).`,
    );
  };

  const getLatestTenantIdentityRefs = (types) =>
    loadTenantDocumentReferences().filter((entry) => types.includes(entry?.type));

  const applyLatestTenantPassport = () => {
    const refs = getLatestTenantIdentityRefs(['passport']);
    if (!refs.length) {
      toast('warning', 'No tenant passport reference found', 'Upload a passport copy first.');
      return;
    }

    const latest = refs[0] || {};
    const parsed = latest.parsed || {};
    const preferred = getPreferredTenantValues(parsed);
    updateValue('tenant', 'fullName', preferred.name.value || documentData.tenant.fullName || '');
    updateValue('tenant', 'passportNo', parsed.passportNo || documentData.tenant.passportNo || '');
    updateValue(
      'tenant',
      'nationality',
      preferred.nationality.value || documentData.tenant.nationality || '',
    );
    updateValue('tenant', 'idExpiryDate', parsed.expiryDate || documentData.tenant.idExpiryDate || '');

    toast(
      'success',
      'Tenant passport applied',
      `Applied latest passport details to tenant profile fields (name ${preferred.name.selectedLanguage}, nationality ${preferred.nationality.selectedLanguage}).`,
    );
  };

  const applyLatestTenantResidencePermit = () => {
    const refs = getLatestTenantIdentityRefs(['residence-permit', 'visa']);
    if (!refs.length) {
      toast(
        'warning',
        'No tenant residence permit reference found',
        'Upload a residence permit or visa copy first.',
      );
      return;
    }

    const latest = refs[0] || {};
    const parsed = latest.parsed || {};
    const preferred = getPreferredTenantValues(parsed);
    updateValue('tenant', 'fullName', preferred.name.value || documentData.tenant.fullName || '');
    updateValue(
      'tenant',
      'nationality',
      preferred.nationality.value || documentData.tenant.nationality || '',
    );
    updateValue('tenant', 'idExpiryDate', parsed.expiryDate || documentData.tenant.idExpiryDate || '');

    toast(
      'success',
      'Tenant residence permit applied',
      `Applied latest residence permit details to tenant profile fields (name ${preferred.name.selectedLanguage}, nationality ${preferred.nationality.selectedLanguage}).`,
    );
  };

  const applyLatestTenantIdentityDocs = () => {
    const passportRefs = getLatestTenantIdentityRefs(['passport']);
    const permitRefs = getLatestTenantIdentityRefs(['residence-permit', 'visa']);

    if (!passportRefs.length && !permitRefs.length) {
      toast(
        'warning',
        'No tenant identity references found',
        'Upload passport and residence permit scans first.',
      );
      return;
    }

    const passportParsed = passportRefs[0]?.parsed || {};
    const permitParsed = permitRefs[0]?.parsed || {};
    const preferredPassport = getPreferredTenantValues(passportParsed);
    const preferredPermit = getPreferredTenantValues(permitParsed);

    updateValue(
      'tenant',
      'fullName',
      preferredPassport.name.value || preferredPermit.name.value || documentData.tenant.fullName || '',
    );
    updateValue(
      'tenant',
      'passportNo',
      passportParsed.passportNo || permitParsed.passportNo || documentData.tenant.passportNo || '',
    );
    updateValue(
      'tenant',
      'nationality',
      preferredPassport.nationality.value ||
        preferredPermit.nationality.value ||
        documentData.tenant.nationality ||
        '',
    );
    updateValue(
      'tenant',
      'idExpiryDate',
      passportParsed.expiryDate || permitParsed.expiryDate || documentData.tenant.idExpiryDate || '',
    );

    toast(
      'success',
      'Tenant identity applied',
      `Applied latest passport and residence permit references (passport ${preferredPassport.name.selectedLanguage}/${preferredPassport.nationality.selectedLanguage}, permit ${preferredPermit.name.selectedLanguage}/${preferredPermit.nationality.selectedLanguage}).`,
    );
  };

  const toast = (tone, title, body) => dispatch(pushToast({ tone, title, body }));

  const continueStep = () => {
    const missing = completionMap[currentStep.key]?.missing || [];
    if (missing.length > 0) {
      const blockCopy = getStepBlockCopy(currentStep.key);
      toast('warning', blockCopy.title, blockCopy.body);
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEP_CONFIG.length - 1));
  };

  const handleTemplateUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast('warning', 'Unsupported file', 'Please upload a PDF template file.');
      return;
    }

    setIsBusy(true);
    const result = await saveTenancyTemplate({ file, mode: templateMode });
    setIsBusy(false);

    if (!result.ok) {
      toast('error', 'Template upload failed', result.reason || 'Could not save template file.');
      return;
    }

    const nextTemplates = loadTenancyTemplates();
    setTemplates(nextTemplates);

    const editable = createEditableTemplateCopy({ templateId: result.entry.id });
    if (editable.ok) {
      const withCopy = loadTenancyTemplates();
      setTemplates(withCopy);
      setSelectedTemplateId(editable.entry.id);
      toast(
        'success',
        'Template uploaded + copy created',
        `${result.entry.name} saved as master and opened as editable working copy.`,
      );
      return;
    }

    setSelectedTemplateId(result.entry.id);
    toast('success', 'Template uploaded', `${result.entry.name} saved for tenancy builder.`);
  };

  const handleCreateWorkingCopy = () => {
    if (!selectedTemplateId) {
      toast('warning', 'No template selected', 'Please select a master template first.');
      return;
    }

    const selected = templates.find((item) => item.id === selectedTemplateId);
    if (!selected) {
      toast('warning', 'Template missing', 'Please re-select a template.');
      return;
    }

    if (selected.kind === 'working-copy') {
      toast('info', 'Already editable', 'This selected template is already a working copy.');
      return;
    }

    const created = createEditableTemplateCopy({ templateId: selected.id });
    if (!created.ok) {
      toast('error', 'Copy failed', created.reason || 'Could not create editable copy.');
      return;
    }

    const next = loadTenancyTemplates();
    setTemplates(next);
    setSelectedTemplateId(created.entry.id);
    toast('success', 'Editable copy ready', 'Editing now uses a separate working copy.');
  };

  const ensureAddendumSeed = () => {
    const ref = documentData?.addendum?.originalContractRef;
    const startDate = documentData?.payments?.contractStartDate;
    const unit = documentData?.property?.unit;
    if (!ref) {
      updateValue(
        'addendum',
        'originalContractRef',
        `${unit || 'UNIT'}-${startDate || new Date().toISOString().slice(0, 10)}`,
      );
    }
    if (!documentData?.addendum?.originalContractDate) {
      updateValue('addendum', 'originalContractDate', startDate || '');
    }
  };

  const buildMergedPackageFileName = () => {
    const unit = sanitizeFileNameSegment(documentData?.property?.unit || 'Unit');
    const tenant = sanitizeFileNameSegment(documentData?.tenant?.fullName || 'Tenant');
    const datePart = new Date().toISOString().slice(0, 10);
    return `Tenancy_Package_${unit}_${tenant}_${datePart}.pdf`;
  };

  const persistPdfArtifact = async ({ recordPath, fileName, blob }) => {
    const result = await persistRecordFile({ recordPath, fileName, blob });
    if (!result.ok) {
      throw new Error(`Save failed: ${result.reason || 'unknown reason'}`);
    }
    return result;
  };

  const buildExportArtifacts = async () => {
    const canExportContract = completionMap.contract.completed && completionMap.tenant.completed;
    const canExportAddendum = completionMap.addendum.completed;

    if (!landlordGateStatus.ready || !tenantGateStatus.ready) {
      throw new Error(
        `Autofill blocked — Landlord missing: ${landlordGateStatus.missing.join(', ') || 'none'} | Tenant missing: ${tenantGateStatus.missing.join(', ') || 'none'}`,
      );
    }

    if (!canExportContract) {
      throw new Error('Complete contract and tenant steps before export.');
    }

    if (exportMode === 'merged') {
      if (!canExportAddendum) {
        throw new Error('Complete addendum fields first, or switch output mode to separate files.');
      }

      const [tenancyBlob, addendumBlob] = await Promise.all([
        generateQuotationPdfBlob({ documentData, templateKey: 'tenancy' }),
        generateQuotationPdfBlob({ documentData, templateKey: 'addendum' }),
      ]);

      const mergedBlob = await mergePdfBlobs([tenancyBlob, addendumBlob]);
      const mergedFileName = buildMergedPackageFileName();
      return {
        exportMode,
        canExportAddendum,
        files: [
          {
            key: 'merged',
            label: 'Merged tenancy package PDF',
            fileName: mergedFileName,
            recordPath: `tenancy-builder/${new Date().getFullYear()}/merged`,
            blob: mergedBlob,
            sharePreferred: true,
          },
        ],
      };
    }

    const files = [];
    const tenancyBlob = await generateQuotationPdfBlob({ documentData, templateKey: 'tenancy' });
    files.push({
      key: 'tenancy',
      label: 'Tenancy contract PDF',
      fileName: buildPdfFileName('tenancy', documentData),
      recordPath: `tenancy-builder/${new Date().getFullYear()}/tenancy`,
      blob: tenancyBlob,
      sharePreferred: true,
    });

    if (canExportAddendum) {
      const addendumBlob = await generateQuotationPdfBlob({ documentData, templateKey: 'addendum' });
      files.push({
        key: 'addendum',
        label: 'Addendum PDF',
        fileName: buildPdfFileName('addendum', documentData),
        recordPath: `tenancy-builder/${new Date().getFullYear()}/addendum`,
        blob: addendumBlob,
        sharePreferred: false,
      });
    }

    return {
      exportMode,
      canExportAddendum,
      files,
    };
  };

  const executeFinalActions = async ({ saveCase = false, downloadPdf = false, shareWhatsapp = false }) => {
    setIsBusy(true);
    try {
      const artifacts = await buildExportArtifacts();

      if (downloadPdf) {
        artifacts.files.forEach((file) => {
          downloadBlobFile({ blob: file.blob, fileName: file.fileName });
        });
      }

      if (saveCase) {
        await Promise.all(
          artifacts.files.map((file) =>
            persistPdfArtifact({ recordPath: file.recordPath, fileName: file.fileName, blob: file.blob }),
          ),
        );
      }

      if (shareWhatsapp) {
        const shareTarget = artifacts.files.find((file) => file.sharePreferred) || artifacts.files[0];
        const queueResult = await queueWhatsAppSharePackage({
          phone: sharePhone,
          blob: shareTarget.blob,
          fileName: shareTarget.fileName,
          messageTemplate: shareMessage,
          caseContext: {
            unit: documentData?.property?.unit || '',
            tenantName: documentData?.tenant?.fullName || '',
            landlordName: documentData?.landlord?.name || '',
            exportMode: artifacts.exportMode,
          },
        });

        if (!queueResult.ok) {
          throw new Error('Could not queue WhatsApp share package.');
        }
      }

      const completedActions = [
        saveCase ? 'saved' : null,
        downloadPdf ? 'downloaded' : null,
        shareWhatsapp ? 'queued for WhatsApp' : null,
      ].filter(Boolean);

      const addendumNote = artifacts.canExportAddendum
        ? 'Addendum included when applicable.'
        : 'Addendum was skipped because it is not ready yet.';

      toast('success', 'Final action complete', `${completedActions.join(' • ')}. ${addendumNote}`);
    } catch (error) {
      toast('error', 'Final action failed', error.message || 'Could not complete final action.');
    } finally {
      setIsBusy(false);
    }
  };

  const selectedTemplate = templates.find((item) => item.id === selectedTemplateId) || null;
  const tenantGateTone = tenantGateStatus.ready ? 'success' : 'warning';
  const mappingPreview = requiredMappedFields.map((field) => ({
    ...field,
    currentValue: readByPath(documentData, field.path),
  }));
  const mappingReadyCount = mappingPreview.filter((item) => !isMissing(item.currentValue)).length;

  const handleTenantProofUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const normalizedType = normalizeTenantIdentityType(type);

    setIsBusy(true);
    try {
      const extraction = await extractTextFromFile(file);
      if (!extraction.ok) {
        toast('error', `Failed to read tenant ${normalizedType}`, extraction.reason || 'Extraction failed.');
        return;
      }

      if (!extraction.text || extraction.text.trim().length === 0) {
        toast(
          'warning',
          'No text parsed from tenant upload',
          'Please upload a clearer passport or residence permit image/PDF for OCR extraction.',
        );
        return;
      }

      const parsedDoc = parseTenantIdentityText(extraction.text, normalizedType);
      const scanItems = buildTenantIdentityNumberedItems(parsedDoc);
      const readCheck = evaluateTenantIdentityReadiness(parsedDoc);

      const recordPath = `tenant-identity/master/${normalizedType}/${Date.now()}`;
      const result = await persistRecordFile({
        recordPath,
        fileName: file.name,
        blob: file,
      });

      if (!result.ok) {
        toast(
          'warning',
          `Parsed tenant ${normalizedType} but could not save source`,
          result.reason || 'Save failed.',
        );
      }

      const referencePayload = {
        sourceFileName: file.name,
        documentType: normalizedType,
        parsed: parsedDoc,
        numberedItems: scanItems,
        readiness: readCheck,
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

      await persistRecordFile({
        recordPath,
        fileName: 'tenant-identity-reference.json',
        blob: jsonBlob,
      });

      saveTenantDocumentReference({
        type: normalizedType,
        fileName: file.name,
        sourcePath: result.path || null,
        parsed: parsedDoc,
        numberedItems: scanItems,
        extractedText: extraction.text,
        readiness: readCheck,
        detectedLanguage: extraction.detectedLanguage || 'unknown',
        languageStats: extraction.languageStats || null,
        ocrLanguages: extraction.ocrLanguages || null,
        createdFrom: 'tenancy-builder-inline',
        documentLabel: normalizedType === 'passport' ? 'Passport' : 'Residence Permit',
        fileKind: extraction.kind || file.type || null,
      });

      const appliedParsed = parsedDoc || {};
      const preferred = getPreferredTenantValues(appliedParsed);
      if (normalizedType === 'passport') {
        updateValue('tenant', 'fullName', preferred.name.value || documentData.tenant.fullName || '');
        updateValue('tenant', 'passportNo', appliedParsed.passportNo || documentData.tenant.passportNo || '');
      }
      if (preferred.nationality.value) {
        updateValue(
          'tenant',
          'nationality',
          preferred.nationality.value || documentData.tenant.nationality || '',
        );
      }

      toast(
        'success',
        `Tenant ${normalizedType} scanned`,
        `${scanItems.length} numbered items captured and saved for autofill (name ${preferred.name.selectedLanguage}, nationality ${preferred.nationality.selectedLanguage}).`,
      );
    } catch (error) {
      toast('error', `Failed to process tenant ${normalizedType}`, error.message || 'Unexpected error.');
    } finally {
      setIsBusy(false);
      event.target.value = '';
    }
  };

  return (
    <main className="tenancy-builder-page shell-page" id="main" tabIndex={-1}>
      <section className="tenancy-builder-header">
        <div>
          <h2>Tenancy Contract Builder</h2>
          <p>Upload tenancy template, complete guided steps, and export contract + addendum package.</p>
        </div>
        <div className="tenancy-builder-header__actions">
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.DOCUMENT_HUB)}>
            ← Back to Document Hub
          </Button>
        </div>
      </section>

      <section className="tenancy-builder-grid">
        <Card variant="outlined" className="tenancy-builder-steps" as="aside">
          <Card.Header>
            <h3>Workflow Steps</h3>
          </Card.Header>
          <Card.Body>
            <ol>
              {STEP_CONFIG.map((step, idx) => {
                const status = completionMap[step.key];
                const isActive = idx === activeStep;
                return (
                  <li key={step.key}>
                    <button
                      type="button"
                      className={`tenancy-step-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => setActiveStep(idx)}
                    >
                      <span>
                        {idx + 1}. {step.title}
                      </span>
                      <Badge tone={status?.completed ? 'success' : 'warning'}>
                        {status?.completed ? 'Ready' : `${status?.missing.length} missing`}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card.Body>
        </Card>

        <Card variant="elevated" className="tenancy-builder-form">
          <Card.Header>
            <h3>{currentStep.title}</h3>
            <p>{currentStep.description}</p>
          </Card.Header>
          <Card.Body>
            {currentStep.key === 'landlord' ? (
              <div className="tenancy-form-stack">
                <div className="tenancy-gate-banner" role="status" aria-live="polite">
                  <p>
                    <strong>Step 1 hard gate:</strong> Landlord mobile, landlord email, at least 1 Title Deed
                    upload, and at least 1 Emirates ID upload tagged as <strong>landlord</strong> are
                    mandatory.
                  </p>
                  <ul>
                    <li>Landlord mobile: {documentData?.landlord?.phone?.trim() ? '✅' : '❌'}</li>
                    <li>Landlord email: {documentData?.landlord?.email?.trim() ? '✅' : '❌'}</li>
                    <Badge tone={tenantGateTone}>
                      {tenantGateStatus.ready
                        ? 'Tenant Step 2 ready'
                        : `${tenantGateStatus.missing.length} tenant requirement(s) missing`}
                    </Badge>
                    <li>
                      Title Deed uploads: {landlordGateStatus.titleDeedCount}{' '}
                      {landlordGateStatus.titleDeedCount > 0 ? '✅' : '❌'}
                    </li>
                    <li>
                      Landlord Emirates ID uploads: {landlordGateStatus.landlordEmiratesIdCount}{' '}
                      {landlordGateStatus.landlordEmiratesIdCount > 0 ? '✅' : '❌'}
                    </li>
                  </ul>
                  <div className="tenancy-gate-actions">
                    <Button variant="secondary" size="sm" onClick={() => goToPage(APP_PAGES.TITLE_DEED)}>
                      Upload Title Deed
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => goToPage(APP_PAGES.EMIRATES_ID)}>
                      Upload Landlord Emirates ID
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyLatestTitleDeedToProperty}>
                      Apply latest Title Deed to property
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyLatestLandlordEmiratesId}>
                      Apply latest Landlord Emirates ID
                    </Button>
                  </div>
                </div>

                <div className="tenancy-form-grid">
                  <Field
                    label="Landlord name"
                    value={documentData.landlord.name}
                    onChange={(e) => updateValue('landlord', 'name', e.target.value)}
                  />
                  <Field
                    label="Landlord Emirates ID"
                    value={documentData.landlord.emiratesId}
                    onChange={(e) => updateValue('landlord', 'emiratesId', e.target.value)}
                  />
                  <Field
                    label="Landlord email"
                    type="email"
                    value={documentData.landlord.email}
                    onChange={(e) => updateValue('landlord', 'email', e.target.value)}
                  />
                  <Field
                    label="Landlord phone"
                    value={documentData.landlord.phone}
                    onChange={(e) => updateValue('landlord', 'phone', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {currentStep.key === 'property' ? (
              <div className="tenancy-form-grid">
                <Field
                  label="Unit"
                  value={documentData.property.unit}
                  onChange={(e) => updateValue('property', 'unit', e.target.value)}
                />
                <Field
                  label="Community"
                  value={documentData.property.community}
                  onChange={(e) => updateValue('property', 'community', e.target.value)}
                />
                <Field
                  label="Cluster / Building"
                  value={documentData.property.cluster}
                  onChange={(e) => updateValue('property', 'cluster', e.target.value)}
                />
                <Field
                  label="Makani No"
                  value={documentData.property.makaniNo}
                  onChange={(e) => updateValue('property', 'makaniNo', e.target.value)}
                />
              </div>
            ) : null}

            {currentStep.key === 'tenant' ? (
              <div className="tenancy-form-stack">
                <div className="tenancy-gate-banner" role="status" aria-live="polite">
                  <p>
                    <strong>Step 2 hard gate:</strong> Tenant mobile, tenant email, Emirates ID upload tagged
                    as
                    <strong> tenant</strong>, passport copy upload, and residence permit (visa) upload are
                    mandatory.
                  </p>
                  <ul>
                    <li>Tenant mobile: {documentData?.tenant?.contactNo?.trim() ? '✅' : '❌'}</li>
                    <li>Tenant email: {documentData?.tenant?.email?.trim() ? '✅' : '❌'}</li>
                    <li>
                      Tenant Emirates ID uploads: {tenantGateStatus.tenantEmiratesIdCount}{' '}
                      {tenantGateStatus.tenantEmiratesIdCount > 0 ? '✅' : '❌'}
                    </li>
                    <li>
                      Tenant passport uploads: {tenantGateStatus.passportCount}{' '}
                      {tenantGateStatus.passportCount > 0 ? '✅' : '❌'}
                    </li>
                    <li>
                      Tenant residence permit uploads: {tenantGateStatus.residencePermitCount}{' '}
                      {tenantGateStatus.residencePermitCount > 0 ? '✅' : '❌'}
                    </li>
                  </ul>
                  <div className="tenancy-gate-actions">
                    <Button variant="secondary" size="sm" onClick={() => goToPage(APP_PAGES.EMIRATES_ID)}>
                      Upload Tenant Emirates ID
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => goToPage(APP_PAGES.TENANT_IDENTITY_DOCS)}
                    >
                      Open tenant identity scanner
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyLatestTenantEmiratesId}>
                      Apply latest Tenant Emirates ID
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyLatestTenantPassport}>
                      Apply latest Passport
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyLatestTenantResidencePermit}>
                      Apply latest Residence Permit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={applyLatestTenantIdentityDocs}>
                      Apply latest identity docs
                    </Button>
                  </div>
                </div>

                <FormField label="Tenant value language preference (name/nationality)">
                  <Select
                    value={tenantLanguagePreference}
                    onChange={(e) => setTenantLanguagePreference(e.target.value)}
                    options={tenantLanguagePreferenceOptions}
                  />
                </FormField>

                <div className="tenancy-form-grid">
                  <Field
                    label="Tenant full name"
                    value={documentData.tenant.fullName}
                    onChange={(e) => updateValue('tenant', 'fullName', e.target.value)}
                  />
                  <Field
                    label="Tenant Emirates ID"
                    value={documentData.tenant.emiratesId}
                    onChange={(e) => updateValue('tenant', 'emiratesId', e.target.value)}
                  />
                  <Field
                    label="Tenant email"
                    type="email"
                    value={documentData.tenant.email}
                    onChange={(e) => updateValue('tenant', 'email', e.target.value)}
                  />
                  <Field
                    label="Tenant contact"
                    value={documentData.tenant.contactNo}
                    onChange={(e) => updateValue('tenant', 'contactNo', e.target.value)}
                  />
                </div>

                <div className="tenancy-form-grid">
                  <FormField label="Upload tenant passport copy (required)">
                    <Input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleTenantProofUpload(e, 'passport')}
                      disabled={isBusy}
                    />
                  </FormField>
                  <FormField label="Upload tenant residence permit / visa (required)">
                    <Input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleTenantProofUpload(e, 'residence-permit')}
                      disabled={isBusy}
                    />
                  </FormField>
                </div>
              </div>
            ) : null}

            {currentStep.key === 'contract' ? (
              <div className="tenancy-form-grid">
                <Field
                  label="Contract start date"
                  type="date"
                  value={documentData.payments.contractStartDate}
                  onChange={(e) => updateValue('payments', 'contractStartDate', e.target.value)}
                />
                <Field
                  label="Contract end date"
                  type="date"
                  value={documentData.payments.contractEndDate}
                  onChange={(e) => updateValue('payments', 'contractEndDate', e.target.value)}
                />
                <Field
                  label="Annual rent (AED)"
                  type="number"
                  value={documentData.payments.annualRent}
                  onChange={(e) => updateValue('payments', 'annualRent', Number(e.target.value) || 0)}
                />
                <Field
                  label="Security deposit (AED)"
                  type="number"
                  value={documentData.payments.securityDeposit}
                  onChange={(e) => updateValue('payments', 'securityDeposit', Number(e.target.value) || 0)}
                />
              </div>
            ) : null}

            {currentStep.key === 'terms' ? (
              <div className="tenancy-form-stack">
                <FormField label="Special conditions">
                  <Textarea
                    rows={4}
                    value={documentData.tenancy.specialConditions || ''}
                    onChange={(e) => updateValue('tenancy', 'specialConditions', e.target.value)}
                    placeholder="Any special conditions agreed between landlord and tenant"
                  />
                </FormField>

                <FormField label="Add additional tenancy term">
                  <div className="tenancy-inline">
                    <Input
                      value={newTenancyTerm}
                      onChange={(e) => setNewTenancyTerm(e.target.value)}
                      placeholder="Type a clause and click add"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const clause = newTenancyTerm.trim();
                        if (!clause) return;
                        dispatch(addTenancyTerm(clause));
                        setNewTenancyTerm('');
                      }}
                    >
                      Add term
                    </Button>
                  </div>
                </FormField>

                <div className="tenancy-list">
                  {(documentData.tenancy.additionalTerms || []).map((term, idx) => (
                    <div className="tenancy-list-item" key={`${term}-${idx}`}>
                      <span>{term}</span>
                      <Button variant="ghost" onClick={() => dispatch(removeTenancyTerm(idx))}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep.key === 'addendum' ? (
              <div className="tenancy-form-stack">
                <Button variant="secondary" onClick={ensureAddendumSeed}>
                  Auto-seed from contract data
                </Button>
                <div className="tenancy-form-grid">
                  <Field
                    label="Original contract reference"
                    value={documentData.addendum.originalContractRef}
                    onChange={(e) => updateValue('addendum', 'originalContractRef', e.target.value)}
                  />
                  <Field
                    label="Original contract date"
                    type="date"
                    value={documentData.addendum.originalContractDate}
                    onChange={(e) => updateValue('addendum', 'originalContractDate', e.target.value)}
                  />
                  <Field
                    label="Addendum effective date"
                    type="date"
                    value={documentData.addendum.effectiveDate}
                    onChange={(e) => updateValue('addendum', 'effectiveDate', e.target.value)}
                  />
                  <Field
                    label="Witness name"
                    value={documentData.addendum.witnessName}
                    onChange={(e) => updateValue('addendum', 'witnessName', e.target.value)}
                  />
                </div>

                <FormField label="Attach addendum clause">
                  <div className="tenancy-inline">
                    <Input
                      value={newAddendumClause}
                      onChange={(e) => setNewAddendumClause(e.target.value)}
                      placeholder="Clause to append in addendum"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const clause = newAddendumClause.trim();
                        if (!clause) return;
                        dispatch(addAddendumClause(clause));
                        setNewAddendumClause('');
                      }}
                    >
                      Add clause
                    </Button>
                  </div>
                </FormField>

                <div className="tenancy-list">
                  {(documentData.addendum.additionalClauses || []).map((clause, idx) => (
                    <div className="tenancy-list-item" key={`${clause}-${idx}`}>
                      <span>{clause}</span>
                      <Button variant="ghost" onClick={() => dispatch(removeAddendumClause(idx))}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card.Body>

          <Card.Footer className="tenancy-builder-footer">
            <Button
              variant="ghost"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
            >
              ← Previous
            </Button>
            <Button
              variant="secondary"
              disabled={activeStep >= STEP_CONFIG.length - 1}
              onClick={continueStep}
            >
              Continue →
            </Button>
          </Card.Footer>
        </Card>

        <Card variant="outlined" className="tenancy-builder-side" as="aside">
          <Card.Header>
            <h3>Template + Export</h3>
          </Card.Header>
          <Card.Body>
            <FormField label="Template mode">
              <Select
                value={templateMode}
                onChange={(e) => setTemplateMode(e.target.value)}
                options={templateTypeOptions}
              />
            </FormField>
            <FormField label="Upload tenancy PDF template">
              <Input type="file" accept="application/pdf" onChange={handleTemplateUpload} disabled={isBusy} />
            </FormField>
            <FormField label="Saved templates">
              <Select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                options={[
                  { value: '', label: templates.length ? 'Select template...' : 'No templates yet' },
                  ...templates.map((tpl) => ({
                    value: tpl.id,
                    label: `${tpl.name} (${tpl.mode})${tpl.kind === 'working-copy' ? ' • working copy' : ' • master'}`,
                  })),
                ]}
              />
            </FormField>

            <Button variant="secondary" onClick={handleCreateWorkingCopy} disabled={isBusy}>
              Create editable copy
            </Button>

            {selectedTemplate ? (
              <div className="tenancy-template-meta">
                <p>
                  <strong>Name:</strong> {selectedTemplate.name}
                </p>
                <p>
                  <strong>Mode:</strong> {selectedTemplate.mode}
                </p>
                <p>
                  <strong>Template kind:</strong> {selectedTemplate.kind || 'master'}
                </p>
                <p>
                  <strong>Saved:</strong> {new Date(selectedTemplate.savedAt).toLocaleString()}
                </p>
                <p>
                  <strong>Master folder:</strong> {folderConfig.master}
                </p>
                <p>
                  <strong>Working-copy folder:</strong> {folderConfig.workingCopies}
                </p>
              </div>
            ) : null}

            <div className="tenancy-template-meta">
              <p>
                <strong>Template Profile:</strong> {fieldProfile.label}
              </p>
              <p>
                <strong>Required mapping readiness:</strong> {mappingReadyCount}/{mappingPreview.length}
              </p>
            </div>

            <PlacementActionPanel
              exportMode={exportMode}
              exportModeOptions={modeOptions}
              onExportModeChange={setExportMode}
              sharePhone={sharePhone}
              onSharePhoneChange={setSharePhone}
              shareMessage={shareMessage}
              onShareMessageChange={setShareMessage}
              onDownload={() => executeFinalActions({ downloadPdf: true })}
              onSave={() => executeFinalActions({ saveCase: true })}
              onQueueWhatsApp={() => executeFinalActions({ shareWhatsapp: true })}
              isBusy={isBusy}
              mappingReadyCount={mappingReadyCount}
              mappingTotal={mappingPreview.length}
              contractReady={completionMap.contract?.completed && completionMap.tenant?.completed}
              addendumReady={completionMap.addendum?.completed}
              landlordReady={landlordGateStatus.ready}
              tenantReady={tenantGateStatus.ready}
            />

            <p className="tenancy-builder-note">
              Templates are stored under a dedicated master folder and editing always happens on a working
              copy to protect the original source template.
            </p>
          </Card.Body>
        </Card>
      </section>
    </main>
  );
};

export default TenancyContractBuilderPage;
