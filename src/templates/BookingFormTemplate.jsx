import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';
import { Disclosure } from '../components/ui';

const BookingFormTemplate = () => {
  const { company, property, tenant, landlord, payments } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Booking Form (Standard Leasing)">
      <p className="doc-type-badge">STANDARD LEASING BOOKING PDF</p>
      <div className="doc-header">
        <div>
          <h3>BOOKING FORM</h3>
          <p>
            Ref.: <strong>{property.referenceNo}</strong>
          </p>
          <p>Date: {property.documentDate}</p>
        </div>
        <div className="header-company">
          <img src="/logo.png" alt="White Caves" className="logo" />
          <p className="company-name">{company.name}</p>
          <p className="muted">DED License No.: {company.dedLicense}</p>
          <p className="accent">{company.role}</p>
        </div>
      </div>

      <div className="notice-box">
        Thank you for choosing <strong>{company.name}</strong>. This booking quotation is issued for property
        leasing in {company.city} and supports authority submission where applicable.
      </div>

      <Disclosure title="1. Property Specifications" icon="🏠" defaultOpen>
        <p>
          <strong>Property:</strong> {property.community} - {property.cluster}, {property.unit},{' '}
          {property.city}
        </p>
        <p>
          <strong>Description:</strong> {property.description}
        </p>
        <p>
          <strong>Size:</strong> {property.size}
        </p>
        <p>
          <strong>Parking:</strong> {property.parking}
        </p>
        <p>
          <strong>Condition:</strong> {property.condition}
        </p>
      </Disclosure>

      <Disclosure title="2. Tenant Details" icon="👤">
        <p>
          <strong>Tenant Name:</strong> {tenant.fullName || '____________________'}
        </p>
        <p>
          <strong>Emirates ID:</strong> {tenant.emiratesId || '____________________'}
        </p>
        <p>
          <strong>Occupation:</strong> {tenant.occupation}
        </p>
        <p>
          <strong>Contact:</strong> {tenant.contactNo || '____________________'}
        </p>
      </Disclosure>

      <Disclosure title="3. Lease Terms" icon="📅">
        <p>
          <strong>Move-In Date:</strong> {payments.moveInDate}
        </p>
        <p>
          <strong>Contract Period:</strong> {payments.contractStartDate} to {payments.contractEndDate}
        </p>
        <p>
          <strong>Annual Rent:</strong> AED {payments.annualRent.toLocaleString()} (1 post-dated cheque)
        </p>
        <p>
          <strong>Signing Deadline:</strong> {payments.signingDeadline}
        </p>
        <p>
          <strong>Landlord:</strong> {landlord.name}
        </p>
      </Disclosure>

      <Disclosure title="4. Payment Schedule" icon="💰">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Due Date</th>
              <th>Amount (AED)</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{property.documentDate}</td>
              <td>{payments.securityDeposit.toLocaleString()}</td>
              <td>Booking deposit - White Caves</td>
            </tr>
            <tr>
              <td>By {payments.signingDeadline}</td>
              <td>{payments.agencyFee.toLocaleString()}</td>
              <td>Agency fee - White Caves</td>
            </tr>
            <tr>
              <td>By {payments.signingDeadline}</td>
              <td>{payments.ejariFee.toLocaleString()}</td>
              <td>Ejari registration fee</td>
            </tr>
            <tr>
              <td>Post-dated (30-40 days from move-in)</td>
              <td>{payments.annualRent.toLocaleString()}</td>
              <td>Annual rent cheque - Landlord</td>
            </tr>
            <tr className="total-row">
              <td>TOTAL</td>
              <td>{payments.total.toLocaleString()}</td>
              <td>All amounts in AED</td>
            </tr>
          </tbody>
        </table>
      </Disclosure>

      <Disclosure title="5. Bank Details" icon="🏦">
        <p>
          <strong>Landlord Beneficiary:</strong> {landlord.name}
        </p>
        <p>
          <strong>IBAN:</strong> {landlord.iban}
        </p>
        <p>
          <strong>Bank:</strong> {landlord.bank} | <strong>SWIFT:</strong> {landlord.swift}
        </p>
      </Disclosure>

      <div className="doc-signature-row">
        <div>
          <p className="muted">For White Caves Real Estate L.L.C</p>
          <div className="signature-stage">
            <img src="/signature.png" alt="Arslan Malik signature" className="signature" />
            <img src="/stamp.png" alt="White Caves company stamp" className="stamp-overlay" />
          </div>
          <p className="line">Arslan Malik - Managing Director</p>
        </div>
        <div>
          <p className="muted">Tenant Acknowledgment</p>
          <p className="line">Signature & Date</p>
        </div>
      </div>
    </TemplateLayout>
  );
};

export default BookingFormTemplate;
