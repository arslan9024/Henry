/**
 * [Category 5: Config / Constants]
 * White Caves Real Estate - Dubai Property Types, Communities & Tenancy Policy Options
 * Standardized DLD / RERA option lists (< 100 lines).
 */

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Townhouse',
  'Penthouse',
  'Duplex',
  'Commercial Office',
  'Retail Shop',
  'Warehouse',
];

export const DUBAI_COMMUNITIES = [
  'Dubai Marina',
  'Downtown Dubai',
  'Palm Jumeirah',
  'Business Bay',
  'Jumeirah Village Circle (JVC)',
  'Dubai Hills Estate',
  'DIFC',
  'Dubai Creek Harbour',
  'Arabian Ranches',
  'Jumeirah Lakes Towers (JLT)',
  'Meydan / MBR City',
  'Other / Custom Location',
];

export const USAGE_CLASSES = ['Residential', 'Commercial', 'Industrial'];

export const MAINTENANCE_LIMITS = [
  'AED 500',
  'AED 1,000 (RERA Standard)',
  'AED 1,500',
  'AED 2,000',
  'All Minor by Tenant',
];

export const NOTICE_PERIODS = ['90 Days (Dubai Law 26/2007)', '60 Days', '30 Days'];

export const OCCUPANT_POLICIES = [
  'Family Only',
  'Single Executive',
  'Shared (Max 2 Occupants)',
  'Commercial Staff',
];

export const GRACE_PERIODS = [
  'None (Immediate)',
  '7 Days Rent-Free',
  '14 Days Rent-Free',
  '30 Days Rent-Free',
];

export const EJARI_PAYERS = ['Tenant (Standard RERA)', 'Landlord', '50/50 Split'];

export const CHILLER_POLICIES = [
  'Tenant Account (Empower / DEWA)',
  'Chiller Free (Included by Landlord)',
  'Fixed Cooling Surcharge',
];

export const STUDIO_PREVIEW_PAGES = [
  { num: 1, label: 'P1: Contract Grid (24 Fields)' },
  { num: 2, label: 'P2: DLD Standard Terms' },
  { num: 3, label: 'P3: 5 Special Clauses' },
  { num: 4, label: 'P4: RERA Addendum 1' },
  { num: 5, label: 'P5: RERA Addendum 2' },
  { num: 6, label: 'P6: RERA Addendum 3' },
  { num: 7, label: 'P7: Payment Receipt' },
];

export const HANDOVER_CHECKLIST_ITEMS = [
  { id: 'eid', label: 'Tenant Emirates ID & Passport verified on ICP', checked: true },
  { id: 'title', label: 'Title Deed ownership matched on Dubai Land Department portal', checked: true },
  { id: 'dewa', label: 'DEWA Move-in premise active and registered', checked: true },
  { id: 'cheques', label: 'All advance post-dated cheques deposited in White Caves vault', checked: true },
  { id: 'keys', label: 'Access cards, parking tags & keys inspected and ready for handover', checked: false },
];
