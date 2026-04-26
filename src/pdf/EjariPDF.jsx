import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatCurrency, formatDateDisplay } from '../compliance/utils/dateUtils';
import { getPublicAsset } from './pdfHelpers';

// =============================================================================
// EjariPDF — Faithful reproduction of the official DLD Unified Tenancy Contract
// (Government of Dubai · Dubai Land Department · Ejari).
//
// Field spec lives in: src/templates/sources/DLD_EJARI_OFFICIAL.md
// Layout: 3 pages, A4 portrait, bilingual EN ⇄ AR, navy section bands.
// =============================================================================

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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  govLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 150,
  },
  govLabel: {
    fontSize: 8,
    color: INK,
    fontWeight: 700,
  },
  dldRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 180,
    justifyContent: 'flex-end',
  },
  dldLabel: {
    fontSize: 9,
    color: NAVY,
    fontWeight: 700,
    textAlign: 'right',
  },
  titleBlock: {
    alignItems: 'center',
    flexGrow: 1,
  },
  titleEn: {
    fontSize: 16,
    fontWeight: 700,
    color: INK,
    letterSpacing: 4,
  },
  // Date row
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: LINE,
    marginBottom: 8,
  },
  dateEn: { fontSize: 9, color: INK },
  dateValue: { fontSize: 9, color: INK, marginHorizontal: 8 },
  dateAr: { fontSize: 9, color: INK },
  // Section band
  sectionBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NAVY,
    color: '#ffffff',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  sectionEn: { color: '#ffffff', fontSize: 10, fontWeight: 700 },
  sectionAr: { color: '#ffffff', fontSize: 10, fontWeight: 700, textAlign: 'right' },
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
  fieldEnLabel: {
    width: 110,
    flexShrink: 0,
    fontSize: 8.5,
    color: INK,
    fontWeight: 700,
  },
  fieldValue: {
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: 240,
    fontSize: 9,
    color: INK,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderStyle: 'dashed',
    minHeight: 12,
    // Prevent overflow into AR label: wrap long values within the value column.
    flexWrap: 'wrap',
  },
  fieldArLabel: {
    width: 130,
    flexShrink: 0,
    fontSize: 8.5,
    color: INK,
    fontWeight: 700,
    textAlign: 'right',
  },
  fieldSubEn: {
    fontSize: 7,
    color: MUTED,
    width: 110,
    paddingLeft: 0,
  },
  fieldSubAr: {
    fontSize: 7,
    color: MUTED,
    width: 130,
    textAlign: 'right',
  },
  // Two-column row (e.g., Plot/Makani)
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  // Property usage radio row
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 0.4,
    borderBottomColor: '#e5e7eb',
  },
  usageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 8,
  },
  radio: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: INK,
  },
  radioFilled: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  // Signatures
  sigBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NAVY,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  sigBandEn: { color: '#ffffff', fontSize: 9, fontWeight: 700 },
  sigBandAr: { color: '#ffffff', fontSize: 9, fontWeight: 700 },
  sigBox: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: LINE,
    borderTopWidth: 0,
    height: 70,
  },
  sigCell: {
    flexGrow: 1,
    flexBasis: 0,
    padding: 6,
    borderRightWidth: 0.5,
    borderRightColor: LINE,
  },
  sigCellLast: { borderRightWidth: 0 },
  sigLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  sigLabel: { fontSize: 7.5, color: INK },
  // Page 2 — Terms
  termsTwoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  termsCol: { flexBasis: 0, flexGrow: 1 },
  termItem: { fontSize: 8.2, color: INK, marginBottom: 5, lineHeight: 1.35 },
  termItemAr: { fontSize: 8.2, color: INK, marginBottom: 5, lineHeight: 1.35, textAlign: 'right' },
  // Page 3 — additional terms
  addTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  addTermNum: { width: 14, fontSize: 9 },
  addTermLine: {
    flexGrow: 1,
    fontSize: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: LINE,
    borderStyle: 'dashed',
    minHeight: 14,
    paddingHorizontal: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 24,
    right: 24,
    fontSize: 7.5,
    color: MUTED,
    textAlign: 'center',
    borderTopWidth: 0.5,
    borderTopColor: LINE,
    paddingTop: 4,
  },
});

