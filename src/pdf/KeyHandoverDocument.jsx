import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDateDisplay } from '../compliance/utils/dateUtils';
import { getPublicAsset } from './pdfHelpers';

const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#cbd5e1';
const NAVY = '#1f2a4d';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 56,
    paddingHorizontal: 36,
    fontSize: 10,
    color: INK,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    color: NAVY,
  },
  companyMeta: {
    fontSize: 7.5,
    color: MUTED,
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  headerRefLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerRefValue: {
    fontSize: 9,
    color: INK,
  },
  titleBar: {
    backgroundColor: NAVY,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 3,
    marginBottom: 16,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 13,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  section: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0.8,
    borderBottomColor: LINE,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  fieldLabel: {
    width: 160,
    backgroundColor: '#fafafa',
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 8.5,
    fontWeight: 700,
    color: '#374151',
  },
  fieldValue: {
    flexGrow: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 8.5,
    color: INK,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderBottomWidth: 0.8,
    borderBottomColor: LINE,
  },
  tableHeadItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 8.5,
    fontWeight: 700,
    color: NAVY,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  tableCell: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 8.5,
    color: INK,
  },
  colItem: { flexGrow: 1 },
  colCount: { width: 80, textAlign: 'center' },
  meterRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  meterLabel: {
    width: 160,
    backgroundColor: '#fafafa',
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 8.5,
    fontWeight: 700,
    color: '#374151',
  },
  meterValue: {
    flexGrow: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 8.5,
    color: INK,
  },
  sigWrap: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
  },
  sigBox: {
    flexGrow: 1,
    borderWidth: 0.8,
    borderColor: LINE,
    borderRadius: 4,
    padding: 10,
    minHeight: 100,
  },
  sigTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    paddingBottom: 4,
  },
  sigNameLabel: {
    fontSize: 7.5,
    color: MUTED,
    marginBottom: 2,
  },
  sigNameValue: {
    fontSize: 9,
    color: INK,
    marginBottom: 12,
  },
  sigImageArea: {
    height: 44,
    borderBottomWidth: 0.6,
    borderBottomColor: INK,
    marginBottom: 4,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  sigImage: {
    width: 90,
    height: 40,
    objectFit: 'contain',
  },
  sigLine: {
    fontSize: 7.5,
    color: MUTED,
    marginTop: 2,
  },
  sigPendingNote: {
    fontSize: 8,
    color: MUTED,
    marginTop: 18,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    left: 36,
    right: 36,
    bottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
});

const safe = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  const v = String(value).trim();
  return v ? v : fallback;
};

const safeNum = (value, fallback = '0') => {
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : fallback;
};

const FieldRow = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{safe(value)}</Text>
  </View>
);

const KeyHandoverDocument = ({ documentData }) => {
  const kh = documentData?.byTemplate?.keyHandover || {};

  const handoverDate = kh.handoverDate ? formatDateDisplay(kh.handoverDate) : formatDateDisplay(new Date());

  return (
    <Document title="Key Handover & Maintenance Confirmation">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={getPublicAsset('logo.png')} style={styles.logo} />
            <View>
              <Text style={styles.companyName}>White Caves Real Estate L.L.C</Text>
              <Text style={styles.companyMeta}>DED License: 1388443 · Dubai, U.A.E.</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {kh.referenceNumber ? (
              <>
                <Text style={styles.headerRefLabel}>Reference</Text>
                <Text style={styles.headerRefValue}>{kh.referenceNumber}</Text>
              </>
            ) : null}
            <Text style={[styles.headerRefLabel, { marginTop: 4 }]}>Date</Text>
            <Text style={styles.headerRefValue}>{handoverDate}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>KEY HANDOVER &amp; MAINTENANCE CONFIRMATION</Text>
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Property Details</Text>
          </View>
          <FieldRow label="Property Address" value={kh.propertyAddress} />
          <FieldRow label="Unit Number" value={kh.unit} />
          <FieldRow label="Handover Date" value={handoverDate} />
          <FieldRow label="Landlord Name" value={kh.landlordName} />
          <FieldRow label="Tenant Name" value={kh.tenantName} />
          <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>Tenant ID</Text>
            <Text style={styles.fieldValue}>{safe(kh.tenantId)}</Text>
          </View>
        </View>

        {/* Keys & Access Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Keys &amp; Access Items</Text>
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadItem, styles.colItem]}>Item</Text>
            <Text style={[styles.tableHeadItem, styles.colCount]}>Qty</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colItem]}>Door / Unit Keys</Text>
            <Text style={[styles.tableCell, styles.colCount]}>{safeNum(kh.keysHanded)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colItem]}>Parking Remotes</Text>
            <Text style={[styles.tableCell, styles.colCount]}>{safeNum(kh.parkingRemotes)}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.tableCell, styles.colItem]}>Access Cards</Text>
            <Text style={[styles.tableCell, styles.colCount]}>{safeNum(kh.accessCards)}</Text>
          </View>
        </View>

        {/* Meter Readings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meter Readings at Handover</Text>
          </View>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>Electricity (kWh)</Text>
            <Text style={styles.meterValue}>{safe(kh.meterReadingElec)}</Text>
          </View>
          <View style={styles.meterRow}>
            <Text style={styles.meterLabel}>Water (m³)</Text>
            <Text style={styles.meterValue}>{safe(kh.meterReadingWater)}</Text>
          </View>
          <View style={[styles.meterRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.meterLabel}>Gas (m³)</Text>
            <Text style={styles.meterValue}>{safe(kh.meterReadingGas)}</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Signatures</Text>
          </View>
          <View style={{ padding: 10 }}>
            <View style={styles.sigWrap}>
              {/* Landlord */}
              <View style={styles.sigBox}>
                <Text style={styles.sigTitle}>Landlord</Text>
                <Text style={styles.sigNameLabel}>Name</Text>
                <Text style={styles.sigNameValue}>{safe(kh.landlordName)}</Text>
                <View style={styles.sigImageArea}>
                  {kh.landlordSignature ? (
                    <Image src={getPublicAsset('signature.png')} style={styles.sigImage} />
                  ) : null}
                </View>
                <Text style={styles.sigLine}>
                  {kh.landlordSignature ? 'Signed' : 'Signature Pending'} · {handoverDate}
                </Text>
              </View>

              {/* Tenant */}
              <View style={styles.sigBox}>
                <Text style={styles.sigTitle}>Tenant</Text>
                <Text style={styles.sigNameLabel}>Name</Text>
                <Text style={styles.sigNameValue}>{safe(kh.tenantName)}</Text>
                <View style={styles.sigImageArea}>
                  {kh.tenantSignature ? (
                    <Image src={getPublicAsset('signature.png')} style={styles.sigImage} />
                  ) : null}
                </View>
                <Text style={styles.sigLine}>
                  {kh.tenantSignature ? 'Signed' : 'Signature Pending'} · {handoverDate}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>White Caves Real Estate L.L.C · DED: 1388443 · Dubai, U.A.E.</Text>
          <Text style={styles.footerText}>Document generated by Henry Record Keeper</Text>
        </View>
      </Page>
    </Document>
  );
};

export default KeyHandoverDocument;
