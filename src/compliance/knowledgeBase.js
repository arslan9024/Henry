import knowledgeBase from '../data/KnowledgeBase.json';
import {
  differenceInDays,
  formatCurrency,
  getReraAllowedIncreasePercent,
  sanitizeNumber,
  todayDate,
} from './utils/dateUtils';

const buildWarning = (rule, message, extra = {}) => ({
  id: rule.id,
  title: rule.title,
  severity: rule.severity,
  message,
  sourceTitle: rule.sourceTitle,
  citation: rule.citation,
  category: rule.category,
  verificationStatus: knowledgeBase.metadata.verificationStatus,
  ...extra,
});

const evaluateNoticeWindowRule = (rule, documentData) => {
  const currentRent = sanitizeNumber(documentData?.renewal?.currentRent);
  const proposedRent = sanitizeNumber(documentData?.renewal?.proposedRent);
  if (!proposedRent || proposedRent <= currentRent) return null;

  const renewalDate = documentData?.renewal?.renewalDate || documentData?.payments?.contractEndDate;
  const noticeSentDate = documentData?.renewal?.noticeSentDate;
  const minimumDays = rule.logic?.minimumDays || 90;

  if (!noticeSentDate) {
    const daysRemaining = differenceInDays(todayDate(), renewalDate);
    if (daysRemaining !== null && daysRemaining < minimumDays) {
      return buildWarning(
        rule,
        `Renewal is only ${daysRemaining} day(s) away and no notice date is recorded for the proposed rent increase.`,
        { field: 'renewal.noticeSentDate' },
      );
    }
    return buildWarning(rule, 'A notice date should be recorded before issuing a rent increase at renewal.', {
      field: 'renewal.noticeSentDate',
    });
  }

  const noticeGap = differenceInDays(noticeSentDate, renewalDate);
  if (noticeGap !== null && noticeGap < minimumDays) {
    return buildWarning(
      rule,
      `Recorded notice gap is ${noticeGap} day(s); at least ${minimumDays} day(s) should be allowed before renewal for a rent increase.`,
      { field: 'renewal.noticeSentDate' },
    );
  }

  return null;
};

const evaluateReraTierRule = (rule, documentData) => {
  const currentRent = sanitizeNumber(documentData?.renewal?.currentRent);
  const proposedRent = sanitizeNumber(documentData?.renewal?.proposedRent);
  const marketRent = sanitizeNumber(documentData?.renewal?.marketRent);

  if (!currentRent || !proposedRent || !marketRent) {
    return buildWarning(
      rule,
      'Current rent, proposed rent, and market rent should all be captured to validate the RERA tiered increase formula.',
      { field: 'renewal.marketRent' },
    );
  }

  if (proposedRent <= currentRent) return null;

  const allowedPercent = getReraAllowedIncreasePercent({ currentRent, marketRent });
  const maximumRent = currentRent * (1 + allowedPercent / 100);

  if (proposedRent > maximumRent) {
    return buildWarning(
      rule,
      `Proposed rent ${formatCurrency(proposedRent)} exceeds the estimated tier allowance of ${allowedPercent}% (max ${formatCurrency(maximumRent)} from current rent ${formatCurrency(currentRent)}).`,
      { field: 'renewal.proposedRent' },
    );
  }

  return null;
};

const evaluateSharedHousingRule = (rule, documentData) => {
  const occupancy = documentData?.occupancy || {};
  if (!occupancy.isSharedHousing) return null;

  if (!occupancy.sharedHousingPermitNumber) {
    return buildWarning(rule, 'Shared housing is enabled but no permit number is recorded.', {
      field: 'occupancy.sharedHousingPermitNumber',
    });
  }

  if (!occupancy.ejariOccupantsRegistered) {
    return buildWarning(rule, 'Shared housing occupants should be registered in Ejari before issue.', {
      field: 'occupancy.ejariOccupantsRegistered',
    });
  }

  return null;
};

const evaluateEvictionRule = (rule, documentData) => {
  const eviction = documentData?.eviction || {};
  if (eviction.reason !== 'personal-use') return null;

  const minimumDays = rule.logic?.minimumDays || 365;
  const endDate = documentData?.renewal?.renewalDate || documentData?.payments?.contractEndDate;
  const noticeGap = differenceInDays(eviction.noticeDate, endDate);

  if (
    eviction.noticeMethod &&
    !['notarized', 'court-notice', 'registered-mail'].includes(eviction.noticeMethod)
  ) {
    return buildWarning(
      rule,
      'Personal-use eviction notice should not rely only on WhatsApp or email; notarized service is expected.',
      {
        field: 'eviction.noticeMethod',
      },
    );
  }

  if (!eviction.noticeDate || noticeGap === null || noticeGap < minimumDays) {
    return buildWarning(
      rule,
      `Personal-use eviction notice should be recorded at least ${minimumDays} day(s) before the end/renewal date.`,
      {
        field: 'eviction.noticeDate',
      },
    );
  }

  return null;
};

const evaluators = {
  minimumNoticeDays: evaluateNoticeWindowRule,
  reraTierFormula: evaluateReraTierRule,
  sharedHousingPermit: evaluateSharedHousingRule,
  notarizedEvictionNotice: evaluateEvictionRule,
};

export const evaluateKnowledgeBaseRules = (templateKey, documentData) => {
  return knowledgeBase.rules
    .filter((rule) => rule.appliesToTemplates.includes(templateKey))
    .map((rule) => {
      const evaluateRule = evaluators[rule.logic?.type];
      return evaluateRule ? evaluateRule(rule, documentData) : null;
    })
    .filter(Boolean);
};

export const knowledgeBaseMeta = knowledgeBase.metadata;