const TERMS_EN = [
  'The tenant has inspected the premises and agreed to lease the unit on its current condition.',
  'Tenant undertakes to use the premises for designated purpose, tenant has no rights to transfer or relinquish the tenancy contract either with or to without counterpart to any without landlord written approval. Also, tenant is not allowed to sublease the premises or any part thereof to third party in whole or in part unless it is legally permitted.',
  'The tenant undertakes not to make any amendments, modifications or addendums to the premises subject of the contract without obtaining the landlord written approval. Tenant shall be liable for any damages or failure due to that.',
  'The tenant shall be responsible for payment of all electricity, water, cooling and gas charges resulting of occupying leased unit unless other condition agreed in written.',
  'The tenant must pay the rent amount in the manner and dates agreed with the landlord.',
  'The tenant fully undertakes to comply with all the regulations and instructions related to the management of the property and the use of the premises and of common areas such (parking, swimming pools, gymnasium, etc…).',
  'Tenancy contract parties declare all mentioned emails addresses and phone numbers are correct, all formal and legal notifications will be sent to those addresses in case of dispute between parties.',
  'The landlord undertakes to enable the tenant of the full use of the premises including its facilities (swimming pool, gym, parking lot, etc) and do the regular maintenance as intended unless other condition agreed in written, and not to do any act that would detract from the premises benefit.',
  'By signing this agreement from the first party, the "Landlord" hereby confirms and undertakes that he is the current owner of the property or his legal representative under legal power of attorney duly entitled by the competent authorities.',
  'Any disagreement or dispute may arise from execution or interpretation of this contract shall be settled by the Rental Dispute Center.',
  'This contract is subject to all provisions of Law No (26) of 2007 regulating the relation between landlords and tenants in the emirate of Dubai as amended, and as it will be changed or amended from time to time, as long with any related legislations and regulations applied in the emirate of Dubai.',
  'Any additional condition will not be considered in case it conflicts with law.',
  'In case of discrepancy occurs between Arabic and non Arabic texts with regards to the interpretation of this agreement or the scope of its application, the Arabic text shall prevail.',
  'The landlord undertakes to register this tenancy contract on EJARI affiliated to Dubai Land Department and provide with all required documents.',
];

// Arabic terms intentionally rendered as a single AR-direction column.
// react-pdf has limited RTL shaping; we keep AR text available for visual parity.
const TERMS_AR = [
  '١. عاين المستأجر الوحدة موضوع الايجار ووافق على إستئجار العقار على حالته الحالية.',
  '٢. يتعهد المستأجر باستعمال المأجور للغرض المخصص له، و لا يجوز للمستأجر تحويل أو التنازل عن عقد الايجار للغير بمقابل أو دون مقابل دون موافقة المالك خطياً، كما لا يجوز للمستأجر تأجير المأجور أو أي جزء منه من الباطن مالم يسمح بذلك قانوناً.',
  '٣. يتعهد المستأجر بعدم إجراء أي تعديلات أو إضافات على العقار موضوع العقد دون موافقة المالك الخطية، و يكون المستأجر مسؤولاً عن أي أضرار أو نقص أو تلف يلحق بالعقار.',
  '٤. يكون المستأجر مسؤولاً عن سداد كافة فواتير الكهرباء و المياه و التبريد و الغاز المترتبة عن اشغاله المأجور مالم يتم الاتفاق على غير ذلك كتابياً.',
  '٥. يتعهد المستأجر بسداد مبلغ الايجار المتفق عليه في هذا العقد في التواريخ و الطريقة المتفق عليها.',
  '٦. يلتزم المستأجر التقيد التام بالانظمة و التعليمات المتعلقة باستخدام المأجور و المنافع المشتركة (كمواقف السيارات، أحواض السباحة، النادي الصحي، الخ).',
  '٧. يقر أطراف التعاقد بصحة العناوين و أرقام الهواتف المذكورة أعلاه، و تكون تلك العناوين هي المعتمدة رسمياً للإخطارات و الأعلانات القضائية في حال نشوء أي نزاع بين أطراف العقد.',
  '٨. يتعهد المؤجر بتمكين المستأجر من الانتفاع التام بالعقار للغرض المؤجر لأجله و المرافق الخاصة به (حوض سباحة، نادي صحي، مواقف سيارات.... إلخ) كما يكون مسؤولاً عن أعمال الصيانة مالم يتم الاتفاق على غير ذلك، و عدم التعرض له في منفعة العقار.',
  '٩. يعتبر توقيع المؤجر على هذا العقد إقراراً منه بأنه المالك الحالي للعقار أو الوكيل القانوني للمالك بموجب وكالة قانونية موثقة وفق الأصول لدى الجهات المختصة.',
  '١٠. أي خلاف أو نزاع قد ينشأ عن تنفيذ أو تفسير هذا العقد يعود البت فيه لمركز فض المنازعات الإيجارية.',
  '١١. يخضع هذا العقد لكافة أحكام القانون رقم (26) لسنة 2007 بشأن تنظيم العلاقة بين مؤجري و مستأجري العقارات في إماراة دبي، و تعديلاته و أي تغيير أو تعديل يطرأ عليه من وقت لآخر، كما يخضع للتشريعات و اللوائح الأخرى ذات العلاقة النافذة في دبي.',
  '١٢. لا يعتد بأي شرط تم إضافته إلى هذا العقد في حال تعارضه مع القانون.',
  '١٣. في حال حدوث أي تعارض أو اختلاف في التفسير بين النص العربي و النص الأجنبي يعتمد النص العربي.',
  '١٤. يتعهد المؤجر بتسجيل عقد الايجار في نظام إيجاري التابع لدائرة الأراضي و الأملاك و توفير كافة المستندات اللازمة لذلك.',
];

