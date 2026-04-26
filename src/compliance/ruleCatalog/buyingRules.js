/**
 * buyingRules.js
 * DLD compliance rules for buying offer letters
 * Henry's compliance engine evaluates offers against these critical requirements
 */

export const buyingRules = {
  offer: [
    {
      id: 'OFR-1',
      severity: 'critical',
      message: 'Buyer Emirates ID or valid passport is required for DLD submission.',
    },
    {
      id: 'OFR-2',
      severity: 'important',
      message: 'Seller registration (Emirates ID or Trade License) must be provided.',
    },
    {
      id: 'OFR-3',
      severity: 'important',
      message: 'Property RERA permit number should be verified and included.',
    },
    { id: 'OFR-4', severity: 'important', message: 'Earnest money deposit should be 5-10% of offer price.' },
    {
      id: 'OFR-5',
      severity: 'important',
      message: 'Financing contingency clause with 7-day pre-approval period is recommended.',
    },
    {
      id: 'OFR-6',
      severity: 'info',
      message: 'Offer validity date should be clearly stated (typically 3-7 days).',
    },
  ],
};
