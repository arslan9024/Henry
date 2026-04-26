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

export const buildPdfFileName = (templateKey, documentData) => {
  if (templateKey === 'viewing') return buildViewingAgreementFileName(documentData);
  if (templateKey === 'tenancy') return buildEjariFileName(documentData);
  if (templateKey === 'addendum') return buildAddendumFileName(documentData);
  return buildQuotationFileName(documentData);
};

export const getPublicAsset = (assetName) => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/${assetName}`;
  }

  return `/${assetName}`;
};