const dash = (value) => {
  if (value === undefined || value === null || value === '') return '';
  return String(value);
};

const SectionBand = ({ en, ar }) => (
  <View style={styles.sectionBand} fixed={false}>
    <Text style={styles.sectionEn}>{en}</Text>
    <Text style={styles.sectionAr}>{ar}</Text>
  </View>
);

const Field = ({ en, ar, value, subEn, subAr }) => (
  <View style={styles.fieldRow}>
    <View>
      <Text style={styles.fieldEnLabel}>{en}</Text>
      {subEn ? <Text style={styles.fieldSubEn}>{subEn}</Text> : null}
    </View>
    <Text style={styles.fieldValue}>{dash(value)}</Text>
    <View>
      <Text style={styles.fieldArLabel}>{ar}</Text>
      {subAr ? <Text style={styles.fieldSubAr}>{subAr}</Text> : null}
    </View>
  </View>
);

const Signatures = () => (
  <View>
    <View style={styles.sigBand}>
      <Text style={styles.sigBandEn}>Signatures</Text>
      <Text style={styles.sigBandAr}>التوقيعات</Text>
    </View>
    <View style={styles.sigBox}>
      <View style={styles.sigCell}>
        <View style={styles.sigLabelRow}>
          <Text style={styles.sigLabel}>Tenant Signature</Text>
          <Text style={styles.sigLabel}>توقيع المستأجر</Text>
        </View>
        <View style={[styles.sigLabelRow, { marginTop: 4 }]}>
          <Text style={styles.sigLabel}>Date ____________</Text>
          <Text style={styles.sigLabel}>التاريخ</Text>
        </View>
      </View>
      <View style={[styles.sigCell, styles.sigCellLast]}>
        <View style={styles.sigLabelRow}>
          <Text style={styles.sigLabel}>Lessor's Signature</Text>
          <Text style={styles.sigLabel}>توقيع المؤجر</Text>
        </View>
        <View style={[styles.sigLabelRow, { marginTop: 4 }]}>
          <Text style={styles.sigLabel}>Date ____________</Text>
          <Text style={styles.sigLabel}>التاريخ</Text>
        </View>
      </View>
    </View>
  </View>
);

const Header = () => (
  <View style={styles.header}>
    <View style={styles.govLeft}>
      <Image src={getPublicAsset('logo.png')} style={{ width: 32, height: 32, objectFit: 'contain' }} />
      <Text style={styles.govLabel}>GOVERNMENT{'\n'}OF DUBAI</Text>
    </View>
    <View style={styles.titleBlock}>
      <Text style={styles.titleEn}>TENANCY CONTRACT</Text>
      <Text style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>عقد إيجار</Text>
    </View>
    <View style={styles.dldRight}>
      <Text style={styles.dldLabel}>Land Department{'\n'}دائرة الأراضي والأملاك</Text>
    </View>
  </View>
);

