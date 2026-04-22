import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';

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
          <img src="/logo.png.png" alt="White Caves" className="logo" />
          <p className="company-name">{company.name}</p>
          <p className="muted">DED License No.: {company.dedLicense}</p>
          <p className="accent">{company.role}</p>
        </div>
      </div>

      <div className="notice-box">
        This quotation is prepared for submission to a government/military office in the UAE for
        leasing approval processing.
      </div>

      <section className="doc-section">
        <h4>Applicant Profile</h4>
        <p>
          <strong>Tenant:</strong> {tenant.fullName || '____________________'}
        </p>
        <p>
          <strong>Category:</strong> {tenant.occupation}
        </p>
      </section>

      <section className="doc-section highlight-green">
        <h4>Government / Military Payment Clause</h4>
        <p>
          The annual rent amount of AED {payments.annualRent.toLocaleString()} is expected to be
          paid by a government or military office.
        </p>
        <p>
          Tenant shall submit a post-dated cheque within 30-40 days from move-in date. The
          landlord will hold cheque until due date unless direct entity transfer is completed.
        </p>
      </section>

      <section className="doc-section">
        <h4>Beneficiary for Rent</h4>
        <p>
          <strong>Landlord:</strong> {landlord.name}
        </p>
        <p>
          <strong>Annual Rent:</strong> AED {payments.annualRent.toLocaleString()}
        </p>
        <p>
          <strong>Issued by:</strong> {company.name}
        </p>
      </section>
    </TemplateLayout>
  );
};

export default GovtEmployeeBookingTemplate;
