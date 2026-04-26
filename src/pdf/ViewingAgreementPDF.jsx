import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDateDisplay } from '../compliance/utils/dateUtils';
import { getPublicAsset } from './pdfHelpers';

// =============================================================================
// ViewingAgreementPDF — Faithful reproduction of the official DLD/RERA
// "Property Viewing Agreement" form (Ref: DLD/RERA/RL/LP/P210 No.3/Vr.4 — Aug 2022).
// 2 pages, A4 portrait, bilingual EN ⇄ AR, RERA "soft-green" section bands.
// =============================================================================

const RERA_GREEN = '#cdd9b1';
const NAVY = '#1f2a4d';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#cbd5e1';

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 70,
    paddingHorizontal: 24,
    fontSize: 9,
    color: INK,
    fontFamily: 'Helvetica',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  govLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 130 },
  govLabel: { fontSize: 7, fontWeight: 700 },
  rightLogos: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end', width: 220 },
  rightLabel: { fontSize: 8, fontWeight: 700, color: NAVY, textAlign: 'right' },
  titleBlock: { alignItems: 'center', flexGrow: 1 },
  titleEn: { fontSize: 14, fontWeight: 700, letterSpacing: 1 },
  titleAr: { fontSize: 9, color: MUTED, marginTop: 2 },
  agreementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
  },
  agreementLabel: { fontSize: 9, fontWeight: 700 },
  agreementValue: { fontSize: 9, paddingHorizontal: 8 },
  // Section band — RERA pale green
  sectionBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RERA_GREEN,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  sectionEn: { fontSize: 10, fontWeight: 700, color: INK },
  sectionAr: { fontSize: 10, fontWeight: 700, color: INK, textAlign: 'right' },
  sectionBody: {
    borderWidth: 0.5,
    borderColor: LINE,
    borderTopWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  // Field rows
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 0.4,
    borderBottomColor: '#e5e7eb',
  },
  fieldEnLabel: { width: 145, fontSize: 8.5, fontWeight: 700 },
  fieldValue: {
    flexGrow: 1,
    fontSize: 9,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderStyle: 'dashed',
    minHeight: 12,
  },
  fieldArLabel: { width: 130, fontSize: 8.5, fontWeight: 700, textAlign: 'right' },
  // Two columns side-by-side
  twoCol: { flexDirection: 'row', gap: 8 },
  miniCol: {
    flexBasis: 0,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.4,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 3,
  },
  miniEn: { width: 80, fontSize: 8.5, fontWeight: 700 },
  miniValue: {
    flexGrow: 1,
    fontSize: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderStyle: 'dashed',
    minHeight: 12,
  },
  miniAr: { width: 70, fontSize: 8.5, fontWeight: 700, textAlign: 'right' },
  // Checkbox row (Type / Use)
  checkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.4,
    borderBottomColor: '#e5e7eb',
  },
  checkOption: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 10 },
  checkbox: { width: 8, height: 8, borderWidth: 0.8, borderColor: INK },
  checkboxFilled: { backgroundColor: NAVY, borderColor: NAVY },
  // Signatures
  sigBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RERA_GREEN,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 14,
  },
  sigBandEn: { fontSize: 10, fontWeight: 700 },
  sigBandAr: { fontSize: 10, fontWeight: 700 },
  sigBox: { borderWidth: 0.5, borderColor: LINE, borderTopWidth: 0, padding: 10, minHeight: 110 },
  sigStage: { position: 'relative', width: 220, height: 90, marginTop: 4 },
  sigImage: { width: 120, height: 60, position: 'absolute', top: 12, left: 0, zIndex: 10 },
  stampImage: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 4,
    left: 130,
    opacity: 0.85,
    transform: 'rotate(-8deg)',
    zIndex: 5,
  },
  sigCaption: { fontSize: 8, color: INK, marginTop: 6 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 24,
    right: 24,
    fontSize: 7,
    color: MUTED,
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 4,
  },
});

const dash = (v) => (v === undefined || v === null || v === '' ? '' : String(v));

const Field = ({ en, ar, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldEnLabel}>{en}</Text>
    <Text style={styles.fieldValue}>{dash(value)}</Text>
    <Text style={styles.fieldArLabel}>{ar}</Text>
  </View>
);

const TwoMini = ({ leftEn, leftAr, leftValue, rightEn, rightAr, rightValue }) => (
  <View style={styles.twoCol}>
    <View style={styles.miniCol}>
      <Text style={styles.miniEn}>{leftEn}</Text>
      <Text style={styles.miniValue}>{dash(leftValue)}</Text>
      <Text style={styles.miniAr}>{leftAr}</Text>
    </View>
    <View style={styles.miniCol}>
      <Text style={styles.miniEn}>{rightEn}</Text>
      <Text style={styles.miniValue}>{dash(rightValue)}</Text>
      <Text style={styles.miniAr}>{rightAr}</Text>
    </View>
  </View>
);