const Footer = () => (
  <Text style={styles.footer} fixed>
    Tel: 8004488 · Fax: +971 4 222 2251 · P.O. Box 1166, Dubai, U.A.E. · support@dubailand.gov.ae ·
    www.dubailand.gov.ae
  </Text>
);

const RadioRow = ({ usage }) => {
  const u = String(usage || 'Residential').toLowerCase();
  return (
    <View style={styles.usageRow}>
      <Text style={styles.fieldEnLabel}>Property Usage</Text>
      <View style={styles.usageOption}>
        <View style={[styles.radio, u === 'industrial' ? styles.radioFilled : null]} />
        <Text style={{ fontSize: 8.5 }}>Industrial</Text>
        <Text style={{ fontSize: 8.5 }}>صناعي</Text>
      </View>
      <View style={styles.usageOption}>
        <View style={[styles.radio, u === 'commercial' ? styles.radioFilled : null]} />
        <Text style={{ fontSize: 8.5 }}>Commercial</Text>
        <Text style={{ fontSize: 8.5 }}>تجاري</Text>
      </View>
      <View style={styles.usageOption}>
        <View style={[styles.radio, u === 'residential' || !u ? styles.radioFilled : null]} />
        <Text style={{ fontSize: 8.5 }}>Residential</Text>
        <Text style={{ fontSize: 8.5 }}>سكني</Text>
      </View>
      <Text style={[styles.fieldArLabel, { marginLeft: 'auto' }]}>استخدام العقار</Text>
    </View>
  );
};

