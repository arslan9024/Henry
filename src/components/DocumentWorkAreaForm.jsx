import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentValue } from '../store/documentSlice';
import Disclosure from './Disclosure';
import DocumentSelector from './DocumentSelector';
import { FormField, Input, Textarea } from './ui';
import { selectActiveTemplateLabel } from '../store/selectors';

const DocumentWorkAreaForm = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
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

      <div className="workarea-form__selector-row">
        <DocumentSelector />
      </div>

      <div className="workarea-form__flow" role="note" aria-label="Document workflow guidance">
        <span>1) Select template</span>
        <span>2) Fill fields manually or use Ask Henry chat</span>
        <span>3) Toggle Print Preview</span>
        <span>4) Generate PDF from footer</span>
        <button
          type="button"
          className="utility-btn secondary"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('henry:open-chat'));
          }}
          aria-label="Open Ask Henry chat"
        >
          💬 Open Ask Henry
        </button>
      </div>

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

      {activeTemplate === 'keyHandover' ? (
        <Disclosure title="Key Handover Details" icon="🔑" defaultOpen>
          <div className="viewing-grid">
            <FormField label="Reference Number">
              <Input
                value={documentData.keyHandover?.referenceNumber || ''}
                onChange={setField('keyHandover', 'referenceNumber')}
                placeholder="KH-2026-001"
              />
            </FormField>
            <FormField label="Handover Date">
              <Input
                value={documentData.keyHandover?.handoverDate || ''}
                onChange={setField('keyHandover', 'handoverDate')}
                placeholder="01 May 2026"
              />
            </FormField>
            <FormField label="Property Address">
              <Input
                value={documentData.keyHandover?.propertyAddress || ''}
                onChange={setField('keyHandover', 'propertyAddress')}
                placeholder="Unit 449, Avencia-2, Damac Hills 2"
              />
            </FormField>
            <FormField label="Tenant Name">
              <Input
                value={documentData.keyHandover?.tenantName || ''}
                onChange={setField('keyHandover', 'tenantName')}
              />
            </FormField>
            <FormField label="Landlord Name">
              <Input
                value={documentData.keyHandover?.landlordName || ''}
                onChange={setField('keyHandover', 'landlordName')}
              />
            </FormField>
            <FormField label="Property Manager Name">
              <Input
                value={documentData.keyHandover?.propertyManagerName || ''}
                onChange={setField('keyHandover', 'propertyManagerName')}
              />
            </FormField>
            <FormField label="Property Manager Phone">
              <Input
                value={documentData.keyHandover?.propertyManagerPhone || ''}
                onChange={setField('keyHandover', 'propertyManagerPhone')}
                placeholder="+971 XX XXX XXXX"
              />
            </FormField>
            <FormField label="Grace Period Start">
              <Input
                value={documentData.keyHandover?.gracePeriodStart || ''}
                onChange={setField('keyHandover', 'gracePeriodStart')}
                placeholder="01 May 2026"
              />
            </FormField>
            <FormField label="Grace Period End">
              <Input
                value={documentData.keyHandover?.gracePeriodEnd || ''}
                onChange={setField('keyHandover', 'gracePeriodEnd')}
                placeholder="14 May 2026"
              />
            </FormField>
            <FormField label="Rent Start Date">
              <Input
                value={documentData.keyHandover?.rentStartDate || ''}
                onChange={setField('keyHandover', 'rentStartDate')}
                placeholder="15 May 2026"
              />
            </FormField>
            <FormField label="Monthly Rent">
              <Input
                value={documentData.keyHandover?.monthlyRent || ''}
                onChange={setField('keyHandover', 'monthlyRent')}
                placeholder="AED 7,083"
              />
            </FormField>
            <FormField label="Payment Type">
              <Input
                value={documentData.keyHandover?.paymentType || ''}
                onChange={setField('keyHandover', 'paymentType')}
                placeholder="4 Cheques"
              />
            </FormField>
            <FormField label="Contract Expiry">
              <Input
                value={documentData.keyHandover?.contractExpiryDate || ''}
                onChange={setField('keyHandover', 'contractExpiryDate')}
                placeholder="30 April 2027"
              />
            </FormField>
            <FormField label="Security Deposit">
              <Input
                value={documentData.keyHandover?.securityDeposit || ''}
                onChange={setField('keyHandover', 'securityDeposit')}
                placeholder="AED 4,250"
              />
            </FormField>
            <FormField label="Document Deadline (Ejari/DEWA/DAMAC)">
              <Input
                value={documentData.keyHandover?.docDeadline || ''}
                onChange={setField('keyHandover', 'docDeadline')}
                placeholder="30 May 2026"
              />
            </FormField>
          </div>
        </Disclosure>
      ) : null}

      {activeTemplate === 'keyHandover' ? (
        <Disclosure title="Property Condition" icon="✅">
          <div className="viewing-grid">
            <FormField label="Walls Condition">
              <Input
                value={documentData.keyHandover?.wallsCondition || ''}
                onChange={setField('keyHandover', 'wallsCondition')}
                placeholder="Good"
              />
            </FormField>
            <FormField label="Walls Notes">
              <Input
                value={documentData.keyHandover?.wallsNotes || ''}
                onChange={setField('keyHandover', 'wallsNotes')}
                placeholder="Freshly painted"
              />
            </FormField>
            <FormField label="Flooring Condition">
              <Input
                value={documentData.keyHandover?.flooringCondition || ''}
                onChange={setField('keyHandover', 'flooringCondition')}
                placeholder="Good"
              />
            </FormField>
            <FormField label="Flooring Notes">
              <Input
                value={documentData.keyHandover?.flooringNotes || ''}
                onChange={setField('keyHandover', 'flooringNotes')}
              />
            </FormField>
            <FormField label="AC Condition">
              <Input
                value={documentData.keyHandover?.acCondition || ''}
                onChange={setField('keyHandover', 'acCondition')}
                placeholder="Serviced"
              />
            </FormField>
            <FormField label="AC Notes">
              <Input
                value={documentData.keyHandover?.acNotes || ''}
                onChange={setField('keyHandover', 'acNotes')}
              />
            </FormField>
            <FormField label="Fixtures Condition">
              <Input
                value={documentData.keyHandover?.fixturesCondition || ''}
                onChange={setField('keyHandover', 'fixturesCondition')}
                placeholder="N/A (Unfurnished)"
              />
            </FormField>
            <FormField label="Fixtures Notes">
              <Input
                value={documentData.keyHandover?.fixturesNotes || ''}
                onChange={setField('keyHandover', 'fixturesNotes')}
              />
            </FormField>
            <FormField label="Cleaning Status">
              <Input
                value={documentData.keyHandover?.cleaningStatus || ''}
                onChange={setField('keyHandover', 'cleaningStatus')}
                placeholder="Professional"
              />
            </FormField>
            <FormField label="Cleaning Notes">
              <Input
                value={documentData.keyHandover?.cleaningNotes || ''}
                onChange={setField('keyHandover', 'cleaningNotes')}
                placeholder="Ready to move"
              />
            </FormField>
          </div>
        </Disclosure>
      ) : null}

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
