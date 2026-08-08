const hasValue = (value) =>
  value !== null && value !== undefined && (typeof value !== 'string' || value.trim().length > 0);

const prefer = (candidate, currentValue) => (hasValue(candidate) ? candidate : (currentValue ?? ''));

export const formatExtractedArea = (parsed = {}) => {
  const sqm = parsed.areaSqMeter;
  const sqft = parsed.areaSqFeet;
  if (hasValue(sqm) && hasValue(sqft)) return `${sqm} sqm / ${sqft} sqft`;
  if (hasValue(sqm)) return `${sqm} sqm`;
  if (hasValue(sqft)) return `${sqft} sqft`;
  return '';
};

export const mapTitleDeedToProperty = (parsed = {}, current = {}) => ({
  ...current,
  documentDate: prefer(parsed.issueDate, current.documentDate),
  propertyType: prefer(parsed.propertyType, current.propertyType),
  community: prefer(parsed.community, current.community),
  plotNo: prefer(parsed.plotNo, current.plotNo),
  size: prefer(formatExtractedArea(parsed), current.size),
  buildingNumber: prefer(parsed.municipalityNo, current.buildingNumber),
  titleDeedMortgageStatus: prefer(parsed.mortgageStatus, current.titleDeedMortgageStatus),
  titleDeedOwnerName: prefer(parsed.ownerName, current.titleDeedOwnerName),
  titleDeedOwnerNumber: prefer(parsed.ownerNumber, current.titleDeedOwnerNumber),
  landRegistrationNo: prefer(parsed.landRegistrationNo, current.landRegistrationNo),
  titleDeedPurchaseDate: prefer(parsed.purchaseDate, current.titleDeedPurchaseDate),
  titleDeedPurchaseAmountAed: prefer(parsed.purchaseAmountAed, current.titleDeedPurchaseAmountAed),
  titleDeedCertificateNo: prefer(parsed.certificateNo, current.titleDeedCertificateNo),
});

export const mapEmiratesIdToParty = ({ parsed = {}, current = {}, preferred = {}, ownerTag }) => {
  const common = {
    ...current,
    emiratesId: prefer(parsed.idNumber, current.emiratesId),
    idExpiryDate: prefer(parsed.expiryDate, current.idExpiryDate),
    dateOfBirth: prefer(parsed.dateOfBirth, current.dateOfBirth),
    gender: prefer(parsed.sex, current.gender),
    idIssueDate: prefer(parsed.issuingDate, current.idIssueDate),
    identityCardNumber: prefer(parsed.cardNumber, current.identityCardNumber),
    occupation: prefer(parsed.occupation, current.occupation),
    employer: prefer(parsed.employer, current.employer),
    idIssuingPlace: prefer(parsed.issuingPlace, current.idIssuingPlace),
    nationality: prefer(preferred.nationality?.value || parsed.nationality, current.nationality),
  };

  if (ownerTag === 'tenant') {
    common.fullName = prefer(preferred.name?.value || parsed.fullName, current.fullName);
  }

  return common;
};

export const mapTenantIdentityToTenant = ({ parsed = {}, current = {}, preferred = {}, sourceType }) => ({
  ...current,
  fullName: prefer(preferred.name?.value || parsed.fullName, current.fullName),
  nationality: prefer(preferred.nationality?.value || parsed.nationality, current.nationality),
  dateOfBirth: prefer(parsed.dateOfBirth, current.dateOfBirth),
  gender: prefer(parsed.sex, current.gender),
  idExpiryDate: prefer(parsed.expiryDate, current.idExpiryDate),
  identityIssueDate: prefer(parsed.issueDate, current.identityIssueDate),
  identityIssuingPlace: prefer(parsed.placeOfIssue, current.identityIssuingPlace),
  passportNo: prefer(parsed.passportNo, current.passportNo),
  residencePermitNo: prefer(parsed.permitNo, current.residencePermitNo),
  sponsor: prefer(parsed.sponsor, current.sponsor),
  employer: prefer(parsed.employer, current.employer),
  visaType: prefer(parsed.visaType, current.visaType),
  immigrationFileNo: prefer(parsed.fileNo, current.immigrationFileNo),
  unifiedNo: prefer(parsed.unifiedNo, current.unifiedNo),
  lastIdentityDocumentType: sourceType || parsed.documentType || current.lastIdentityDocumentType || '',
});
