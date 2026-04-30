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
    padding: 40,
    fontSize: 10,
    color: INK,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  companyBlock: {
    flexDirection: 'column',
    gap: 2,
  },
  companyName: {
    fontSize: 13,
    fontWeight: 700,
    color: NAVY,
  },
  companyMeta: {
    fontSize: 8,
    color: MUTED,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  docDateLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  docDateValue: {
    fontSize: 10,
    color: INK,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: NAVY,
    letterSpacing: 3,
    marginBottom: 2,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: NAVY,
    borderRadius: 2,
  },
  billSection: {
    marginBottom: 24,
  },
  billLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  billName: {
    fontSize: 12,
    fontWeight: 700,
    color: INK,
    marginBottom: 3,
  },
  billMeta: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    marginBottom: 20,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeadCell: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 9,
    fontWeight: 700,
    color: '#ffffff',
  },
  tableHeadDesc: {
    flexGrow: 1,
  },
  tableHeadAmt: {
    width: 120,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  tableCellDesc: {
    flexGrow: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 9.5,
    color: INK,
  },
  tableCellAmt: {
    width: 120,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 9.5,
    color: INK,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  totalLabel: {
    flexGrow: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: 700,
    color: '#ffffff',
  },
  totalValue: {
    width: 120,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'right',
  },
  notesBlock: {
    borderWidth: 0.5,
    borderColor: LINE,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  notesLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7.5,
    color: MUTED,
  },
});

const asAmount = (value) => {
  const n = Number(value || 0);
  return `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
};

const safe = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  const v = String(value).trim();
  return v ? v : fallback;
};

const InvoiceDocument = ({ documentData }) => {
  const company = documentData?.company || {};
  const tenant = documentData?.tenant || {};
  const payments = documentData?.payments || {};
  const property = documentData?.property || {};

  const docDate = formatDateDisplay(property.documentDate || new Date());

  const agencyFee = Number(payments.agencyFee || 0);
  const ejariFee = Number(payments.ejariFee || 0);
  const computedTotal = agencyFee + ejariFee;
  const totalDue = Number(payments.total || 0) || computedTotal;

  const moveInDate = payments.moveInDate ? formatDateDisplay(payments.moveInDate) : '—';

  return (
    <Document title="Invoice">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={getPublicAsset('logo.png')} style={styles.logo} />
            <View style={styles.companyBlock}>
              <Text style={styles.companyName}>{safe(company.name, 'White Caves Real Estate L.L.C')}</Text>
              <Text style={styles.companyMeta}>DED License: {safe(company.dedLicense, '1388443')}</Text>
              <Text style={styles.companyMeta}>Dubai, United Arab Emirates</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docDateLabel}>Date</Text>
            <Text style={styles.docDateValue}>{docDate}</Text>
            {property.unit ? (
              <>
                <Text style={[styles.docDateLabel, { marginTop: 6 }]}>Unit</Text>
                <Text style={styles.docDateValue}>{safe(property.unit)}</Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Bill To */}
        <View style={styles.billSection}>
          <Text style={styles.billLabel}>Bill To</Text>
          <Text style={styles.billName}>{safe(tenant.fullName, '[Tenant Name]')}</Text>
          {tenant.contactNo ? <Text style={styles.billMeta}>Tel: {tenant.contactNo}</Text> : null}
          {tenant.email ? <Text style={styles.billMeta}>Email: {tenant.email}</Text> : null}
          {moveInDate !== '—' ? <Text style={styles.billMeta}>Move-in Date: {moveInDate}</Text> : null}
        </View>

        {/* Invoice Table */}
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.tableHeadCell, styles.tableHeadDesc]}>Description</Text>
            <Text style={[styles.tableHeadCell, styles.tableHeadAmt]}>Amount</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellDesc}>Agency Fee</Text>
            <Text style={styles.tableCellAmt}>{asAmount(agencyFee)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellDesc}>Ejari Registration Fee</Text>
            <Text style={styles.tableCellAmt}>{asAmount(ejariFee)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>{asAmount(totalDue)}</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>Payment Notes</Text>
          <Text style={styles.notesText}>
            Please make payment via bank transfer or cheque to White Caves Real Estate L.L.C. All fees are
            inclusive of VAT where applicable. This invoice is valid for 30 days from the date of issue.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {safe(company.name, 'White Caves Real Estate L.L.C')} · DED: {safe(company.dedLicense, '1388443')}{' '}
            · Dubai, U.A.E.
          </Text>
          <Text style={styles.footerText}>Document generated by Henry Record Keeper</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceDocument;
