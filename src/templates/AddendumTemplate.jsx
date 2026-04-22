import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';

const AddendumTemplate = () => {
  const { company, property } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Addendum">
      <section className="doc-section">
        <p>
          This addendum is issued by <strong>{company.name}</strong> concerning tenancy terms for
          property {property.unit}, {property.community}, Dubai.
        </p>
      </section>

      <section className="doc-section">
        <h4>Original Contract Reference</h4>
        <p>Reference No: ____________________</p>
        <p>Contract Date: ____________________</p>
      </section>

      <section className="doc-section">
        <h4>Agreed Amendments</h4>
        <p>1. _______________________________________________</p>
        <p>2. _______________________________________________</p>
        <p>3. _______________________________________________</p>
      </section>
    </TemplateLayout>
  );
};

export default AddendumTemplate;
