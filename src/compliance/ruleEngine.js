import { leasingRules } from './ruleCatalog/leasingRules';
import { buyingRules } from './ruleCatalog/buyingRules';
import { evaluateKnowledgeBaseRules } from './knowledgeBase';

// Merge leasing and buying rules into one ruleset
const allRules = { ...leasingRules, ...buyingRules };

const evaluateLegacyRule = (rule, documentData) => {
  switch (rule.id) {
    case 'BOOK-1':
      return !documentData.tenant.fullName;
    case 'BOOK-2':
      return !documentData.tenant.emiratesId;
    case 'BOOK-3':
      return (
        !documentData.payments.moveInDate ||
        !documentData.payments.contractStartDate ||
        !documentData.payments.contractEndDate
      );
    case 'GOV-1':
      return !documentData.tenant.occupation;
    case 'GOV-2':
      return !documentData.payments.signingDeadline;
    case 'ADD-1':
      // Check the addendum's own contract reference, not the property reference
      return !documentData.addendum?.originalContractRef;
    case 'ADD-2':
      return !documentData.tenant.fullName;
    case 'ADD-3':
      return !documentData.addendum?.effectiveDate;
    case 'TEN-1':
      return !documentData.landlord.name || !documentData.tenant.fullName;
    case 'TEN-2':
      return !documentData.occupancy.ejariOccupantsRegistered;
    case 'INV-1':
      return !documentData.landlord.name || !documentData.payments.total;
    case 'VIEW-1':
      return !documentData.property.unit || !documentData.property.community;
    case 'VIEW-2':
      return !documentData.property.documentDate;
    case 'VIEW-3':
      return (
        !documentData.broker?.orn ||
        !documentData.broker?.brn ||
        !documentData.broker?.commercialLicenseNumber
      );
    case 'VIEW-4':
      return (
        !documentData.tenant.fullName || (!documentData.tenant.emiratesId && !documentData.tenant.passportNo)
      );
    case 'VIEW-5':
      return !documentData.property.makaniNo || !documentData.property.plotNo;
    case 'VIEW-6':
      return !documentData.viewing?.rentalBudget;
    case 'KEY-1':
      return !documentData.occupancy.occupants;
    case 'OFR-1':
      return !documentData.tenant.emiratesId;
    case 'OFR-2':
      return !documentData.landlord.name;
    case 'OFR-3':
      return !documentData.property.referenceNo;
    case 'OFR-4':
      return !documentData.payments.securityDeposit;
    case 'OFR-5':
      return !documentData.payments.signingDeadline;
    case 'OFR-6':
      return !documentData.property.documentDate;
    default:
      return false;
  }
};

export const evaluateCompliance = (templateKey, documentData) => {
  const catalog = allRules[templateKey] || [];
  const legacyWarnings = catalog.filter((rule) => evaluateLegacyRule(rule, documentData));
  const knowledgeBaseWarnings = evaluateKnowledgeBaseRules(templateKey, documentData);

  return [...legacyWarnings, ...knowledgeBaseWarnings];
};
