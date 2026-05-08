import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentValue } from '../store/documentSlice';
import Disclosure from './Disclosure';
import DocumentSelector from './DocumentSelector';
import { FormField, Input, Textarea } from './ui';
import { selectActiveTemplateLabel } from '../store/selectors';
import { selectSectionCompleteness } from '../store/selectors';
import { openChat } from '../store/uiCommandSlice';

/** Small completeness chip rendered in Disclosure headers. */
const CompletenessChip = ({ filled, total }) => {
  if (total === 0) return null;
  const pct = Math.round((filled / total) * 100);
  const color = pct === 100 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  return (
    <span
      aria-label={`${filled} of ${total} fields filled`}
      title={`${filled}/${total} fields filled`}
      style={{
        marginLeft: 8,
        fontSize: '0.68rem',
        fontWeight: 700,
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: 999,
        padding: '1px 7px',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        lineHeight: 1.6,
      }}
    >
      {filled}/{total}
    </span>
  );
};

const DocumentWorkAreaForm = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const documentData = useSelector((state) => state.document);
  const completeness = useSelector(selectSectionCompleteness);

  const setField = (section, field) => (event) => {
    dispatch(setDocumentValue({ section, field, value: event.target.value }));
  };

  const Chip = ({ section }) => (
    <CompletenessChip filled={completeness[section]?.filled ?? 0} total={completeness[section]?.total ?? 0} />
  );

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
          onClick={() => dispatch(openChat())}
          aria-label="Open Ask Henry chat"
        >
          💬 Open Ask Henry
        </button>
      </div>

      <Disclosure
        title={
          <>
            Property Details <Chip section="property" />
          </>
        }
        icon="🏠"
        defaultOpen
      >
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
          <FormField label="Usage">
            <Input value={documentData.property.usage || ''} onChange={setField('property', 'usage')} />
          </FormField>
          <FormField label="Property Status">
            <Input
              value={documentData.property.propertyStatus || ''}
              onChange={setField('property', 'propertyStatus')}
            />
          </FormField>
        </div>
      </Disclosure>

      <Disclosure
        title={
          <>
            Tenant Details <Chip section="tenant" />
          </>
        }
        icon="👤"
        defaultOpen
      >
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
          <FormField label="Emirates ID Expiry">
            <Input
              value={documentData.tenant.idExpiryDate || ''}
              onChange={setField('tenant', 'idExpiryDate')}
            />
          </FormField>
          <FormField label="Passport No.">
            <Input value={documentData.tenant.passportNo || ''} onChange={setField('tenant', 'passportNo')} />
          </FormField>
          <FormField label="Occupation">
            <Input value={documentData.tenant.occupation || ''} onChange={setField('tenant', 'occupation')} />
          </FormField>
          <FormField label="Nationality">
            <Input
              value={documentData.tenant.address || ''}
              onChange={setField('tenant', 'address')}
              placeholder="Address"
            />
          </FormField>
        </div>
      </Disclosure>

      <Disclosure
        title={
          <>
            Landlord Details <Chip section="landlord" />
          </>
        }
        icon="🏢"
      >
        <div className="viewing-grid">
          <FormField label="Name">
            <Input
              value={documentData.landlord.name || ''}
              onChange={setField('landlord', 'name')}
              disabled
              title="Landlord name is locked by policy"
            />
          </FormField>
          <FormField label="Emirates ID">
            <Input
              value={documentData.landlord.emiratesId || ''}
              onChange={setField('landlord', 'emiratesId')}
            />
          </FormField>
          <FormField label="ID Expiry Date">
            <Input
              value={documentData.landlord.idExpiryDate || ''}
              onChange={setField('landlord', 'idExpiryDate')}
            />
          </FormField>
          <FormField label="IBAN">
            <Input value={documentData.landlord.iban || ''} onChange={setField('landlord', 'iban')} />
          </FormField>
          <FormField label="Bank">
            <Input value={documentData.landlord.bank || ''} onChange={setField('landlord', 'bank')} />
          </FormField>
          <FormField label="Email">
            <Input value={documentData.landlord.email || ''} onChange={setField('landlord', 'email')} />
          </FormField>
          <FormField label="Phone">
            <Input value={documentData.landlord.phone || ''} onChange={setField('landlord', 'phone')} />
          </FormField>
        </div>
      </Disclosure>

      <Disclosure
        title={
          <>
            Financial Details <Chip section="payments" />
          </>
        }
        icon="💰"
      >
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
          <FormField label="Contract Start">
            <Input
              value={documentData.payments.contractStartDate || ''}
              onChange={setField('payments', 'contractStartDate')}
            />
          </FormField>
          <FormField label="Contract End">
            <Input
              value={documentData.payments.contractEndDate || ''}
              onChange={setField('payments', 'contractEndDate')}
            />
          </FormField>
        </div>
      </Disclosure>

      <Disclosure
        title={
          <>
            Broker Details <Chip section="broker" />
          </>
        }
        icon="🤝"
      >
        <div className="viewing-grid">
          <FormField label="Broker Name">
            <Input value={documentData.broker.brokerName || ''} onChange={setField('broker', 'brokerName')} />
          </FormField>
          <FormField label="BRN">
            <Input value={documentData.broker.brn || ''} onChange={setField('broker', 'brn')} />
          </FormField>
          <FormField label="ORN">
            <Input value={documentData.broker.orn || ''} onChange={setField('broker', 'orn')} />
          </FormField>
          <FormField label="Mobile">
            <Input value={documentData.broker.mobile || ''} onChange={setField('broker', 'mobile')} />
          </FormField>
          <FormField label="Email">
            <Input value={documentData.broker.email || ''} onChange={setField('broker', 'email')} />
          </FormField>
        </div>
      </Disclosure>

      {activeTemplate === 'viewing' ? (
        <Disclosure
          title={
            <>
              Viewing Agreement <Chip section="viewing" />
            </>
          }
          icon="📋"
          defaultOpen
        >
          <div className="viewing-grid">
            <FormField label="Agreement Number">
              <Input
                value={documentData.viewing.agreementNumber || ''}
                onChange={setField('viewing', 'agreementNumber')}
              />
            </FormField>
            <FormField label="Rental Budget">
              <Input
                value={documentData.viewing.rentalBudget || ''}
                onChange={setField('viewing', 'rentalBudget')}
              />
            </FormField>
            <FormField label="Viewing Date">
              <Input
                value={documentData.viewing.viewingDate || ''}
                onChange={setField('viewing', 'viewingDate')}
              />
            </FormField>
            <FormField label="Viewing Time">
              <Input
                value={documentData.viewing.viewingTime || ''}
                onChange={setField('viewing', 'viewingTime')}
              />
            </FormField>
          </div>
          <FormField label="Additional Info">
            <Textarea
              rows={2}
              value={documentData.viewing.additionalInfo || ''}
              onChange={setField('viewing', 'additionalInfo')}
            />
          </FormField>
        </Disclosure>
      ) : null}

      {activeTemplate === 'tenancy' ? (
        <Disclosure
          title={
            <>
              Tenancy Details <Chip section="tenancy" />
            </>
          }
          icon="📜"
          defaultOpen
        >
          <div className="viewing-grid">
            <FormField label="Ejari Number">
              <Input
                value={documentData.tenancy.ejariNumber || ''}
                onChange={setField('tenancy', 'ejariNumber')}
              />
            </FormField>
            <FormField label="Ejari Registration Date">
              <Input
                value={documentData.tenancy.ejariRegistrationDate || ''}
                onChange={setField('tenancy', 'ejariRegistrationDate')}
              />
            </FormField>
            <FormField label="Notice Period (days)">
              <Input
                value={documentData.tenancy.noticePeriodDays || ''}
                onChange={setField('tenancy', 'noticePeriodDays')}
              />
            </FormField>
            <FormField label="Key Handover Date">
              <Input
                value={documentData.tenancy.keyHandoverDate || ''}
                onChange={setField('tenancy', 'keyHandoverDate')}
              />
            </FormField>
          </div>
          <FormField label="Special Conditions">
            <Textarea
              rows={3}
              value={documentData.tenancy.specialConditions || ''}
              onChange={setField('tenancy', 'specialConditions')}
            />
          </FormField>
          <FormField label="Move-In Inspection Notes">
            <Textarea
              rows={2}
              value={documentData.tenancy.moveInInspectionNotes || ''}
              onChange={setField('tenancy', 'moveInInspectionNotes')}
            />
          </FormField>
        </Disclosure>
      ) : null}

      {activeTemplate === 'salaryCertificate' ? (
        <Disclosure
          title={
            <>
              Salary Certificate Fields <Chip section="salaryCertificate" />
            </>
          }
          icon="📄"
          defaultOpen
        >
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
