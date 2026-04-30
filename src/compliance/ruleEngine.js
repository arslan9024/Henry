import { leasingRules } from './ruleCatalog/leasingRules';
import { buyingRules } from './ruleCatalog/buyingRules';
import { evaluateKnowledgeBaseRules } from './knowledgeBase';

// Merge leasing and buying rules into one ruleset
const allRules = { ...leasingRules, ...buyingRules };

export const evaluateCompliance = (templateKey, documentData) => {
  const catalog = allRules[templateKey] || [];
  // Each rule carries its own `evaluate` predicate — no switch statement needed.
  const legacyWarnings = catalog.filter((rule) => rule.evaluate(documentData));
  const knowledgeBaseWarnings = evaluateKnowledgeBaseRules(templateKey, documentData);

  return [...legacyWarnings, ...knowledgeBaseWarnings];
};
