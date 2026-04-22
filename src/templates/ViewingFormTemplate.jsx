import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';

const ViewingFormTemplate = () => {
  const { company, property, tenant } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Viewing Form">
      <div className="simple-doc-header">
        <h3>{company.name}</h3>
        <p>Dubai Property Viewing Confirmation</p>
      </div>

      <section className="doc-section">
        <h4>Property</h4>
        <p>
          {property.unit}, {property.cluster}, {property.community}, {property.city}
        </p>
        <p>{property.description}</p>
      </section>

      <section className="doc-section">
        <h4>Client / Prospect</h4>
        <p>Name: {tenant.fullName || '____________________'}</p>
        <p>Contact: {tenant.contactNo || '____________________'}</p>
        <p>Emirates ID: {tenant.emiratesId || '____________________'}</p>
      </section>

      <section className="doc-section">
        <h4>Viewing Schedule</h4>
        <p>Date: ____________________</p>
        <p>Time: ____________________</p>
        <p>Agent: ____________________</p>
      </section>

      <p className="doc-note">
        This viewing form is issued by {company.name} for internal and client record keeping in
        line with professional brokerage operations in Dubai.
      </p>
    </TemplateLayout>
  );
};

export default ViewingFormTemplate;
