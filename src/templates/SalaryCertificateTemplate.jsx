/**
 * SalaryCertificateTemplate.jsx
 * Official Salary Certificate issued by White Caves Real Estate L.L.C.
 *
 * Used for: Bank loans, Visa applications, Tenancy applications,
 *           Government formalities, Embassy letters, RERA submissions.
 *
 * supportsPdf: true — generates a professional printable PDF via the standard
 * PrintButton / downloadQuotationPdf flow.
 *
 * Data lives in state.document.salaryCertificate (added to documentSlice).
 * Fallback placeholders are shown for any unpopulated field so the template
 * is always render-safe.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { selectDocument } from '../store/selectors';
import PrintLayout from '../components/PrintLayout';
import { Disclosure } from '../components/ui';

const SalaryCertificateTemplate = () => {
  const documentData = useSelector(selectDocument);
  const doc = documentData.salaryCertificate || {};
  const company = documentData.company || {};

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <PrintLayout documentType="salaryCertificate" documentTitle="Salary Certificate">
      <div className="doc-page">
        {/* ── COMPANY LETTERHEAD ─────────────────────────────────────── */}
        <div
          className="doc-section"
          style={{
            marginBottom: '12pt',
            paddingBottom: '8pt',
            borderBottom: '2pt solid #dc2626',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2pt 0', fontSize: '13pt', fontWeight: '700', color: '#1f2937' }}>
                WHITE CAVES REAL ESTATE L.L.C
              </p>
              <p style={{ margin: '0 0 2pt 0', fontSize: '8pt', color: '#6b7280' }}>
                Office D-72, El-Shaye-4, Port Saeed, Dubai, U.A.E.
              </p>
              <p style={{ margin: '0 0 2pt 0', fontSize: '8pt', color: '#6b7280' }}>
                DED License No.: {company.dedLicense || '1388443'} | RERA Registered
              </p>
              <p style={{ margin: '0 0 2pt 0', fontSize: '8pt', color: '#6b7280' }}>
                Tel: +971 4 335 0592 | Email: the.white.caves@gmail.com
              </p>
              <p style={{ margin: '0', fontSize: '8pt', color: '#6b7280' }}>Website: www.whitecaves.com</p>
            </div>
            <div style={{ textAlign: 'right', paddingLeft: '16pt' }}>
              <p style={{ margin: '0', fontSize: '28pt' }}>🏔️</p>
              <p
                style={{
                  margin: '0',
                  fontSize: '7pt',
                  fontWeight: '700',
                  color: '#dc2626',
                  letterSpacing: '0.05em',
                }}
              >
                WHITE CAVES
              </p>
              <p style={{ margin: '0', fontSize: '6pt', color: '#9ca3af' }}>Real Estate L.L.C</p>
            </div>
          </div>
        </div>

        {/* ── DOCUMENT TITLE ─────────────────────────────────────────── */}
        <div className="doc-header" style={{ textAlign: 'center', marginBottom: '16pt' }}>
          <h2
            style={{
              margin: '0 0 4pt 0',
              fontSize: '16pt',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            SALARY CERTIFICATE
          </h2>
          <span className="doc-badge doc-badge--leasing" style={{ fontSize: '8pt' }}>
            OFFICIAL DOCUMENT · WHITE CAVES REAL ESTATE L.L.C
          </span>
          <p style={{ margin: '6pt 0 0 0', fontSize: '8pt', color: '#6b7280' }}>
            Ref: {doc.referenceNumber || 'SC-[AUTO]'} &nbsp;|&nbsp; Date: {doc.issueDate || today}
          </p>
        </div>

        {/* ── TO WHOM IT MAY CONCERN ─────────────────────────────────── */}
        <div className="doc-section" style={{ marginBottom: '12pt', fontSize: '10pt', lineHeight: '1.7' }}>
          <p style={{ margin: '0 0 8pt 0' }}>
            <strong>To Whom It May Concern</strong>
            {doc.issuedTo ? (
              <span>
                {' '}
                / <strong>{doc.issuedTo}</strong>
              </span>
            ) : null}
          </p>
          <p style={{ margin: '0', textAlign: 'justify' }}>
            This is to certify that <strong>{doc.employeeName || '[Employee Full Name]'}</strong>
            {doc.nationality ? `, a national of ${doc.nationality},` : ''} holding{' '}
            {doc.idType || 'Emirates ID'} No. <strong>{doc.idNumber || '[ID Number]'}</strong>, is currently
            employed with <strong>{company.name || 'White Caves Real Estate L.L.C'}</strong> as a{' '}
            <strong>{doc.designation || '[Designation]'}</strong>
            {doc.department ? ` in the ${doc.department} Department` : ''}, effective from{' '}
            <strong>{doc.joiningDate || '[Joining Date]'}</strong>.
          </p>
        </div>

        {/* ── EMPLOYEE DETAILS ───────────────────────────────────────── */}
        <Disclosure title="Employee Details" icon="👤" defaultOpen>
          <table className="doc-table" style={{ width: '100%', fontSize: '10pt' }}>
            <tbody>
              <tr>
                <td
                  style={{ width: '45%', padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}
                >
                  Full Name
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.employeeName || '[Employee Full Name]'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                  Employee ID
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.employeeId || '[Employee ID]'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                  Designation / Title
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.designation || '[Designation]'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                  Department
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.department || '[Department]'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                  Date of Joining
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.joiningDate || '[DD MMMM YYYY]'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                  Employment Type
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.employmentType || 'Full-Time, Permanent'}</td>
              </tr>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                  {doc.idType || 'Emirates ID'} No.
                </td>
                <td style={{ padding: '5pt 8pt' }}>{doc.idNumber || '[ID Number]'}</td>
              </tr>
              {doc.passportNo ? (
                <tr>
                  <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                    Passport No.
                  </td>
                  <td style={{ padding: '5pt 8pt' }}>{doc.passportNo}</td>
                </tr>
              ) : null}
              {doc.nationality ? (
                <tr>
                  <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                    Nationality
                  </td>
                  <td style={{ padding: '5pt 8pt' }}>{doc.nationality}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Disclosure>

        {/* ── SALARY DETAILS ─────────────────────────────────────────── */}
        <Disclosure title="Salary Details" icon="💰" defaultOpen>
          <table className="doc-table" style={{ width: '100%', fontSize: '10pt' }}>
            <thead>
              <tr>
                <th
                  style={{
                    padding: '6pt 8pt',
                    textAlign: 'left',
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    fontSize: '9pt',
                  }}
                >
                  Component
                </th>
                <th
                  style={{
                    padding: '6pt 8pt',
                    textAlign: 'right',
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    fontSize: '9pt',
                  }}
                >
                  Amount ({doc.currency || 'AED'})
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb' }}>Basic Salary</td>
                <td style={{ padding: '5pt 8pt', textAlign: 'right' }}>
                  {doc.basicSalary
                    ? Number(doc.basicSalary).toLocaleString('en-AE', { minimumFractionDigits: 2 })
                    : '[Amount]'}
                </td>
              </tr>
              {doc.housingAllowance ? (
                <tr>
                  <td style={{ padding: '5pt 8pt' }}>Housing Allowance</td>
                  <td style={{ padding: '5pt 8pt', textAlign: 'right' }}>
                    {Number(doc.housingAllowance).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ) : null}
              {doc.transportAllowance ? (
                <tr>
                  <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb' }}>Transport Allowance</td>
                  <td style={{ padding: '5pt 8pt', textAlign: 'right', backgroundColor: '#f9fafb' }}>
                    {Number(doc.transportAllowance).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ) : null}
              {doc.otherAllowance ? (
                <tr>
                  <td style={{ padding: '5pt 8pt' }}>{doc.otherAllowanceLabel || 'Other Allowance'}</td>
                  <td style={{ padding: '5pt 8pt', textAlign: 'right' }}>
                    {Number(doc.otherAllowance).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ) : null}
              <tr style={{ borderTop: '2pt solid #1f2937' }}>
                <td
                  style={{
                    padding: '7pt 8pt',
                    fontWeight: '700',
                    fontSize: '11pt',
                    backgroundColor: '#1f2937',
                    color: '#fff',
                  }}
                >
                  Total Monthly Salary
                </td>
                <td
                  style={{
                    padding: '7pt 8pt',
                    textAlign: 'right',
                    fontWeight: '700',
                    fontSize: '11pt',
                    backgroundColor: '#1f2937',
                    color: '#fff',
                  }}
                >
                  {doc.totalSalary
                    ? Number(doc.totalSalary).toLocaleString('en-AE', { minimumFractionDigits: 2 })
                    : doc.basicSalary
                      ? Number(
                          (Number(doc.basicSalary) || 0) +
                            (Number(doc.housingAllowance) || 0) +
                            (Number(doc.transportAllowance) || 0) +
                            (Number(doc.otherAllowance) || 0),
                        ).toLocaleString('en-AE', { minimumFractionDigits: 2 })
                      : '[Total Amount]'}{' '}
                  {doc.currency || 'AED'}
                </td>
              </tr>
            </tbody>
          </table>
          {doc.salaryWordAmount ? (
            <p
              style={{
                margin: '8pt 0 0 0',
                fontSize: '9pt',
                fontStyle: 'italic',
                color: '#374151',
              }}
            >
              <strong>In Words:</strong> {doc.salaryWordAmount} Only
            </p>
          ) : null}
        </Disclosure>

        {/* ── BANK DETAILS (optional) ────────────────────────────────── */}
        {doc.bankName || doc.bankAccountNo || doc.iban ? (
          <Disclosure title="Salary Transfer Details" icon="🏦">
            <table className="doc-table" style={{ width: '100%', fontSize: '10pt' }}>
              <tbody>
                {doc.bankName ? (
                  <tr>
                    <td
                      style={{
                        width: '45%',
                        padding: '5pt 8pt',
                        backgroundColor: '#f9fafb',
                        fontWeight: '600',
                      }}
                    >
                      Bank Name
                    </td>
                    <td style={{ padding: '5pt 8pt' }}>{doc.bankName}</td>
                  </tr>
                ) : null}
                {doc.bankAccountNo ? (
                  <tr>
                    <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                      Account No.
                    </td>
                    <td style={{ padding: '5pt 8pt' }}>{doc.bankAccountNo}</td>
                  </tr>
                ) : null}
                {doc.iban ? (
                  <tr>
                    <td style={{ padding: '5pt 8pt', backgroundColor: '#f9fafb', fontWeight: '600' }}>
                      IBAN
                    </td>
                    <td style={{ padding: '5pt 8pt' }}>{doc.iban}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Disclosure>
        ) : null}

        {/* ── PURPOSE STATEMENT ──────────────────────────────────────── */}
        <div
          className="doc-section"
          style={{
            margin: '14pt 0',
            padding: '10pt 12pt',
            backgroundColor: '#f9fafb',
            border: '1pt solid #e5e7eb',
            borderRadius: '4pt',
            fontSize: '9.5pt',
            lineHeight: '1.7',
          }}
        >
          <p style={{ margin: '0' }}>
            This certificate is issued upon the request of the above-named employee and is valid for{' '}
            <strong>{doc.validityDays || '30'} days</strong> from the date of issue
            {doc.issuedTo ? ` for submission to ${doc.issuedTo}` : ''}.{' '}
            {company.name || 'White Caves Real Estate L.L.C'} shall not be liable for any misuse of this
            document.
          </p>
        </div>

        {/* ── AUTHORISED SIGNATORY ───────────────────────────────────── */}
        <Disclosure title="Authorised Signatory" icon="✍️" defaultOpen>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20pt',
              fontSize: '10pt',
              marginTop: '4pt',
            }}
          >
            {/* HR / Manager */}
            <div>
              <p style={{ margin: '0 0 4pt 0', fontWeight: '600', color: '#374151' }}>
                Issued By (HR / Management)
              </p>
              <div
                style={{
                  borderBottom: '1pt solid #374151',
                  height: '30pt',
                  marginBottom: '4pt',
                }}
              />
              <p style={{ margin: '0', fontSize: '9pt' }}>
                <strong>{doc.hrName || '[HR / Manager Name]'}</strong>
              </p>
              <p style={{ margin: '0', fontSize: '8.5pt', color: '#6b7280' }}>
                {doc.hrDesignation || 'HR Manager / Director'}
              </p>
              <p style={{ margin: '2pt 0 0 0', fontSize: '8.5pt', color: '#6b7280' }}>
                {company.name || 'White Caves Real Estate L.L.C'}
              </p>
              <p style={{ margin: '2pt 0 0 0', fontSize: '8.5pt', color: '#6b7280' }}>
                Date: {doc.issueDate || today}
              </p>
            </div>

            {/* Company Stamp */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4pt 0', fontWeight: '600', color: '#374151' }}>Company Stamp / Seal</p>
              <div
                style={{
                  border: '1.5pt dashed #d1d5db',
                  height: '60pt',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: '8pt',
                  borderRadius: '50%',
                  width: '80pt',
                  margin: '0 auto',
                }}
              >
                STAMP
              </div>
            </div>
          </div>
        </Disclosure>

        {/* ── FOOTER NOTE ────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: '12pt',
            paddingTop: '8pt',
            borderTop: '1pt solid #e5e7eb',
            fontSize: '7.5pt',
            color: '#9ca3af',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0' }}>
            This is a computer-generated document. Authenticity can be verified by contacting White Caves Real
            Estate L.L.C at the.white.caves@gmail.com or +971 4 335 0592.
          </p>
        </div>
      </div>
    </PrintLayout>
  );
};

export default SalaryCertificateTemplate;
