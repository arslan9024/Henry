/**
 * KeyHandoverMaintenanceTemplate.jsx
 * Professional Key Handover & Maintenance Confirmation Form
 * 
 * Based on White Caves Real Estate LLC real-world template
 * Includes: Company branding, property details, key dates, clauses, signatures
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { selectDocument, selectPolicyMeta } from '../store/selectors';
import PrintLayout from '../components/PrintLayout';

const KeyHandoverMaintenanceTemplate = () => {
  const documentData = useSelector(selectDocument);
  const policyMeta = useSelector(selectPolicyMeta);
  const doc = documentData.byTemplate?.keyHandover || {};

  return (
    <PrintLayout documentType="keyHandover" documentTitle="Key Handover & Maintenance Confirmation">
      <div className="doc-page">
        {/* ── COMPANY HEADER ───────────────────────────────────────────────── */}
        <div className="doc-section" style={{ marginBottom: '12pt', paddingBottom: '8pt', borderBottom: '1pt solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 2pt 0', fontSize: '9pt', fontWeight: '600', color: '#1f2937' }}>
                WHITE CAVES REAL ESTATE LLC
              </p>
              <p style={{ margin: '0 0 2pt 0', fontSize: '8pt', color: '#6b7280' }}>
                Office D-72, El-Shaye-4, Port Saeed, Dubai
              </p>
              <p style={{ margin: '0 0 2pt 0', fontSize: '8pt', color: '#6b7280' }}>
                Office: +971 4 335 0592 | Mobile: +971563616136
              </p>
              <p style={{ margin: '0 0 2pt 0', fontSize: '8pt', color: '#6b7280' }}>
                Website: https://www.whitecaves.com | Email: the.white.caves@gmail.com
              </p>
            </div>
            <div style={{ textAlign: 'right', paddingLeft: '16pt' }}>
              <p style={{ margin: '0', fontSize: '32pt', color: '#dc2626' }}>🏔️</p>
              <p style={{ margin: '0', fontSize: '7pt', fontWeight: '600', color: '#dc2626' }}>WHITE CAVES</p>
            </div>
          </div>
        </div>

        {/* ── DOCUMENT TITLE ────────────────────────────────────────────── */}
        <div className="doc-header">
          <h2>KEY HANDOVER & MAINTENANCE CONFIRMATION</h2>
          <span className="doc-badge doc-badge--leasing">PROPERTY HANDOVER · MOVE-IN CONFIRMATION</span>
          <p><small>Date: {doc.handoverDate || 'Not set'} | Reference: {doc.referenceNumber || 'KH-[AUTO]'}</small></p>
        </div>

        {/* ── PROPERTY & PARTIES ────────────────────────────────────────── */}
        <section className="doc-section">
          <h3>Property & Handover Details</h3>
          <p style={{ margin: '0 0 6pt 0', fontSize: '10pt' }}>
            <strong>Property:</strong> {doc.propertyAddress || '[Property address]'}
          </p>
          <p style={{ margin: '0 0 6pt 0', fontSize: '10pt' }}>
            <strong>Tenant:</strong> {doc.tenantName || '[Tenant name]'} | 
            <strong> Landlord:</strong> {doc.landlordName || '[Landlord name]'} | 
            <strong> Property Manager:</strong> {doc.propertyManagerPhone || '[Phone]'}
          </p>
        </section>

        {/* ── KEY DATES ────────────────────────────────────────────────── */}
        <section className="doc-section">
          <h3>Handover Timeline & Terms</h3>
          <p style={{ margin: '0 0 4pt 0', fontSize: '10pt' }}>
            <strong>Key Handover Date:</strong> {doc.handoverDate || '[Date]'}
          </p>
          <p style={{ margin: '0 0 4pt 0', fontSize: '10pt' }}>
            <strong>Grace Period (no rent):</strong> {doc.gracePeriodStart || '[Date]'} to {doc.gracePeriodEnd || '[Date]'}
          </p>
          <p style={{ margin: '0 0 4pt 0', fontSize: '10pt' }}>
            <strong>Rent Commences:</strong> {doc.rentStartDate || '[Date]'} ({doc.monthlyRent || '[Amount]'}, {doc.paymentType || 'payment method'})
          </p>
          <p style={{ margin: '0 0 6pt 0', fontSize: '10pt' }}>
            <strong>Contract Expiry:</strong> {doc.contractExpiryDate || '[Date]'}
          </p>
        </section>

        {/* ── HANDOVER CLAUSES ──────────────────────────────────────────── */}
        <section className="doc-section">
          <h3>Handover & Maintenance Clauses</h3>
          <ol style={{ margin: '0', paddingLeft: '20pt', fontSize: '10pt', lineHeight: '1.7' }}>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Pre-Handover Maintenance:</strong> The landlord completed cleaning, repainting, and AC service before {doc.handoverDate || '[date]'}. Tenant accepts property in "Ready to Move" condition.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Keys & Access Items:</strong> The tenant received all keys, fobs, and remotes (doors, mailbox, parking, gates). All must be returned at tenancy end or replacement charges apply.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Furnishing Status:</strong> Property is unfurnished. No furniture or fixtures provided by the landlord.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Tenant Utilities:</strong> Tenant responsible for all utilities from {doc.handoverDate || '[date]'}.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Required Documentation:</strong> Tenants must provide Ejari certificate, DEWA receipt, and DAMAC Move-In Permit to Property Manager by {doc.docDeadline || '[date]'}.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Defect Reporting Window:</strong> Joint inspection and photos completed on {doc.handoverDate || '[date]'}. Latent defects reported within 14 days will be rectified by the Landlord/representative at no cost.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Security Deposit Terms:</strong> Security deposit {doc.securityDeposit || 'AED [amount]'} is non-refundable if property is not returned clean, undamaged, with proof of professional cleaning, repainting, AC service, and pest control.
            </li>
            <li style={{ marginBottom: '6pt' }}>
              <strong>Repair Responsibility:</strong> Minor repairs (&lt; AED 1,000) = Tenant responsibility. Major repairs (≥ AED 1,000) = Landlord responsibility via Property Manager.
            </li>
            <li>
              <strong>Maintenance & Communications:</strong> All maintenance requests and tenancy communications must be directed to the Property Manager: {doc.propertyManagerPhone || '[Phone]'}.
            </li>
          </ol>
        </section>

        {/* ── CONDITION CHECKLIST ───────────────────────────────────────– */}
        <section className="doc-section">
          <h3>Property Condition Acceptance</h3>
          <table className="doc-table" style={{ width: '100%', marginTop: '6pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2pt solid #2d3748' }}>
                <th style={{ padding: '6pt 8pt', textAlign: 'left', fontWeight: '600' }}>Item / Area</th>
                <th style={{ padding: '6pt 8pt', textAlign: 'center', fontWeight: '600' }}>Condition</th>
                <th style={{ padding: '6pt 8pt', textAlign: 'left', fontWeight: '600' }}>Notes</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '9pt' }}>
              <tr style={{ borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '5pt 6pt' }}>Walls & Paint</td>
                <td style={{ padding: '5pt 6pt', textAlign: 'center' }}>{doc.wallsCondition || 'Good'}</td>
                <td style={{ padding: '5pt 6pt' }}>{doc.wallsNotes || '-'}</td>
              </tr>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '5pt 6pt' }}>Flooring</td>
                <td style={{ padding: '5pt 6pt', textAlign: 'center' }}>{doc.flooringCondition || 'Good'}</td>
                <td style={{ padding: '5pt 6pt' }}>{doc.flooringNotes || '-'}</td>
              </tr>
              <tr style={{ borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '5pt 6pt' }}>AC & Ventilation</td>
                <td style={{ padding: '5pt 6pt', textAlign: 'center' }}>{doc.acCondition || 'Serviced'}</td>
                <td style={{ padding: '5pt 6pt' }}>{doc.acNotes || '-'}</td>
              </tr>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '5pt 6pt' }}>Appliances / Fixtures</td>
                <td style={{ padding: '5pt 6pt', textAlign: 'center' }}>{doc.fixturesCondition || 'N/A (Unfurnished)'}</td>
                <td style={{ padding: '5pt 6pt' }}>{doc.fixturesNotes || '-'}</td>
              </tr>
              <tr style={{ borderBottom: '1pt solid #e5e7eb' }}>
                <td style={{ padding: '5pt 6pt' }}>Cleaning Status</td>
                <td style={{ padding: '5pt 6pt', textAlign: 'center' }}>{doc.cleaningStatus || 'Professional'}</td>
                <td style={{ padding: '5pt 6pt' }}>{doc.cleaningNotes || 'Ready to move'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── SIGNATURE BLOCK ───────────────────────────────────────────– */}
        <section className="doc-section" style={{ pageBreakInside: 'avoid', marginTop: '16pt' }}>
          <h3>Acceptance & Signatures</h3>
          <p style={{ margin: '8pt 0', fontSize: '9pt', fontStyle: 'italic', color: '#6b7280' }}>
            Both parties confirm receipt of property in "Ready to Move" condition and acceptance of terms above.
          </p>
          <div className="signature-block">
            <div className="signature-line" style={{ marginBottom: '16pt' }}>
              <p style={{ margin: '0 0 12pt 0', fontWeight: '600', fontSize: '10pt' }}>Tenant Signature & Acceptance</p>
              <p style={{ margin: '0 0 2pt 0' }}>__________________________________________________</p>
              <p style={{ margin: '2pt 0', fontSize: '9pt', color: '#6b7280' }}>
                Name: {doc.tenantName || '_____________________________'} | Date: {doc.handoverDate || '_______________'}
              </p>
            </div>
            <div className="signature-line" style={{ marginBottom: '16pt' }}>
              <p style={{ margin: '0 0 12pt 0', fontWeight: '600', fontSize: '10pt' }}>Landlord / Representative Signature</p>
              <p style={{ margin: '0 0 2pt 0' }}>__________________________________________________</p>
              <p style={{ margin: '2pt 0', fontSize: '9pt', color: '#6b7280' }}>
                Name: {doc.landlordName || '_____________________________'} | Date: {doc.handoverDate || '_______________'}
              </p>
            </div>
            <div className="signature-line">
              <p style={{ margin: '0 0 12pt 0', fontWeight: '600', fontSize: '10pt' }}>Property Manager Witness</p>
              <p style={{ margin: '0 0 2pt 0' }}>__________________________________________________</p>
              <p style={{ margin: '2pt 0', fontSize: '9pt', color: '#6b7280' }}>
                Name: {doc.propertyManagerName || '_____________________________'} | Phone: {doc.propertyManagerPhone || '_______________'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </PrintLayout>
  );
};

export default React.memo(KeyHandoverMaintenanceTemplate);
