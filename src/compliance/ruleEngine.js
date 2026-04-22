import { leasingRules } from './ruleCatalog/leasingRules';
import { buyingRules } from './ruleCatalog/buyingRules';

// Merge leasing and buying rules into one ruleset
const allRules = { ...leasingRules, ...buyingRules };

export const evaluateCompliance = (templateKey, documentData) => {
  const catalog = allRules[templateKey] || [];
  const warnings = [];

  catalog.forEach((rule) => {
    let shouldRaise = false;

    if (rule.id === 'BOOK-1' && !documentData.tenant.fullName) shouldRaise = true;
    else if (rule.id === 'BOOK-2' && !documentData.tenant.emiratesId) shouldRaise = true;
    else if (rule.id === 'GOV-1' && documentData.tenant.category === 'government-military') shouldRaise = false;
    else if (rule.id === 'TEN-1' && (!documentData.landlord.name || !documentData.tenant.fullName)) shouldRaise = true;
    else if (rule.id.startsWith('BOOK') || rule.id.startsWith('TEN') || rule.id.startsWith('INV') || rule.id.startsWith('VIEW') || rule.id.startsWith('ADD') || rule.id.startsWith('KEY')) {
      shouldRaise = shouldRaise || false;
    }

    if (shouldRaise || rule.id !== 'BOOK-1' && rule.id !== 'BOOK-2' && rule.id !== 'TEN-1') {
      warnings.push(rule);
    }
  });

  return warnings;
};
