import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentValue } from '../store/documentSlice';
import Disclosure from './Disclosure';
import { FormField, Input, Textarea } from './ui';

const DocumentWorkAreaForm = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector((state) => {
    const key = state.template.activeTemplate;
    return state?.template?.activeTemplateLabel || key;
  });
  const documentData = useSelector((state) => state.document);

  const setField = (section, field) => (event) => {
    dispatch(setDocumentValue({ section, field, value: event.target.value }));
  };

  return (
    <section className="workarea-form print-hidden" aria-label="Document working area form">
      <header className="workarea-form__header">
        <h3 className="workarea-form__title">Working Area — Manual Input</h3>
        <p className="workarea-form__subtitle">
          Template: <strong>{activeTemplateLabel}</strong>
        </p>
      </header>

      <Disclosure title="Property Details" icon="🏠" defaultOpen>
        <div className="viewing-grid">
          <FormField label="Reference No.">
            <Input
              value={documentData.property.referenceNo || ''}
              onChange={setField('property', 'referenceNo')}
              placeholder="WHITE CAVES / ..."
            />
          </FormField>
          <FormField label="Document Date">
            <Input
              value={documentData.property.documentDate || ''}
              onChange={setField('property', 'documentDate')}
              placeholder="22 April 2026"
            />
          </FormField>
          <FormField label="Unit">
            <Input value={documentData.property.unit || ''} onChange={setField('property', 'unit')} />
          </FormField>
          <FormField label="Community">
            <Input
              value={documentData.property.community || ''}
              onChange={setField('property', 'community')}
            />
          </FormField>
          <FormField label="Cluster">
            <Input value={documentData.property.cluster || ''} onChange={setField('property', 'cluster')} />
          </FormField>
          <FormField label="Property Type">
            <Input
              value={documentData.property.propertyType || ''}
              onChange={setField('property', 'propertyType')}
            />
          </FormField>
        </div>
      </Disclosure>

      <Disclosure title="Tenant Details" icon="👤" defaultOpen>
        <div className="viewing-grid">
          <FormField label="Full Name">
            <Input value={documentData.tenant.fullName || ''} onChange={setField('tenant', 'fullName')} />
          </FormField>
          <FormField label="Contact No.">
            <Input value={documentData.tenant.contactNo || ''} onChange={setField('tenant', 'contactNo')} />
          </FormField>
          <FormField label="Email">
            <Input value={documentData.tenant.email || ''} onChange={setField('tenant', 'email')} />
          </FormField>
          <FormField label="Emirates ID">
            <Input value={documentData.tenant.emiratesId || ''} onChange={setField('tenant', 'emiratesId')} />
          </FormField>
          <FormField label="Passport No.">
            <Input value={documentData.tenant.passportNo || ''} onChange={setField('tenant', 'passportNo')} />
          </FormField>
          <FormField label="Occupation">
            <Input value={documentData.tenant.occupation || ''} onChange={setField('tenant', 'occupation')} />
          </FormField>
        </div>
      </Disclosure>

      <Disclosure title="Financial Details" icon="💰">
        <div className="viewing-grid">
          <FormField label="Annual Rent">
            <Input
              value={documentData.payments.annualRent || ''}
              onChange={setField('payments', 'annualRent')}
            />
          </FormField>
          <FormField label="Security Deposit">
            <Input
              value={documentData.payments.securityDeposit || ''}
              onChange={setField('payments', 'securityDeposit')}
            />
          </FormField>
          <FormField label="Agency Fee">
            <Input
              value={documentData.payments.agencyFee || ''}
              onChange={setField('payments', 'agencyFee')}
            />
          </FormField>
          <FormField label="Ejari Fee">
            <Input value={documentData.payments.ejariFee || ''} onChange={setField('payments', 'ejariFee')} />
          </FormField>
          <FormField label="Mode of Payment">
            <Input
              value={documentData.payments.modeOfPayment || ''}
              onChange={setField('payments', 'modeOfPayment')}
            />
          </FormField>
          <FormField label="Move-in Date">
            <Input
              value={documentData.payments.moveInDate || ''}
              onChange={setField('payments', 'moveInDate')}
            />
          </FormField>
        </div>
      </Disclosure>

      {activeTemplate === 'salaryCertificate' ? (
        <Disclosure title="Salary Certificate Fields" icon="📄" defaultOpen>
          <div className="viewing-grid">
            <FormField label="Employee Name">
              <Input
                value={documentData.salaryCertificate?.employeeName || ''}
                onChange={setField('salaryCertificate', 'employeeName')}
              />
            </FormField>
            <FormField label="Employee ID">
              <Input
                value={documentData.salaryCertificate?.employeeId || ''}
                onChange={setField('salaryCertificate', 'employeeId')}
              />
            </FormField>
            <FormField label="Designation">
              <Input
                value={documentData.salaryCertificate?.designation || ''}
                onChange={setField('salaryCertificate', 'designation')}
              />
            </FormField>
            <FormField label="Basic Salary">
              <Input
                value={documentData.salaryCertificate?.basicSalary || ''}
                onChange={setField('salaryCertificate', 'basicSalary')}
              />
            </FormField>
            <FormField label="Housing Allowance">
              <Input
                value={documentData.salaryCertificate?.housingAllowance || ''}
                onChange={setField('salaryCertificate', 'housingAllowance')}
              />
            </FormField>
            <FormField label="Transport Allowance">
              <Input
                value={documentData.salaryCertificate?.transportAllowance || ''}
                onChange={setField('salaryCertificate', 'transportAllowance')}
              />
            </FormField>
            <FormField label="HR Name">
              <Input
                value={documentData.salaryCertificate?.hrName || ''}
                onChange={setField('salaryCertificate', 'hrName')}
              />
            </FormField>
            <FormField label="Issued To">
              <Input
                value={documentData.salaryCertificate?.issuedTo || ''}
                onChange={setField('salaryCertificate', 'issuedTo')}
              />
            </FormField>
          </div>
          <FormField label="Salary in Words">
            <Textarea
              rows={2}
              value={documentData.salaryCertificate?.salaryWordAmount || ''}
              onChange={setField('salaryCertificate', 'salaryWordAmount')}
            />
          </FormField>
        </Disclosure>
      ) : null}
    </section>
  );
};

export default React.memo(DocumentWorkAreaForm);
