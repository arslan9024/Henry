import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatCurrency, formatDateDisplay } from '../compliance/utils/dateUtils';
import { getPublicAsset } from './pdfHelpers';

const WHITE_CAVES_RED = '#b71c1c';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: '#1f2937',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: WHITE_CAVES_RED,
    paddingBottom: 10,
    marginBottom: 12,
  },
  logo: {
    width: 110,
    objectFit: 'contain',
  },
  titleWrap: {
    gap: 4,
    maxWidth: 280,
  },
  documentTitle: {
    color: WHITE_CAVES_RED,
    fontSize: 20,
    fontWeight: 700,
  },
  companyText: {
    fontSize: 10,
    color: '#4b5563',
  },
  badge: {
    alignSelf: 'flex-start',
    color: WHITE_CAVES_RED,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fee2e2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 9,
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
  },
  sectionTitle: {
    color: WHITE_CAVES_RED,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  col: {
    flexGrow: 1,
    flexBasis: 0,
    gap: 4,
  },
  line: {
    marginBottom: 4,
  },
  label: {
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
  },
  cell: {
    flexGrow: 1,
    padding: 6,
    fontSize: 9,
  },
  totalCell: {
    flexGrow: 1,
    padding: 6,
    fontSize: 9,
    color: WHITE_CAVES_RED,
    fontWeight: 700,
    backgroundColor: '#f3f4f6',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 20,
  },
  signatureBlock: {
    flexGrow: 1,
    flexBasis: 0,
  },
  signatureStage: {
    position: 'relative',
    width: 200,
    height: 90,
    marginTop: 8,
  },
  signature: {
    width: 110,
    height: 56,
    position: 'absolute',
    top: 16,
    left: 0,
    zIndex: 10,
  },
  stamp: {
    width: 90,
    height: 90,
    position: 'absolute',
    top: 2,
    left: 120,
    opacity: 0.85,
    transform: 'rotate(-8deg)',
    zIndex: 5,
  },
  lineRule: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  note: {
    fontSize: 9,
    color: '#6b7280',
  },
});

const QuotationPDF = ({ documentData, templateKey = 'bookingGov' }) => {
  const { company, property, tenant, landlord, payments, renewal, occupancy } = documentData;
  const typeLabel =
    templateKey === 'bookingGov' ? 'Government Office Leasing Quotation' : 'Booking Quotation';

  return (
    <Document title={typeLabel}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.badge}>{typeLabel.toUpperCase()}</Text>

        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.documentTitle}>Quotation</Text>
            <Text style={styles.companyText}>Ref. {property.referenceNo}</Text>
            <Text style={styles.companyText}>Date: {formatDateDisplay(property.documentDate)}</Text>
            <Text style={styles.companyText}>{company.name}</Text>
          </View>

          <Image style={styles.logo} src={getPublicAsset('logo.png')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property and Applicant</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.line}>
                <Text style={styles.label}>Property:</Text> {property.community} - {property.cluster},{' '}
                {property.unit}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Description:</Text> {property.description}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Move-in Date:</Text> {formatDateDisplay(payments.moveInDate)}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Contract Period:</Text>{' '}
                {formatDateDisplay(payments.contractStartDate)} to{' '}
                {formatDateDisplay(payments.contractEndDate)}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.line}>
                <Text style={styles.label}>Tenant:</Text> {tenant.fullName || 'Pending review'}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Emirates ID:</Text> {tenant.emiratesId || 'Pending review'}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Contact:</Text> {tenant.contactNo || 'Pending review'}
              </Text>
              <Text style={styles.line}>
                <Text style={styles.label}>Category:</Text> {tenant.occupation || 'General applicant'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commercial Terms</Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Annual Rent:</Text> {formatCurrency(payments.annualRent)}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Security Deposit:</Text> {formatCurrency(payments.securityDeposit)}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Agency Fee:</Text> {formatCurrency(payments.agencyFee)}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Ejari Fee:</Text> {formatCurrency(payments.ejariFee)}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Renewal Check:</Text> Proposed {formatCurrency(renewal.proposedRent)}{' '}
            vs current {formatCurrency(renewal.currentRent)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>Due Date</Text>
            <Text style={styles.cell}>Amount</Text>
            <Text style={styles.cell}>Purpose</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{formatDateDisplay(property.documentDate)}</Text>
            <Text style={styles.cell}>{formatCurrency(payments.securityDeposit)}</Text>
            <Text style={styles.cell}>Booking deposit - White Caves</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>By {formatDateDisplay(payments.signingDeadline)}</Text>
            <Text style={styles.cell}>{formatCurrency(payments.agencyFee)}</Text>
            <Text style={styles.cell}>Agency fee</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cell}>By {formatDateDisplay(payments.signingDeadline)}</Text>
            <Text style={styles.cell}>{formatCurrency(payments.ejariFee)}</Text>
            <Text style={styles.cell}>Ejari registration</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.totalCell}>Total</Text>
            <Text style={styles.totalCell}>{formatCurrency(payments.total)}</Text>
            <Text style={styles.totalCell}>All amounts in AED</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Beneficiary and Compliance Snapshot</Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Landlord Beneficiary:</Text> {landlord.name}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>IBAN:</Text> {landlord.iban}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Shared Housing:</Text>{' '}
            {occupancy.isSharedHousing ? 'Yes - permit required' : 'No'}
          </Text>
          <Text style={styles.line}>
            <Text style={styles.label}>Ejari Occupants Registered:</Text>{' '}
            {occupancy.ejariOccupantsRegistered ? 'Yes' : 'Pending review'}
          </Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.note}>For White Caves Real Estate L.L.C</Text>
            <View style={styles.signatureStage}>
              <Image style={styles.signature} src={getPublicAsset('signature.png')} />
              <Image style={styles.stamp} src={getPublicAsset('stamp.png')} />
            </View>
            <Text style={styles.lineRule}>Arslan Malik - Managing Director</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.note}>Tenant acknowledgment</Text>
            <Text style={styles.lineRule}>Signature & Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default QuotationPDF;