const EjariPDF = ({ documentData }) => {
  const {
    company = {},
    property = {},
    tenant = {},
    landlord = {},
    payments = {},
    tenancy = {},
  } = documentData || {};
  // Additional terms come from tenancy.additionalTerms (not eviction)
  const additionalTerms = Array.isArray(tenancy.additionalTerms) ? tenancy.additionalTerms : [];

  const date = formatDateDisplay(property.documentDate || new Date());
  const location = [property.community, property.city].filter(Boolean).join(', ');

  return (
    <Document title="DLD Tenancy Contract (Ejari)">
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <Header />

        <View style={styles.dateRow}>
          <Text style={styles.dateEn}>Date</Text>
          <Text style={styles.dateValue}>{date}</Text>
          <Text style={styles.dateAr}>التاريخ</Text>
        </View>

        <SectionBand en="Owner / Lessor Information" ar="معلومات المالك/ المؤجر" />
        <View style={styles.sectionBody}>
          <Field en="Owner's Name" ar="اسم المالك" value={landlord.name} />
          <Field en="Lessor's Name" ar="اسم المؤجر" value={landlord.name} />
          <Field en="Lessor's Emirates ID" ar="الهوية الإماراتية للمؤجر" value={landlord.emiratesId} />
          <Field
            en="License No."
            ar="رقم الرخصة"
            value={company.dedLicense}
            subEn="Incase of a Company"
            subAr="في حال كانت شركة"
          />
          <Field
            en="Licensing Authority"
            ar="سلطة الترخيص"
            value={company.licensingAuthority || 'DED'}
            subEn="Incase of a Company"
            subAr="في حال كانت شركة"
          />
          <Field en="Lessor's Email" ar="البريد الإلكتروني للمؤجر" value={landlord.email} />
          <Field en="Lessor's Phone" ar="رقم هاتف المؤجر" value={landlord.phone} />
        </View>

        <SectionBand en="Tenant Information" ar="معلومات المستأجر" />
        <View style={styles.sectionBody}>
          <Field en="Tenant's Name" ar="اسم المستأجر" value={tenant.fullName} />
          <Field en="Tenant's Emirates ID" ar="الهوية الإماراتية للمستأجر" value={tenant.emiratesId} />
          <Field
            en="License No."
            ar="رقم الرخصة"
            value={tenant.licenseNo}
            subEn="Incase of a Company"
            subAr="في حال كانت شركة"
          />
          <Field
            en="Licensing Authority"
            ar="سلطة الترخيص"
            value={tenant.licensingAuthority}
            subEn="Incase of a Company"
            subAr="في حال كانت شركة"
          />
          <Field en="Tenant's Email" ar="البريد الإلكتروني للمستأجر" value={tenant.email} />
          <Field en="Tenant's Phone" ar="رقم هاتف المستأجر" value={tenant.contactNo} />
        </View>

        <SectionBand en="Property Information" ar="معلومات العقار" />
        <View style={styles.sectionBody}>
          <RadioRow usage={property.usage} />
          <Field en="Plot No." ar="رقم الأرض" value={property.plotNo} />
          <Field en="Makani No." ar="رقم مكاني" value={property.makaniNo} />
          <Field en="Building Name" ar="اسم المبنى" value={property.cluster} />
          <Field en="Property No." ar="رقم العقار" value={property.unit} />
          <Field en="Property Type" ar="نوع الوحدة" value={property.description} />
          <Field en="Property Area (s.m)" ar="مساحة العقار (متر.مربع)" value={property.size} />
          <Field en="Location" ar="الموقع" value={location} />
          <Field en="Premises No. (DEWA)" ar="رقم المبنى (ديوا)" value={property.dewaPremisesNo} />
        </View>

        <SectionBand en="Contract Information" ar="معلومات العقد" />
        <View style={styles.sectionBody}>
          <Field
            en="Contract Period"
            ar="فترة العقد"
            value={`From ${formatDateDisplay(payments.contractStartDate)}  -  To ${formatDateDisplay(payments.contractEndDate)}`}
          />
          <Field
            en="Contract Value"
            ar="قيمة العقد"
            value={payments.total ? formatCurrency(payments.total) : ''}
          />
          <Field
            en="Annual Rent"
            ar="الايجار السنوي"
            value={payments.annualRent ? formatCurrency(payments.annualRent) : ''}
          />
          <Field
            en="Security Deposit Amount"
            ar="مبلغ التأمين"
            value={payments.securityDeposit ? formatCurrency(payments.securityDeposit) : ''}
          />
          <Field en="Mode of Payment" ar="طريقة الدفع" value={payments.modeOfPayment} />
        </View>

        <Signatures />
        <Footer />
      </Page>

      {/* PAGE 2 — Terms */}
      <Page size="A4" style={styles.page}>
        <Header />
        <SectionBand en="Terms and Conditions" ar="الأحكام و الشروط" />
        <View style={styles.sectionBody}>
          <View style={styles.termsTwoCol}>
            <View style={styles.termsCol}>
              {TERMS_EN.map((t, i) => (
                <Text key={`en-${i}`} style={styles.termItem}>{`${i + 1}. ${t}`}</Text>
              ))}
            </View>
            <View style={styles.termsCol}>
              {TERMS_AR.map((t, i) => (
                <Text key={`ar-${i}`} style={styles.termItemAr}>
                  {t}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <Signatures />
        <Footer />
      </Page>

      {/* PAGE 3 — Rights / Attachments / Additional Terms */}
      <Page size="A4" style={styles.page}>
        <Header />

        <SectionBand en="Know your Rights" ar="لمعرفة حقوق الأطراف" />
        <View style={styles.sectionBody}>
          <Text style={styles.termItem}>
            • You may visit Rental Dispute Center website through www.dubailand.gov.ae in case of any rental
            dispute between parties.
          </Text>
          <Text style={styles.termItem}>
            • Law No 26 of 2007 regulating relationship between landlords and tenants.
          </Text>
          <Text style={styles.termItem}>• Law No 33 of 2008 amending law 26 of year 2007.</Text>
          <Text style={styles.termItem}>• Law No 43 of 2013 determining rent increases for properties.</Text>
        </View>

        <SectionBand en="Attachments for Ejari Registration" ar="مرفقات التسجيل في إيجاري" />
        <View style={styles.sectionBody}>
          <Text style={styles.termItem}>
            1. Original unified tenancy contract / نسخة أصلية عن عقد الايجار الموحد
          </Text>
          <Text style={styles.termItem}>
            2. Original Emirates ID of applicant / الهوية الإماراتية الأصلية لمقدم الطلب
          </Text>
        </View>

        <SectionBand en="Additional Terms" ar="شروط إضافية" />
        <View style={styles.sectionBody}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={`add-${i}`} style={styles.addTermRow}>
              <Text style={styles.addTermNum}>{i + 1}.</Text>
              <Text style={styles.addTermLine}>{dash(additionalTerms[i])}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 7.5, color: MUTED, marginTop: 6 }}>
            Note: You may add an addendum to this tenancy contract in case of additional terms; it must be
            signed by all parties.
          </Text>
        </View>

        <Signatures />
        <Footer />
      </Page>
    </Document>
  );
};

export default EjariPDF;
