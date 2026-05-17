/**
 * KeyHandoverPDF.jsx
 * @react-pdf/renderer A4 vector PDF for the Key Handover & Maintenance
 * Confirmation document. Mirrors the on-screen template layout and uses the
 * same White Caves brand tokens used across all PDF exports.
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─── Brand tokens ────────────────────────────────────────────────────────────
const RED = '#b71c1c';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const LIGHT = '#f9fafb';
const FAINT = '#fafafa';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: INK,
    fontFamily: 'Helvetica',
  },
  // ── Company header ──────────────────────────────────────────────────────
  header: {
    borderBottomWidth: 2,
    borderBottomColor: RED,
    paddingBottom: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: { flexShrink: 1 },
  company: { fontSize: 12, fontWeight: 700, color: INK },
  companyMeta: { fontSize: 8, color: MUTED, marginTop: 2 },
  headerRight: { textAlign: 'right' },
  companyBrand: { fontSize: 8, fontWeight: 700, color: RED },
  // ── Document title block ────────────────────────────────────────────────
  titleBlock: { marginBottom: 10, alignItems: 'center' },
  docTitle: { fontSize: 15, fontWeight: 700, letterSpacing: 1, color: INK },
  docSubtitle: { fontSize: 8, color: MUTED, marginTop: 2 },
  docMeta: { fontSize: 8, color: MUTED, marginTop: 3 },
  // ── Section card ───────────────────────────────────────────────────────
  section: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    backgroundColor: LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: 700,
    color: RED,
  },
  // ── Key/value rows ──────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  rowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    backgroundColor: FAINT,
  },
  rowLast: {
    flexDirection: 'row',
  },
  label: {
    width: 160,
    backgroundColor: LIGHT,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontWeight: 700,
    color: '#374151',
  },
  value: {
    flexGrow: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 8.5,
    color: INK,
  },
  // ── Clause list ────────────────────────────────────────────────────────
  clauseWrap: { paddingHorizontal: 8, paddingVertical: 6 },
  clause: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  clauseNum: { width: 18, fontSize: 8.5, color: RED, fontWeight: 700 },
  clauseText: { flexGrow: 1, fontSize: 8.5, lineHeight: 1.55, color: INK },
  clauseStrong: { fontWeight: 700 },
  // ── Condition table ─────────────────────────────────────────────────────
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeadCell: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
    fontWeight: 700,
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    backgroundColor: FAINT,
  },
  tableCell: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 8.5, color: INK },
  // ── Signature block ─────────────────────────────────────────────────────
  signWrap: { flexDirection: 'row', gap: 16, marginTop: 8 },
  signBox: {
    flexGrow: 1,
    borderWidth: 0.5,
    borderColor: LINE,
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
  },
  signTitle: { fontSize: 8.5, fontWeight: 700, color: '#374151', marginBottom: 20 },
  signLine: {
    borderTopWidth: 0.8,
    borderTopColor: '#111827',
    paddingTop: 3,
    marginTop: 22,
    fontSize: 8,
    color: MUTED,
  },
  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 14,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 4,
    textAlign: 'center',
    fontSize: 7,
    color: MUTED,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const safe = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  const v = String(value).trim();
  return v || fallback;
};

// ─── Component ───────────────────────────────────────────────────────────────

const KeyHandoverPDF = ({ documentData }) => {
  const company = documentData?.company || {};
  const doc = documentData?.keyHandover || {};

  // Condition table rows
  const conditionRows = [
    { item: 'Walls & Paint', condition: doc.wallsCondition, notes: doc.wallsNotes },
    { item: 'Flooring', condition: doc.flooringCondition, notes: doc.flooringNotes },
    { item: 'AC & Ventilation', condition: doc.acCondition, notes: doc.acNotes },
    { item: 'Appliances / Fixtures', condition: doc.fixturesCondition, notes: doc.fixturesNotes },
    { item: 'Cleaning Status', condition: doc.cleaningStatus, notes: doc.cleaningNotes },
  ];

  const clauses = [
    {
      strong: 'Pre-Handover Maintenance:',
      text: ` The landlord completed cleaning, repainting, and AC service before ${safe(doc.handoverDate, '[date]')}. Tenant accepts property in "Ready to Move" condition.`,
    },
    {
      strong: 'Keys & Access Items:',
      text: ' The tenant received all keys, fobs, and remotes (doors, mailbox, parking, gates). All must be returned at tenancy end or replacement charges apply.',
    },
    {
      strong: 'Furnishing Status:',
      text: ' Property is unfurnished. No furniture or fixtures provided by the landlord.',
    },
    {
      strong: 'Tenant Utilities:',
      text: ` Tenant responsible for all utilities from ${safe(doc.handoverDate, '[date]')}.`,
    },
    {
      strong: 'Required Documentation:',
      text: ` Tenants must provide Ejari certificate, DEWA receipt, and DAMAC Move-In Permit to Property Manager by ${safe(doc.docDeadline, '[date]')}.`,
    },
    {
      strong: 'Defect Reporting Window:',
      text: ` Joint inspection and photos completed on ${safe(doc.handoverDate, '[date]')}. Latent defects reported within 14 days will be rectified at no cost.`,
    },
    {
      strong: 'Security Deposit Terms:',
      text: ` Security deposit ${safe(doc.securityDeposit, 'AED [amount]')} is non-refundable if property is not returned clean, undamaged, with proof of professional cleaning, repainting, AC service, and pest control.`,
    },
    {
      strong: 'Repair Responsibility:',
      text: ' Minor repairs (< AED 1,000) = Tenant responsibility. Major repairs (≥ AED 1,000) = Landlord responsibility via Property Manager.',
    },
    {
      strong: 'Maintenance & Communications:',
      text: ` All maintenance requests and tenancy communications must be directed to the Property Manager: ${safe(doc.propertyManagerPhone, '[Phone]')}.`,
    },
  ];

  return (
    <Document title="Key Handover & Maintenance Confirmation">
      <Page size="A4" style={styles.page}>
        {/* ── Company header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.company}>{safe(company.name, 'White Caves Real Estate L.L.C')}</Text>
            <Text style={styles.companyMeta}>Office D-72, El-Shaye-4, Port Saeed, Dubai</Text>
            <Text style={styles.companyMeta}>Office: +971 4 335 0592 | Mobile: +971563616136</Text>
            <Text style={styles.companyMeta}>Website: whitecaves.com | Email: the.white.caves@gmail.com</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyBrand}>WHITE CAVES</Text>
            <Text style={[styles.companyMeta, { textAlign: 'right' }]}>Real Estate LLC</Text>
          </View>
        </View>

        {/* ── Document title ────────────────────────────────────────── */}
        <View style={styles.titleBlock}>
          <Text style={styles.docTitle}>KEY HANDOVER &amp; MAINTENANCE CONFIRMATION</Text>
          <Text style={styles.docSubtitle}>PROPERTY HANDOVER · MOVE-IN CONFIRMATION</Text>
          <Text style={styles.docMeta}>
            Date: {safe(doc.handoverDate, '[Date]')} | Reference: {safe(doc.referenceNumber, 'KH-[AUTO]')}
          </Text>
        </View>

        {/* ── Section 1: Property & Parties ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Property &amp; Handover Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Property</Text>
            <Text style={styles.value}>{safe(doc.propertyAddress, '[Property address]')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tenant</Text>
            <Text style={styles.value}>{safe(doc.tenantName, '[Tenant name]')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Landlord</Text>
            <Text style={styles.value}>{safe(doc.landlordName, '[Landlord name]')}</Text>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.label}>Property Manager</Text>
            <Text style={styles.value}>{safe(doc.propertyManagerPhone, '[Phone]')}</Text>
          </View>
        </View>

        {/* ── Section 2: Timeline & Terms ──────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Handover Timeline &amp; Terms</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Key Handover Date</Text>
            <Text style={styles.value}>{safe(doc.handoverDate, '[Date]')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Grace Period</Text>
            <Text style={styles.value}>
              {safe(doc.gracePeriodStart, '[Date]')} to {safe(doc.gracePeriodEnd, '[Date]')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Rent Commences</Text>
            <Text style={styles.value}>
              {safe(doc.rentStartDate, '[Date]')}
              {doc.monthlyRent ? `  (${doc.monthlyRent}` : ''}
              {doc.paymentType ? `, ${doc.paymentType})` : doc.monthlyRent ? ')' : ''}
            </Text>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.label}>Contract Expiry</Text>
            <Text style={styles.value}>{safe(doc.contractExpiryDate, '[Date]')}</Text>
          </View>
        </View>

        {/* ── Section 3: Clauses ────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Handover &amp; Maintenance Clauses</Text>
          <View style={styles.clauseWrap}>
            {clauses.map((c, i) => (
              <View key={i} style={styles.clause}>
                <Text style={styles.clauseNum}>{i + 1}.</Text>
                <Text style={styles.clauseText}>
                  <Text style={styles.clauseStrong}>{c.strong}</Text>
                  {c.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Section 4: Property Condition Table ──────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Property Condition Acceptance</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, { width: 160 }]}>Item / Area</Text>
            <Text style={[styles.tableHeadCell, { width: 100 }]}>Condition</Text>
            <Text style={[styles.tableHeadCell, { flexGrow: 1 }]}>Notes</Text>
          </View>
          {conditionRows.map((r, i) => (
            <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[styles.tableCell, { width: 160, fontWeight: 700 }]}>{r.item}</Text>
              <Text style={[styles.tableCell, { width: 100 }]}>{safe(r.condition, 'Good')}</Text>
              <Text style={[styles.tableCell, { flexGrow: 1 }]}>{safe(r.notes, '—')}</Text>
            </View>
          ))}
        </View>

        {/* ── Section 5: Signatures ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✍️ Acceptance &amp; Signatures</Text>
          <Text
            style={[
              styles.clauseText,
              { paddingHorizontal: 8, paddingVertical: 5, fontSize: 8, color: MUTED, fontStyle: 'italic' },
            ]}
          >
            Both parties confirm receipt of property in "Ready to Move" condition and acceptance of all terms
            above.
          </Text>
        </View>
        <View style={styles.signWrap}>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Tenant Signature &amp; Acceptance</Text>
            <Text style={styles.signLine}>
              Name: {safe(doc.tenantName, '______________________________')} | Date:{' '}
              {safe(doc.handoverDate, '__________')}
            </Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Landlord / Representative Signature</Text>
            <Text style={styles.signLine}>
              Name: {safe(doc.landlordName, '______________________________')} | Date:{' '}
              {safe(doc.handoverDate, '__________')}
            </Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Property Manager Witness</Text>
            <Text style={styles.signLine}>
              {safe(doc.propertyManagerName, '______________________________')} |{' '}
              {safe(doc.propertyManagerPhone, '___________')}
            </Text>
          </View>
        </View>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <Text style={styles.footer}>
          White Caves Real Estate LLC | DED License 1388443 | Dubai, U.A.E.{'\n'}
          Document generated by Henry Record Keeper. Reference: {safe(doc.referenceNumber, 'KH-[AUTO]')}
        </Text>
      </Page>
    </Document>
  );
};

export default KeyHandoverPDF;
