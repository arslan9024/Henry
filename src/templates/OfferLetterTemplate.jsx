/**
 * OfferLetterTemplate.jsx
 * Property Offer Letter (Offer/LOI) for Dubai buying workflows
 * DLD-compliant with buyer, seller, property, terms, and signatures
 * 
 * Enhanced with luxury print styling and professional layout
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { selectDocument, selectPolicyMeta } from '../store/selectors';
import PrintLayout from '../components/PrintLayout';

const OfferLetterTemplate = () => {
  const documentData = useSelector(selectDocument);
  const policyMeta = useSelector(selectPolicyMeta);
  const doc = documentData.byTemplate?.offer || {};

  return (
    <PrintLayout documentType="offer" documentTitle="Property Offer Letter">
      <div className="doc-page">
      <div className="doc-header">
        <h2>PROPERTY OFFER LETTER</h2>
        <span className="doc-badge doc-badge--buying">BUYING OFFER · DLD COMPLIANT</span>
        <p><small>Issued: {doc.issueDate || 'Not set'} | Ref: {doc.referenceNumber || 'OFR-[AUTO]'}</small></p>
      </div>

      <section className="doc-section">
        <h3>Buyer Information</h3>
        <table className="doc-table">
          <tbody>
            <tr><td><strong>Buyer Name:</strong></td><td>{doc.buyerName || '[Field: Full Name]'}</td></tr>
            <tr><td><strong>Emirates ID:</strong></td><td>{doc.buyerEmiratesId || '[Required for DLD]'}</td></tr>
            <tr><td><strong>Nationality:</strong></td><td>{doc.buyerNationality || '[Nationality]'}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>{doc.buyerPhone || '[Phone]'}</td></tr>
            <tr><td><strong>Email:</strong></td><td>{doc.buyerEmail || '[Email]'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h3>Seller Information</h3>
        <table className="doc-table">
          <tbody>
            <tr><td><strong>Seller Name:</strong></td><td>{doc.sellerName || '[Name/Company]'}</td></tr>
            <tr><td><strong>ID / License:</strong></td><td>{doc.sellerRegistration || '[ID or Trade License]'}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>{doc.sellerPhone || '[Phone]'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h3>Property Details</h3>
        <table className="doc-table">
          <tbody>
            <tr><td><strong>Address:</strong></td><td>{doc.propertyAddress || '[Dubai location]'}</td></tr>
            <tr><td><strong>RERA / Plot Number:</strong></td><td>{doc.reraNumber || '[RERA permit]'}</td></tr>
            <tr><td><strong>Type:</strong></td><td>{doc.propertyType || '[Villa/Apt/Commercial]'}</td></tr>
            <tr><td><strong>Area (sqft):</strong></td><td>{doc.builtUpArea || '[Area]'}</td></tr>
            <tr><td><strong>Tenant Status:</strong></td><td>{doc.tenantStatus || '[Owner-occupant/Tenanted]'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h3>Offer Terms</h3>
        <table className="doc-table">
          <tbody>
            <tr><td><strong>Purchase Price (AED):</strong></td><td>{doc.offerPrice ? `AED ${Number(doc.offerPrice).toLocaleString()}` : '[Price]'}</td></tr>
            <tr><td><strong>Deposit (AED):</strong></td><td>{doc.depositAmount ? `AED ${Number(doc.depositAmount).toLocaleString()}` : '[5-10% of offer]'}</td></tr>
            <tr><td><strong>Held By:</strong></td><td>{doc.depositHeldBy || '[Broker/Bank/Escrow]'}</td></tr>
            <tr><td><strong>Closing Date:</strong></td><td>{doc.closingDate || '[Possession timeline]'}</td></tr>
            <tr><td><strong>Offer Valid Until:</strong></td><td>{doc.offerValidityDate || '[Expiry]'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h3>Payment Schedule</h3>
        <table className="doc-table doc-table--wide">
          <thead>
            <tr><th>Milestone</th><th>Timing</th><th>Amount (AED)</th><th>%</th></tr>
          </thead>
          <tbody>
            <tr><td>Deposit</td><td>Upon acceptance</td><td>{doc.schedule?.deposit || 'TBD'}</td><td>{doc.schedule?.depositPct || 'TBD'}</td></tr>
            <tr><td>On Contract</td><td>30 days before</td><td>{doc.schedule?.onContract || 'TBD'}</td><td>{doc.schedule?.onContractPct || 'TBD'}</td></tr>
            <tr><td>Final Payment</td><td>At transfer</td><td>{doc.schedule?.finalPayment || 'TBD'}</td><td>{doc.schedule?.finalPct || 'TBD'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h3>Conditions & Contingencies</h3>
        <div className="conditions-list">
          <p><strong>☐ Financing Contingency</strong></p>
          <p className="indent">Subject to buyer obtaining financing approval. Pre-approval required within {doc.financingDays || '7'} days.</p>
          <p><strong>☐ Inspection Contingency</strong></p>
          <p className="indent">Buyer may inspect property and engage surveyor within {doc.inspectionDays || '5'} days.</p>
          <p><strong>☐ Regulatory Approval</strong></p>
          <p className="indent">Subject to DLD title clearance. Seller to provide clear title documentation.</p>
          <p><strong>☐ Tenancy Status</strong></p>
          <p className="indent">Subject to buyer's acceptance of existing Ejari or negotiated termination.</p>
          <p><strong>☐ Broker Commission</strong></p>
          <p className="indent">Broker fee: {doc.brokerCommission || '2-3%'} of sale price, paid from seller proceeds.</p>
        </div>
      </section>

      <section className="doc-section">
        <h3>Broker Information</h3>
        <table className="doc-table">
          <tbody>
            <tr><td><strong>Company:</strong></td><td>{doc.brokerName || 'White Caves Real Estate L.L.C'}</td></tr>
            <tr><td><strong>DED License:</strong></td><td>{doc.dedLicense || '1388443'}</td></tr>
            <tr><td><strong>Agent:</strong></td><td>{doc.agentName || '[Agent name]'}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>{doc.brokerPhone || '[Phone]'}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="doc-section">
        <h3>Signatures</h3>
        <p><em>Valid until {doc.offerValidityDate || '[Date]'}. Auto-withdrawn if not extended in writing.</em></p>
        <div className="signature-block">
          <div className="signature-line">
            <p><strong>Buyer:</strong></p>
            <p>___________________ | {doc.buyerName || '_______________'} | ___________</p>
          </div>
          <div className="signature-line">
            <p><strong>Seller:</strong></p>
            <p>___________________ | {doc.sellerName || '_______________'} | ___________</p>
          </div>
          <div className="signature-line">
            <p><strong>Broker Witness:</strong></p>
            <p>___________________ | {doc.agentName || '_______________'} | ___________</p>
          </div>
        </div>
      </section>

      </div>
    </PrintLayout>
  );
};

export default React.memo(OfferLetterTemplate);
