import { describe, expect, it } from 'vitest';
import {
  formatExtractedArea,
  mapEmiratesIdToParty,
  mapTenantIdentityToTenant,
  mapTitleDeedToProperty,
} from './extractionAutofillService';

describe('extractionAutofillService', () => {
  it('formats extracted area without losing either unit', () => {
    expect(formatExtractedArea({ areaSqMeter: 140, areaSqFeet: 1506.95 })).toBe('140 sqm / 1506.95 sqft');
    expect(formatExtractedArea({ areaSqMeter: 140 })).toBe('140 sqm');
    expect(formatExtractedArea({})).toBe('');
  });

  it('maps all supported title deed metadata while preserving absent current values', () => {
    const result = mapTitleDeedToProperty(
      {
        issueDate: '01/08/2026',
        mortgageStatus: 'Not mortgaged',
        propertyType: 'Villa',
        community: 'Damac Hills 2',
        plotNo: 'P-44',
        municipalityNo: 'M-12',
        areaSqMeter: 140,
        ownerName: 'Owner One',
        ownerNumber: '778899',
        landRegistrationNo: 'LR-1',
        purchaseDate: '01/01/2020',
        purchaseAmountAed: 900000,
        certificateNo: 'CERT-2',
      },
      { unit: '449', makaniNo: 'existing-makani' },
    );

    expect(result).toMatchObject({
      unit: '449',
      makaniNo: 'existing-makani',
      documentDate: '01/08/2026',
      titleDeedMortgageStatus: 'Not mortgaged',
      titleDeedOwnerName: 'Owner One',
      titleDeedOwnerNumber: '778899',
      landRegistrationNo: 'LR-1',
      titleDeedPurchaseAmountAed: 900000,
      titleDeedCertificateNo: 'CERT-2',
    });
  });

  it('maps richer Emirates ID fields and only maps full name for tenant', () => {
    const parsed = {
      idNumber: '784-1990-1234567-1',
      fullName: 'Parsed Name',
      dateOfBirth: '01/01/1990',
      nationality: 'UAE',
      issuingDate: '01/01/2024',
      expiryDate: '01/01/2029',
      sex: 'M',
      cardNumber: '123456',
      occupation: 'Engineer',
      employer: 'White Caves',
      issuingPlace: 'Dubai',
    };

    const tenant = mapEmiratesIdToParty({
      parsed,
      current: {},
      preferred: { name: { value: 'Preferred Name' }, nationality: { value: 'Emirati' } },
      ownerTag: 'tenant',
    });
    expect(tenant).toMatchObject({
      fullName: 'Preferred Name',
      nationality: 'Emirati',
      dateOfBirth: '01/01/1990',
      gender: 'M',
      idIssueDate: '01/01/2024',
      identityCardNumber: '123456',
      occupation: 'Engineer',
      employer: 'White Caves',
      idIssuingPlace: 'Dubai',
    });

    const landlord = mapEmiratesIdToParty({
      parsed,
      current: { name: 'Locked Owner' },
      ownerTag: 'landlord',
    });
    expect(landlord.name).toBe('Locked Owner');
  });

  it('maps passport and residence permit metadata into distinct tenant fields', () => {
    const result = mapTenantIdentityToTenant({
      parsed: {
        fullName: 'Tenant One',
        passportNo: 'P1234567',
        permitNo: 'RP-88',
        dateOfBirth: '02/02/1992',
        sex: 'F',
        issueDate: '01/01/2025',
        expiryDate: '01/01/2027',
        placeOfIssue: 'Dubai',
        sponsor: 'Sponsor One',
        employer: 'Employer One',
        visaType: 'Employment',
        fileNo: 'FILE-1',
        unifiedNo: 'UID-1',
      },
      current: { contactNo: '+971500000000' },
      preferred: { nationality: { value: 'Jordanian' } },
      sourceType: 'residence-permit',
    });

    expect(result).toMatchObject({
      contactNo: '+971500000000',
      passportNo: 'P1234567',
      residencePermitNo: 'RP-88',
      nationality: 'Jordanian',
      identityIssueDate: '01/01/2025',
      identityIssuingPlace: 'Dubai',
      sponsor: 'Sponsor One',
      immigrationFileNo: 'FILE-1',
      unifiedNo: 'UID-1',
      lastIdentityDocumentType: 'residence-permit',
    });
  });
});