const SectionBand = ({ en, ar }) => (
  <View style={styles.sectionBand}>
    <Text style={styles.sectionEn}>{en}</Text>
    <Text style={styles.sectionAr}>{ar}</Text>
  </View>
);

const Header = () => (
  <View style={styles.header}>
    <View style={styles.govLeft}>
      <Image src={getPublicAsset('logo.png')} style={{ width: 28, height: 28, objectFit: 'contain' }} />
      <Text style={styles.govLabel}>GOVERNMENT{'\n'}OF DUBAI</Text>
    </View>
    <View style={styles.titleBlock}>
      <Text style={styles.titleAr}>اتفاقية معاينة عقار</Text>
      <Text style={styles.titleEn}>Property Viewing Agreement</Text>
    </View>
    <View style={styles.rightLogos}>
      <Text style={styles.rightLabel}>Land Department · RERA{'\n'}دائرة الأراضي والأملاك</Text>
    </View>
  </View>
);

const Footer = () => (
  <Text style={styles.footer} fixed>
    DLD/RERA/RL/LP/P210/ No.3 / Vr.4 / Issue Date: Aug.2022 · White Caves Real Estate L.L.C · Dubai, U.A.E.
  </Text>
);

const Checkbox = ({ checked }) => <View style={[styles.checkbox, checked ? styles.checkboxFilled : null]} />;

const TypeRow = ({ type }) => {
  const t = String(type || 'Villa').toLowerCase();
  const opts = [
    { en: 'Villa', ar: 'فيلا', key: 'villa' },
    { en: 'Apartment', ar: 'شقة', key: 'apartment' },
    { en: 'Shop', ar: 'محل', key: 'shop' },
    { en: 'Office', ar: 'مكتب', key: 'office' },
    { en: 'Warehouse', ar: 'مستودع', key: 'warehouse' },
    { en: 'Other', ar: 'أخرى', key: 'other' },
  ];
  return (
    <View style={styles.checkRow}>
      <Text style={styles.fieldEnLabel}>Type</Text>
      {opts.map((o) => (
        <View key={o.key} style={styles.checkOption}>
          <Checkbox checked={t === o.key} />
          <Text style={{ fontSize: 8.5 }}>{o.en}</Text>
          <Text style={{ fontSize: 8.5 }}>{o.ar}</Text>
        </View>
      ))}
      <Text style={[styles.fieldArLabel, { marginLeft: 'auto' }]}>نوع العقار</Text>
    </View>
  );
};

const UseRow = ({ usage }) => {
  const u = String(usage || 'Residential').toLowerCase();
  const opts = [
    { en: 'COM', ar: 'تجاري', key: 'commercial' },
    { en: 'RES', ar: 'سكني', key: 'residential' },
    { en: 'Other', ar: 'أخرى', key: 'other' },
  ];
  return (
    <View style={styles.checkRow}>
      <Text style={styles.fieldEnLabel}>Use</Text>
      {opts.map((o) => (
        <View key={o.key} style={styles.checkOption}>
          <Checkbox checked={u === o.key || (o.key === 'residential' && u === 'res')} />
          <Text style={{ fontSize: 8.5 }}>{o.en}</Text>
          <Text style={{ fontSize: 8.5 }}>{o.ar}</Text>
        </View>
      ))}
      <Text style={[styles.fieldArLabel, { marginLeft: 'auto' }]}>الاستخدام</Text>
    </View>
  );
};

