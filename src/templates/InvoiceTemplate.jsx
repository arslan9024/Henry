import React from 'react';
import { useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';
import { Disclosure } from '../components/ui';

const InvoiceTemplate = () => {
  const { company, tenant, payments } = useSelector((state) => state.document);

  return (
    <TemplateLayout title="Invoice">
      <Disclosure title="Issuer" icon="🏢" defaultOpen>
        <p>{company.name}</p>
        <p>DED License No.: {company.dedLicense}</p>
      </Disclosure>

      <Disclosure title="Billed To" icon="👤">
        <p>{tenant.fullName || '____________________'}</p>
        <p>{tenant.contactNo || '____________________'}</p>
      </Disclosure>

      <Disclosure title="Charges" icon="💰" defaultOpen>
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
      </Disclosure>
    </TemplateLayout>
  );
};

export default InvoiceTemplate;
