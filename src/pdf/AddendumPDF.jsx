import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDateDisplay } from '../compliance/utils/dateUtils';
import { getPublicAsset } from './pdfHelpers';

// =============================================================================
// AddendumPDF — RERA-compliant Standard Tenancy Addendum
// White Caves Real Estate — numbered-paragraph single-page PDF.
// Field spec: state.document.addendum (see documentSlice.js)
// =============================================================================

const RED = '#b71c1c';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const BAND_BG = '#fef2f2';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    color: INK,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: RED,
    paddingBottom: 8,
    marginBottom: 10,
  },
  logo: { width: 90, objectFit: 'contain' },
  titleWrap: { alignItems: 'center', flexGrow: 1 },
  docTitle: { fontSize: 15, fontWeight: 700, color: RED, letterSpacing: 1 },
  docSub: { fontSize: 8, color: MUTED, marginTop: 2 },
  companyBlock: { fontSize: 8, color: MUTED, textAlign: 'right', maxWidth: 130 },
  // Party row
  partyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  partyCol: { flexGrow: 1, flexBasis: 0 },
  partyLabel: { fontSize: 7.5, color: MUTED, marginBottom: 2, fontWeight: 700 },
  partyValue: { fontSize: 9, color: INK },
  // Section band
  band: {
    backgroundColor: BAND_BG,
    borderLeftWidth: 2.5,
    borderLeftColor: RED,
    paddingVertical: 3,
    paddingHorizontal: 7,
    marginTop: 7,
    marginBottom: 3,
  },
  bandText: { fontSize: 8.5, fontWeight: 700, color: RED },
  // Body text
  body: { fontSize: 8.5, color: INK, lineHeight: 1.4, marginBottom: 4, paddingHorizontal: 2 },
  // Labeled row
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
    borderBottomWidth: 0.4,
    borderBottomColor: LINE,
  },
  fieldLabel: { width: 140, fontSize: 8, color: MUTED, fontWeight: 700, flexShrink: 0 },
  fieldValue: { flexGrow: 1, flexShrink: 1, fontSize: 8.5, color: INK, flexWrap: 'wrap' },
  // Ordered list
  listItem: { flexDirection: 'row', marginBottom: 3, paddingHorizontal: 2 },
  listNum: { width: 14, fontSize: 8.5, color: RED, fontWeight: 700 },
  listText: { flexGrow: 1, flexShrink: 1, fontSize: 8.5, color: INK, lineHeight: 1.35, flexWrap: 'wrap' },
  // Signatory grid
  sigGrid: { flexDirection: 'row', gap: 8, marginTop: 6 },
  sigBox: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 0.5,
    borderColor: LINE,
    borderRadius: 4,
    padding: 6,
    minHeight: 54,
  },
  sigRole: { fontSize: 7.5, color: RED, fontWeight: 700, marginBottom: 2 },
  sigName: { fontSize: 8.5, color: INK, marginBottom: 1 },
  sigId: { fontSize: 7.5, color: MUTED, marginBottom: 8 },
  sigLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: INK,
    marginTop: 'auto',
    marginBottom: 2,
  },
  sigLineLabel: { fontSize: 7, color: MUTED },
  // Policy note
  policyNote: {
    fontSize: 7.5,
    color: '#92400e',
    backgroundColor: '#fffbeb',
    borderLeftWidth: 2,
    borderLeftColor: '#d97706',
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginTop: 3,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    fontSize: 7,
    color: MUTED,
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 3,
  },
  placeholder: { fontSize: 8.5, color: MUTED, fontStyle: 'italic' },
});

// ─── helpers ─────────────────────────────────────────────────────────────────
const safe = (v, fallback = '—') =>
  v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : fallback;

const Field = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{safe(value)}</Text>
  </View>
);

const Band = ({ title }) => (
  <View style={styles.band}>
    <Text style={styles.bandText}>{title}</Text>
  </View>
);

const SigBlock = ({ sigRole, name, idNo }) => (
  <View style={styles.sigBox}>
    <Text style={styles.sigRole}>{sigRole}</Text>
    <Text style={styles.sigName}>{safe(name)}</Text>
    {idNo ? <Text style={styles.sigId}>ID: {safe(idNo)}</Text> : null}
    <View style={styles.sigLine} />
    <Text style={styles.sigLineLabel}>Signature &amp; Date</Text>
  </View>
);

