import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';
import { Disclosure } from '../components/ui';

const GovtEmployeeBookingTemplate = () => {
  const { company, property, tenant, payments, landlord } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Government Office Leasing Quotation">
      <p className="doc-type-badge govt">GOVERNMENT OFFICE LEASING QUOTATION PDF</p>
      <div className="doc-header">
        <div>
          <h3>QUOTATION</h3>
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
        This quotation is prepared for submission to a government/military office in the UAE for leasing
        approval processing.
      </div>

      <Disclosure title="Applicant Profile" icon="👤" defaultOpen>
        <p>
          <strong>Tenant:</strong> {tenant.fullName || '____________________'}
        </p>
        <p>
          <strong>Category:</strong> {tenant.occupation}
        </p>
      </Disclosure>

      <Disclosure title="Government / Military Payment Clause" icon="🏛" tone="warning">
        <p>
          The annual rent amount of AED {payments.annualRent.toLocaleString()} is expected to be paid by a
          government or military office.
        </p>
        <p>
          Tenant shall submit a post-dated cheque within 30-40 days from move-in date. The landlord will hold
          cheque until due date unless direct entity transfer is completed.
        </p>
      </Disclosure>

      <Disclosure title="Beneficiary for Rent" icon="🏦">
        <p>
          <strong>Landlord:</strong> {landlord.name}
        </p>
        <p>
          <strong>Annual Rent:</strong> AED {payments.annualRent.toLocaleString()}
        </p>
        <p>
          <strong>Issued by:</strong> {company.name}
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
          <p className="muted">Applicant Acknowledgment</p>
          <p className="line">Signature & Date</p>
        </div>
      </div>
    </TemplateLayout>
  );
};

export default GovtEmployeeBookingTemplate;
