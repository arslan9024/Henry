/**
 * [Category 5: Config / Rules Engine]
 * White Caves Real Estate - Contract Comparison Diff Configuration
 */

export function buildDiffRows(page1 = {}, renewalDates = {}) {
  return [
    {
      field: 'Contract Start Date',
      key: 'date_from',
      oldVal: page1.date_from || '01-10-2025',
      newVal: renewalDates.startDate || '01-10-2026',
      badge: '🔄 +1 Year',
      type: 'renewal',
    },
    {
      field: 'Contract End Date',
      key: 'date_to',
      oldVal: page1.date_to || '30-09-2026',
      newVal: renewalDates.endDate || '30-09-2027',
      badge: '🔄 +1 Year',
      type: 'renewal',
    },
    {
      field: 'Annual Rent (AED)',
      key: 'annual_rent',
      oldVal: page1.annual_rent || '120,000',
      newVal: page1.annual_rent || '120,000',
      badge: '⚪ Same / Retained',
      type: 'same',
    },
    {
      field: 'Security Deposit (AED)',
      key: 'security_deposit',
      oldVal: page1.security_deposit || '6,000',
      newVal: page1.security_deposit || '6,000',
      badge: '⚪ Roll-Over',
      type: 'same',
    },
    {
      field: 'Tenant Legal Name',
      key: 'tenant_name',
      oldVal: page1.tenant_name || 'Verified Tenant',
      newVal: page1.tenant_name || 'Verified Tenant',
      badge: '✓ Confirmed',
      type: 'same',
    },
    {
      field: 'Property Unit / Building',
      key: 'property_no',
      oldVal: `${page1.property_no || 'Unit'} - ${page1.building_name || 'Building'}`,
      newVal: `${page1.property_no || 'Unit'} - ${page1.building_name || 'Building'}`,
      badge: '✓ Confirmed',
      type: 'same',
    },
  ];
}