const ViewingAgreementPDF = ({ documentData }) => {
  const { broker = {}, tenant = {}, property = {}, viewing = {} } = documentData || {};

  return (
    <Document title="DLD/RERA Property Viewing Agreement">
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <Header />

        <View style={styles.agreementRow}>
          <Text style={styles.agreementLabel}>Agreement Number:</Text>
          <Text style={styles.agreementValue}>{dash(viewing.agreementNumber)}</Text>
          <Text style={styles.agreementLabel}>:رقم الإتفاقية</Text>
        </View>

        <SectionBand en="BROKER DETAILS" ar="بيانات الوسيط" />
        <View style={styles.sectionBody}>
          <Field en="ORN" ar="رقم تسجيل المكتب" value={broker.orn} />
          <Field en="Company Name" ar="اسم المؤسسة" value={broker.companyName} />
          <Field
            en="Commercial License Number"
            ar="رقم الترخيص التجاري"
            value={broker.commercialLicenseNumber}
          />
          <TwoMini
            leftEn="Broker's Name"
            leftAr="اسم الوسيط"
            leftValue={broker.brokerName}
            rightEn="BRN"
            rightAr="رقم تسجيل الوسيط"
            rightValue={broker.brn}
          />
          <TwoMini
            leftEn="Phone"
            leftAr="رقم الهاتف"
            leftValue={broker.phone}
            rightEn="Mobile"
            rightAr="رقم الجوال"
            rightValue={broker.mobile}
          />
          <Field en="Address" ar="العنوان" value={broker.address} />
          <Field en="Email" ar="البريد الالكتروني" value={broker.email} />
        </View>

        <SectionBand en="TENANT DETAILS" ar="بيانات المستاجر" />
        <View style={styles.sectionBody}>
          <Field en="Tenant's Name" ar="اسم المستأجر" value={tenant.fullName} />
          <TwoMini
            leftEn="Passport No"
            leftAr="رقم جواز السفر"
            leftValue={tenant.passportNo}
            rightEn="Emirates ID"
            rightAr="رقم بطاقة الهوية"
            rightValue={tenant.emiratesId}
          />
          <TwoMini
            leftEn="Phone"
            leftAr="الهاتف"
            leftValue={tenant.contactNo}
            rightEn="Mobile"
            rightAr="الهاتف المتحرك"
            rightValue={tenant.contactNo}
          />
          <Field en="P.O.Box" ar="صندوق البريد" value={tenant.poBox} />
          <Field en="Address" ar="العنوان" value={tenant.address} />
          <Field en="Email" ar="البريد الإلكتروني" value={tenant.email} />
          <Field en="Additional Information" ar="ملاحظات عامه" value={viewing.additionalInfo} />
        </View>

        <SectionBand en="PROPERTY DETAILS" ar="بيانات العقار" />
        <View style={styles.sectionBody}>
          <TwoMini
            leftEn="Property Status"
            leftAr="حالة العقار"
            leftValue={property.propertyStatus}
            rightEn="Plot No. & Area"
            rightAr="رقم الارض والمنطقة"
            rightValue={[property.plotNo, property.community].filter(Boolean).join(' / ')}
          />
          <TypeRow type={property.propertyType} />
          <TwoMini
            leftEn="Area"
            leftAr="المساحة"
            leftValue={property.size}
            rightEn="Makani ID"
            rightAr="رقم مكاني"
            rightValue={property.makaniNo}
          />
          <UseRow usage={property.usage} />
          <Field en="Project Name" ar="اسم المشروع" value={property.projectName} />
          <TwoMini
            leftEn="Building No."
            leftAr="رقم المبنى"
            leftValue={property.buildingNumber}
            rightEn="Owners' Assoc. No"
            rightAr="رقم جمعية الملاك"
            rightValue={property.ownersAssociationNo}
          />
          <TwoMini
            leftEn="No. Car Parks"
            leftAr="عدد مواقف السيارات"
            leftValue={property.parkingCount}
            rightEn="Approx. Rental Budget"
            rightAr="القيمة التقديرية للإيجار"
            rightValue={viewing.rentalBudget}
          />
          <Field
            en="Services and General Information"
            ar="الخدمات والملاحظات العامه"
            value={viewing.servicesNotes}
          />
        </View>

        <Footer />
      </Page>

      {/* PAGE 2 — Signatures */}
      <Page size="A4" style={styles.page}>
        <Header />

        <SectionBand en="FIRST PARTY [THE BROKER OFFICE]" ar="الطرف الاول [مكتب الوساطة]" />
        <View style={styles.sigBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.sigCaption}>Signature:</Text>
            <Text style={styles.sigCaption}>
              Date: {formatDateDisplay(property.documentDate || new Date())}
            </Text>
            <Text style={styles.sigCaption}>:التوقيع / التاريخ</Text>
          </View>
          <View style={styles.sigStage}>
            <Image src={getPublicAsset('signature.png')} style={styles.sigImage} />
            <Image src={getPublicAsset('stamp.png')} style={styles.stampImage} />
          </View>
          <Text style={styles.sigCaption}>
            {broker.brokerName || 'Broker'} — {broker.companyName || 'White Caves Real Estate L.L.C'}
          </Text>
          <Text style={styles.sigCaption}>Office Stamp / ختم المكتب</Text>
        </View>

        <SectionBand en="SECOND PARTY (THE TENANT(S))" ar="الطرف الثاني (المستاجر)" />
        <View style={styles.sigBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.sigCaption}>Tenant Name: {dash(tenant.fullName)}</Text>
            <Text style={styles.sigCaption}>اسم المستأجر</Text>
          </View>
          <View style={[styles.sigStage, { marginTop: 16 }]}>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderTopWidth: 0.6,
                borderTopColor: INK,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={styles.sigCaption}>Signature</Text>
            <Text style={styles.sigCaption}>التوقيع</Text>
          </View>
        </View>

        <Footer />
      </Page>
    </Document>
  );
};

export default ViewingAgreementPDF;