// ─── component ───────────────────────────────────────────────────────────────
const AddendumPDF = ({ documentData }) => {
  const { company = {}, property = {}, tenant = {}, landlord = {}, addendum = {} } = documentData || {};

  const services = Array.isArray(addendum.landlordServices) ? addendum.landlordServices : [];
  const clauses = Array.isArray(addendum.additionalClauses) ? addendum.additionalClauses : [];
  const effectiveDate = safe(addendum.effectiveDate, formatDateDisplay(new Date()));

  return (
    <Document title="Standard Tenancy Addendum (RERA)">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={getPublicAsset('logo.png')} style={styles.logo} />
          <View style={styles.titleWrap}>
            <Text style={styles.docTitle}>TENANCY ADDENDUM</Text>
            <Text style={styles.docSub}>Standard RERA-Compliant Addendum · Dubai</Text>
          </View>
          <Text style={styles.companyBlock}>
            {safe(company.name, 'White Caves Real Estate L.L.C')}
            {'\n'}
            DED: {safe(company.dedLicense)}
          </Text>
        </View>

        {/* Parties summary row */}
        <View style={styles.partyRow}>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>LANDLORD</Text>
            <Text style={styles.partyValue}>{safe(landlord.name)}</Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>TENANT</Text>
            <Text style={styles.partyValue}>{safe(tenant.fullName)}</Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>PROPERTY</Text>
            <Text style={styles.partyValue}>
              {safe(property.unit)}, {safe(property.community)}
            </Text>
          </View>
        </View>

        {/* 1. Contract Reference */}
        <Band title="1. Contract Reference" />
        <Field label="Original Contract Ref." value={addendum.originalContractRef} />
        <Field label="Original Contract Date" value={addendum.originalContractDate} />
        <Field label="Addendum Effective Date" value={effectiveDate} />

        {/* 2. Security Deposit */}
        <Band title="2. Security Deposit" />
        <Text style={styles.body}>
          The Security Deposit is fixed at{' '}
          <Text style={{ fontWeight: 700 }}>
            AED {Number(addendum.securityDeposit || 4000).toLocaleString()} (Four Thousand UAE Dirhams)
          </Text>
          , refundable at end of tenancy subject to satisfactory condition of the property and settlement of
          all obligations.
        </Text>
        <Text style={styles.policyNote}>
          ⚠ Fixed by White Caves policy — cannot be varied without written management approval.
        </Text>

        {/* 3. Renewal Charges & Notice Period */}
        <Band title="3. Renewal Charges &amp; Notice Period" />
        <Text style={styles.body}>
          Upon renewal, an administration charge of{' '}
          <Text style={{ fontWeight: 700 }}>
            AED {Number(addendum.renewalCharges || 1050).toLocaleString()} (inclusive of VAT)
          </Text>{' '}
          is payable by the Tenant. Both parties must provide written notice of intent to renew or terminate
          no later than <Text style={{ fontWeight: 700 }}>{addendum.noticePeriodDays || 90} days</Text> before
          expiry, per {safe(addendum.legalReference)}.
        </Text>

        {/* 4. Maintenance Responsibilities */}
        <Band title="4. Maintenance Responsibilities" />
        <Field
          label={`Tenant (≤ AED ${Number(addendum.maintenanceCap || 1000).toLocaleString()})`}
          value={addendum.maintenanceTenantResponsibility}
        />
        <Field label="Landlord (> AED 1,000)" value={addendum.maintenanceLandlordResponsibility} />

        {/* 5. Landlord Mandatory Services */}
        <Band title="5. Landlord Mandatory Services" />
        {services.length > 0 ? (
          services.map((s, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <View key={i} style={styles.listItem}>
              <Text style={styles.listNum}>{i + 1}.</Text>
              <Text style={styles.listText}>{s}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeholder}>None specified.</Text>
        )}

        {/* 6. RERA Compliance */}
        <Band title="6. RERA Legal Framework" />
        <Text style={styles.body}>
          This Addendum is governed by {safe(addendum.legalReference)} and all RERA Regulations. Any dispute
          shall be referred to the Dubai Land Department Rental Dispute Settlement Centre (RDSC).
        </Text>

        {/* 7. Additional Agreed Clauses */}
        <Band title="7. Additional Agreed Clauses" />
        {clauses.length > 0 ? (
          clauses.map((c, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <View key={i} style={styles.listItem}>
              <Text style={styles.listNum}>{i + 1}.</Text>
              <Text style={styles.listText}>{c}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeholder}>No additional clauses recorded.</Text>
        )}

        {/* 8. Signatories */}
        <Band title="8. Signatories" />
        <Text style={[styles.body, { marginBottom: 4 }]}>
          The undersigned parties agree to all terms contained in this Addendum.
        </Text>
        <View style={styles.sigGrid}>
          <SigBlock sigRole="Landlord" name={landlord.name} idNo={landlord.emiratesId} />
          <SigBlock sigRole="Tenant" name={tenant.fullName} idNo={tenant.emiratesId} />
          <SigBlock sigRole="Witness / Agent" name={addendum.witnessName} idNo={addendum.witnessIdNo} />
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {safe(company.name)} · DED {safe(company.dedLicense)} · Prepared {effectiveDate} · Governed by{' '}
          {safe(addendum.legalReference, 'Dubai Law No. 26 of 2007')}
        </Text>
      </Page>
    </Document>
  );
};

export default AddendumPDF;
