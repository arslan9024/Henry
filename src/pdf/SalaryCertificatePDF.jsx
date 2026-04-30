import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDateDisplay } from '../compliance/utils/dateUtils';

const RED = '#b71c1c';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: INK,
    fontFamily: 'Helvetica',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: RED,
    paddingBottom: 8,
    marginBottom: 12,
  },
  company: {
    fontSize: 12,
    fontWeight: 700,
    color: INK,
  },
  companyMeta: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    color: INK,
    fontWeight: 700,
    marginBottom: 3,
    letterSpacing: 1,
  },
  subTitle: {
    textAlign: 'center',
    fontSize: 8,
    color: MUTED,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
  },
  section: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 10,
    color: RED,
    fontWeight: 700,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  label: {
    width: 170,
    backgroundColor: '#fafafa',
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: 700,
    color: '#374151',
  },
  value: {
    flexGrow: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 9,
    color: INK,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
  },
  totalLabel: {
    width: 170,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
  },
  totalValue: {
    flexGrow: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'right',
  },
  signWrap: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 22,
  },
  signBox: {
    flexGrow: 1,
    borderWidth: 0.5,
    borderColor: LINE,
    borderRadius: 6,
    padding: 10,
    minHeight: 95,
  },
  signTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 14,
  },
  signLine: {
    borderTopWidth: 0.8,
    borderTopColor: '#111827',
    paddingTop: 4,
    marginTop: 30,
    fontSize: 8,
    color: MUTED,
  },
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

const asAmount = (value) => {
  const n = Number(value || 0);
  return n ? n.toLocaleString('en-AE', { minimumFractionDigits: 2 }) : '—';
};

const safe = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  const v = String(value).trim();
  return v ? v : fallback;
};

const SalaryCertificatePDF = ({ documentData }) => {
  const company = documentData?.company || {};
  const doc = documentData?.salaryCertificate || {};

  const issueDate = safe(doc.issueDate, formatDateDisplay(new Date()));

  const basicSalary = Number(doc.basicSalary || 0);
  const housingAllowance = Number(doc.housingAllowance || 0);
  const transportAllowance = Number(doc.transportAllowance || 0);
  const otherAllowance = Number(doc.otherAllowance || 0);
  const calculatedTotal = basicSalary + housingAllowance + transportAllowance + otherAllowance;
  const totalSalary = Number(doc.totalSalary || 0) || calculatedTotal;

  return (
    <Document title="Salary Certificate">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.company}>{safe(company.name, 'White Caves Real Estate L.L.C')}</Text>
          <Text style={styles.companyMeta}>
            DED License: {safe(company.dedLicense, '1388443')} | Dubai, U.A.E.
          </Text>
          <Text style={styles.companyMeta}>
            Reference: {safe(doc.referenceNumber, 'SC-[AUTO]')} | Date: {issueDate}
          </Text>
        </View>

        <Text style={styles.title}>SALARY CERTIFICATE</Text>
        <Text style={styles.subTitle}>Official Employment & Compensation Confirmation</Text>

        <Text style={styles.paragraph}>
          To Whom It May Concern{doc.issuedTo ? ` / ${doc.issuedTo}` : ''},{'\n'}
          This is to certify that {safe(doc.employeeName, '[Employee Full Name]')} is employed with{' '}
          {safe(company.name, 'White Caves Real Estate L.L.C')} as {safe(doc.designation, '[Designation]')}
          {doc.department ? ` in ${doc.department} Department` : ''} since{' '}
          {safe(doc.joiningDate, '[Joining Date]')}.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Employee Name</Text>
            <Text style={styles.value}>{safe(doc.employeeName, '[Employee Full Name]')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Employee ID</Text>
            <Text style={styles.value}>{safe(doc.employeeId, '[Employee ID]')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Designation</Text>
            <Text style={styles.value}>{safe(doc.designation, '[Designation]')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Employment Type</Text>
            <Text style={styles.value}>{safe(doc.employmentType, 'Full-Time, Permanent')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safe(doc.idType, 'Emirates ID')} No.</Text>
            <Text style={styles.value}>{safe(doc.idNumber, '[ID Number]')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salary Details ({safe(doc.currency, 'AED')})</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Basic Salary</Text>
            <Text style={[styles.value, { textAlign: 'right' }]}>{asAmount(doc.basicSalary)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Housing Allowance</Text>
            <Text style={[styles.value, { textAlign: 'right' }]}>{asAmount(doc.housingAllowance)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transport Allowance</Text>
            <Text style={[styles.value, { textAlign: 'right' }]}>{asAmount(doc.transportAllowance)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{safe(doc.otherAllowanceLabel, 'Other Allowance')}</Text>
            <Text style={[styles.value, { textAlign: 'right' }]}>{asAmount(doc.otherAllowance)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Monthly Salary</Text>
            <Text style={styles.totalValue}>
              {totalSalary ? totalSalary.toLocaleString('en-AE', { minimumFractionDigits: 2 }) : '—'}{' '}
              {safe(doc.currency, 'AED')}
            </Text>
          </View>
        </View>

        <View style={styles.signWrap}>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Authorised Signatory (HR / Management)</Text>
            <Text style={styles.signLine}>Name: {safe(doc.hrName, '[HR Name]')}</Text>
            <Text style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>
              Designation: {safe(doc.hrDesignation, 'HR Manager')}
            </Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signTitle}>Company Stamp</Text>
            <Text style={{ fontSize: 8, color: MUTED, marginTop: 34 }}>Official Seal / Stamp</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Issued upon employee request. Valid for {safe(doc.validityDays, '30')} days from issue date.
          Document generated by Henry Record Keeper.
        </Text>
      </Page>
    </Document>
  );
};

export default SalaryCertificatePDF;
