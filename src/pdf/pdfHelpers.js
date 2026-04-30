import { formatDateDisplay } from '../compliance/utils/dateUtils';

export const sanitizeFileNameSegment = (value = '') =>
  String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_') || 'Unknown';

export const buildQuotationFileName = (documentData) => {
  const unit = sanitizeFileNameSegment(documentData?.property?.unit || 'Unit');
  const tenantName = sanitizeFileNameSegment(documentData?.tenant?.fullName || 'Tenant');
  const dateValue = sanitizeFileNameSegment(
    formatDateDisplay(documentData?.property?.documentDate || new Date()).replace(/\s+/g, '-'),
  );

  return `${unit}_${tenantName}_${dateValue}.pdf`;
};

export const buildViewingAgreementFileName = (documentData) => {
  const unit = sanitizeFileNameSegment(documentData?.property?.unit || 'Unit');
  const dateValue = sanitizeFileNameSegment(
    formatDateDisplay(documentData?.property?.documentDate || new Date()).replace(/\s+/g, '-'),
  );
  return `Viewing_Agreement_${unit}_${dateValue}.pdf`;
};

export const buildEjariFileName = (documentData) => {
  const unit = sanitizeFileNameSegment(documentData?.property?.unit || 'Unit');
  const tenantName = sanitizeFileNameSegment(documentData?.tenant?.fullName || 'Tenant');
  const dateValue = sanitizeFileNameSegment(
    formatDateDisplay(documentData?.property?.documentDate || new Date()).replace(/\s+/g, '-'),
  );
  return `Tenancy_Contract_${unit}_${tenantName}_${dateValue}.pdf`;
};

export const buildAddendumFileName = (documentData) => {
  const unit = sanitizeFileNameSegment(documentData?.property?.unit || 'Unit');
  const tenantName = sanitizeFileNameSegment(documentData?.tenant?.fullName || 'Tenant');
  const dateValue = sanitizeFileNameSegment(
    formatDateDisplay(
      documentData?.addendum?.effectiveDate || documentData?.property?.documentDate || new Date(),
    ).replace(/\s+/g, '-'),
  );
  return `Addendum_${unit}_${tenantName}_${dateValue}.pdf`;
};

export const buildSalaryCertificateFileName = (documentData) => {
  const employeeName = sanitizeFileNameSegment(
    documentData?.salaryCertificate?.employeeName || documentData?.tenant?.fullName || 'Employee',
  );
  const issueDate = sanitizeFileNameSegment(
    formatDateDisplay(
      documentData?.salaryCertificate?.issueDate || documentData?.property?.documentDate || new Date(),
    ).replace(/\s+/g, '-'),
  );
  return `Salary_Certificate_${employeeName}_${issueDate}.pdf`;
};

export const buildCopySuffix = ({ createdAt = new Date(), copyNumber } = {}) => {
  const date = new Date(createdAt);
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const copyTag = Number.isFinite(copyNumber) ? `C${String(copyNumber).padStart(4, '0')}` : 'C0001';
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}_${copyTag}`;
};

export const buildGeneratedCopyFileName = (baseFileName, options = {}) => {
  const safeBase = sanitizeFileNameSegment(String(baseFileName || 'Document.pdf')).replace(/\.pdf$/i, '');
  const suffix = buildCopySuffix(options);
  return `${safeBase}__COPY_${suffix}.pdf`;
};

export const buildInvoiceFileName = (documentData) => {
  const unit = sanitizeFileNameSegment(documentData?.property?.unit || 'Unit');
  const dateValue = sanitizeFileNameSegment(
    formatDateDisplay(documentData?.property?.documentDate || new Date()).replace(/\s+/g, '-'),
  );
  return `Invoice_${unit}_${dateValue}.pdf`;
};

export const buildKeyHandoverFileName = (documentData) => {
  const unit = sanitizeFileNameSegment(
    documentData?.byTemplate?.keyHandover?.unit || documentData?.property?.unit || 'Unit',
  );
  const dateValue = sanitizeFileNameSegment(
    formatDateDisplay(
      documentData?.byTemplate?.keyHandover?.handoverDate ||
        documentData?.property?.documentDate ||
        new Date(),
    ).replace(/\s+/g, '-'),
  );
  return `KeyHandover_${unit}_${dateValue}.pdf`;
};

export const buildPdfFileName = (templateKey, documentData) => {
  if (templateKey === 'viewing') return buildViewingAgreementFileName(documentData);
  if (templateKey === 'tenancy') return buildEjariFileName(documentData);
  if (templateKey === 'addendum') return buildAddendumFileName(documentData);
  if (templateKey === 'salaryCertificate') return buildSalaryCertificateFileName(documentData);
  if (templateKey === 'invoice') return buildInvoiceFileName(documentData);
  if (templateKey === 'keyHandover') return buildKeyHandoverFileName(documentData);
  return buildQuotationFileName(documentData);
};

export const getPublicAsset = (assetName) => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/${assetName}`;
  }

  return `/${assetName}`;
};
