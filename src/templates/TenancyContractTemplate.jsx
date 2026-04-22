import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';

const TenancyContractTemplate = () => {
  const { tenant, landlord, property, payments } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Tenancy Contract">
      <section className="doc-section">
        <h4>Parties</h4>
        <p>Landlord: {landlord.name}</p>
        <p>Tenant: {tenant.fullName || '____________________'}</p>
      </section>

      <section className="doc-section">
        <h4>Property</h4>
        <p>
          {property.unit}, {property.cluster}, {property.community}, {property.city}
        </p>
        <p>{property.description}</p>
      </section>

      <section className="doc-section">
        <h4>Term and Rent</h4>
        <p>
          Contract term: {payments.contractStartDate} to {payments.contractEndDate}
        </p>
        <p>Annual rent: AED {payments.annualRent.toLocaleString()}</p>
        <p>Ejari status: Pending Registration</p>
      </section>
    </TemplateLayout>
  );
};

export default TenancyContractTemplate;
