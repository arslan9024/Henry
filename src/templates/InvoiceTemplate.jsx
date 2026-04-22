import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';

const InvoiceTemplate = () => {
  const { company, tenant, payments } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Invoice">
      <section className="doc-section">
        <h4>Issuer</h4>
        <p>{company.name}</p>
        <p>DED License No.: {company.dedLicense}</p>
      </section>

      <section className="doc-section">
        <h4>Billed To</h4>
        <p>{tenant.fullName || '____________________'}</p>
        <p>{tenant.contactNo || '____________________'}</p>
      </section>

      <section className="doc-section">
        <h4>Charges</h4>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Agency Fee</td>
              <td>{payments.agencyFee.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Ejari Registration Fee</td>
              <td>{payments.ejariFee.toLocaleString()}</td>
            </tr>
            <tr className="total-row">
              <td>Total Due</td>
              <td>{(payments.agencyFee + payments.ejariFee).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </TemplateLayout>
  );
};

export default InvoiceTemplate;
