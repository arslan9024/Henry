import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentValue } from '../store/documentSlice';
import Disclosure from './Disclosure';
import DocumentSelector from './DocumentSelector';
import { selectActiveTemplateLabel } from '../store/selectors';
import { selectSectionCompleteness } from '../store/selectors';
import { openChat } from '../store/uiCommandSlice';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import Paper from '@mui/material/Paper';

/** Small completeness chip rendered in Disclosure headers. */
const CompletenessChip = ({ filled, total }) => {
  if (total === 0) return null;
  const pct = Math.round((filled / total) * 100);
  const color = pct === 100 ? 'success' : pct >= 60 ? 'warning' : 'error';
  return (
    <Chip
      size="small"
      label={`${filled}/${total}`}
      color={color}
      variant="outlined"
      aria-label={`${filled} of ${total} fields filled`}
      title={`${filled}/${total} fields filled`}
      sx={{ ml: 1, height: 20, fontSize: '0.68rem', fontWeight: 700 }}
    />
  );
};

/** Two-column responsive grid for form fields. */
const FieldGrid = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
      gap: 1.5,
    }}
  >
    {children}
  </Box>
);

/** Thin wrapper so we can pass sx overrides cleanly. */
const Field = ({ label, value, onChange, disabled, placeholder, multiline, rows }) => (
  <TextField
    size="small"
    fullWidth
    label={label}
    value={value}
    onChange={onChange}
    disabled={disabled}
    placeholder={placeholder}
    multiline={multiline}
    rows={rows}
    variant="outlined"
    sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem' } }}
  />
);

const DocumentWorkAreaForm = () => {
  const dispatch = useDispatch();
  const activeTemplate = useSelector((state) => state.template.activeTemplate);
  const activeTemplateLabel = useSelector(selectActiveTemplateLabel);
  const documentData = useSelector((state) => state.document);
  const completeness = useSelector(selectSectionCompleteness);

  const setField = (section, field) => (event) => {
    dispatch(setDocumentValue({ section, field, value: event.target.value }));
  };

  const SectionChip = ({ section }) => (
    <CompletenessChip filled={completeness[section]?.filled ?? 0} total={completeness[section]?.total ?? 0} />
  );

  return (
    <Paper
      component="section"
      variant="outlined"
      className="workarea-form print-hidden"
      aria-label="Document working area form"
      sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          background: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
        }}
      >
        <Box>
          <Typography variant="subtitle1" component="h3" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            Working Area — Manual Input
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Template: <strong>{activeTemplateLabel}</strong>
          </Typography>
        </Box>
        <MuiButton
          size="small"
          variant="contained"
          onClick={() => dispatch(openChat())}
          aria-label="Open Ask Henry chat"
          sx={{ fontSize: '0.75rem', flexShrink: 0 }}
        >
          💬 Ask Henry
        </MuiButton>
      </Box>

      {/* Workflow steps */}
      <Box
        role="note"
        aria-label="Document workflow guidance"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          background: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc'),
        }}
      >
        {['1) Select template', '2) Fill fields or Ask Henry', '3) Toggle Print Preview', '4) Generate PDF from footer'].map(
          (step) => (
            <Chip key={step} label={step} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />
          ),
        )}
      </Box>

      {/* Document selector */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <DocumentSelector />
      </Box>

      {/* Form sections */}
      <Box sx={{ px: 2, py: 1 }}>
        <Disclosure
          title={
            <>
              Property Details <SectionChip section="property" />
            </>
          }
          icon="🏠"
          defaultOpen
        >
          <FieldGrid>
            <Field label="Reference No." value={documentData.property.referenceNo || ''} onChange={setField('property', 'referenceNo')} placeholder="WHITE CAVES / ..." />
            <Field label="Document Date" value={documentData.property.documentDate || ''} onChange={setField('property', 'documentDate')} placeholder="22 April 2026" />
            <Field label="Unit" value={documentData.property.unit || ''} onChange={setField('property', 'unit')} />
            <Field label="Community" value={documentData.property.community || ''} onChange={setField('property', 'community')} />
            <Field label="Cluster" value={documentData.property.cluster || ''} onChange={setField('property', 'cluster')} />
            <Field label="Property Type" value={documentData.property.propertyType || ''} onChange={setField('property', 'propertyType')} />
            <Field label="Usage" value={documentData.property.usage || ''} onChange={setField('property', 'usage')} />
            <Field label="Property Status" value={documentData.property.propertyStatus || ''} onChange={setField('property', 'propertyStatus')} />
          </FieldGrid>
        </Disclosure>

        <Disclosure
          title={
            <>
              Tenant Details <SectionChip section="tenant" />
            </>
          }
          icon="👤"
          defaultOpen
        >
          <FieldGrid>
            <Field label="Full Name" value={documentData.tenant.fullName || ''} onChange={setField('tenant', 'fullName')} />
            <Field label="Contact No." value={documentData.tenant.contactNo || ''} onChange={setField('tenant', 'contactNo')} />
            <Field label="Email" value={documentData.tenant.email || ''} onChange={setField('tenant', 'email')} />
            <Field label="Emirates ID" value={documentData.tenant.emiratesId || ''} onChange={setField('tenant', 'emiratesId')} />
            <Field label="Emirates ID Expiry" value={documentData.tenant.idExpiryDate || ''} onChange={setField('tenant', 'idExpiryDate')} />
            <Field label="Passport No." value={documentData.tenant.passportNo || ''} onChange={setField('tenant', 'passportNo')} />
            <Field label="Occupation" value={documentData.tenant.occupation || ''} onChange={setField('tenant', 'occupation')} />
            <Field label="Nationality" value={documentData.tenant.nationality || ''} onChange={setField('tenant', 'nationality')} />
            <Field label="Address" value={documentData.tenant.address || ''} onChange={setField('tenant', 'address')} />
          </FieldGrid>
        </Disclosure>

        <Disclosure
          title={
            <>
              Landlord Details <SectionChip section="landlord" />
            </>
          }
          icon="🏢"
        >
          <FieldGrid>
            <Field label="Name" value={documentData.landlord.name || ''} onChange={setField('landlord', 'name')} disabled title="Landlord name is locked by policy" />
            <Field label="Emirates ID" value={documentData.landlord.emiratesId || ''} onChange={setField('landlord', 'emiratesId')} />
            <Field label="ID Expiry Date" value={documentData.landlord.idExpiryDate || ''} onChange={setField('landlord', 'idExpiryDate')} />
            <Field label="IBAN" value={documentData.landlord.iban || ''} onChange={setField('landlord', 'iban')} />
            <Field label="Bank" value={documentData.landlord.bank || ''} onChange={setField('landlord', 'bank')} />
            <Field label="Email" value={documentData.landlord.email || ''} onChange={setField('landlord', 'email')} />
            <Field label="Phone" value={documentData.landlord.phone || ''} onChange={setField('landlord', 'phone')} />
          </FieldGrid>
        </Disclosure>

        <Disclosure
          title={
            <>
              Financial Details <SectionChip section="payments" />
            </>
          }
          icon="💰"
        >
          <FieldGrid>
            <Field label="Annual Rent" value={documentData.payments.annualRent || ''} onChange={setField('payments', 'annualRent')} />
            <Field label="Security Deposit" value={documentData.payments.securityDeposit || ''} onChange={setField('payments', 'securityDeposit')} />
            <Field label="Agency Fee" value={documentData.payments.agencyFee || ''} onChange={setField('payments', 'agencyFee')} />
            <Field label="Ejari Fee" value={documentData.payments.ejariFee || ''} onChange={setField('payments', 'ejariFee')} />
            <Field label="Mode of Payment" value={documentData.payments.modeOfPayment || ''} onChange={setField('payments', 'modeOfPayment')} />
            <Field label="Move-in Date" value={documentData.payments.moveInDate || ''} onChange={setField('payments', 'moveInDate')} />
            <Field label="Contract Start" value={documentData.payments.contractStartDate || ''} onChange={setField('payments', 'contractStartDate')} />
            <Field label="Contract End" value={documentData.payments.contractEndDate || ''} onChange={setField('payments', 'contractEndDate')} />
          </FieldGrid>
        </Disclosure>

        <Disclosure
          title={
            <>
              Broker Details <SectionChip section="broker" />
            </>
          }
          icon="🤝"
        >
          <FieldGrid>
            <Field label="Broker Name" value={documentData.broker.brokerName || ''} onChange={setField('broker', 'brokerName')} />
            <Field label="BRN" value={documentData.broker.brn || ''} onChange={setField('broker', 'brn')} />
            <Field label="ORN" value={documentData.broker.orn || ''} onChange={setField('broker', 'orn')} />
            <Field label="Mobile" value={documentData.broker.mobile || ''} onChange={setField('broker', 'mobile')} />
            <Field label="Email" value={documentData.broker.email || ''} onChange={setField('broker', 'email')} />
          </FieldGrid>
        </Disclosure>

        {activeTemplate === 'viewing' ? (
          <Disclosure
            title={
              <>
                Viewing Agreement <SectionChip section="viewing" />
              </>
            }
            icon="📋"
            defaultOpen
          >
            <FieldGrid>
              <Field label="Agreement Number" value={documentData.viewing.agreementNumber || ''} onChange={setField('viewing', 'agreementNumber')} />
              <Field label="Rental Budget" value={documentData.viewing.rentalBudget || ''} onChange={setField('viewing', 'rentalBudget')} />
              <Field label="Viewing Date" value={documentData.viewing.viewingDate || ''} onChange={setField('viewing', 'viewingDate')} />
              <Field label="Viewing Time" value={documentData.viewing.viewingTime || ''} onChange={setField('viewing', 'viewingTime')} />
            </FieldGrid>
            <Box sx={{ mt: 1.5 }}>
              <Field label="Additional Info" value={documentData.viewing.additionalInfo || ''} onChange={setField('viewing', 'additionalInfo')} multiline rows={2} />
            </Box>
          </Disclosure>
        ) : null}

        {activeTemplate === 'tenancy' ? (
          <Disclosure
            title={
              <>
                Tenancy Details <SectionChip section="tenancy" />
              </>
            }
            icon="📜"
            defaultOpen
          >
            <FieldGrid>
              <Field label="Ejari Number" value={documentData.tenancy?.ejariNumber || ''} onChange={setField('tenancy', 'ejariNumber')} />
              <Field label="Ejari Registration Date" value={documentData.tenancy?.ejariRegistrationDate || ''} onChange={setField('tenancy', 'ejariRegistrationDate')} />
              <Field label="Notice Period (days)" value={documentData.tenancy?.noticePeriodDays || ''} onChange={setField('tenancy', 'noticePeriodDays')} />
              <Field label="Key Handover Date" value={documentData.tenancy?.keyHandoverDate || ''} onChange={setField('tenancy', 'keyHandoverDate')} />
            </FieldGrid>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Field label="Special Conditions" value={documentData.tenancy?.specialConditions || ''} onChange={setField('tenancy', 'specialConditions')} multiline rows={3} />
              <Field label="Move-In Inspection Notes" value={documentData.tenancy?.moveInInspectionNotes || ''} onChange={setField('tenancy', 'moveInInspectionNotes')} multiline rows={2} />
            </Box>
          </Disclosure>
        ) : null}

        {activeTemplate === 'salaryCertificate' ? (
          <Disclosure
            title={
              <>
                Salary Certificate Fields <SectionChip section="salaryCertificate" />
              </>
            }
            icon="📄"
            defaultOpen
          >
            <FieldGrid>
              <Field label="Employee Name" value={documentData.salaryCertificate?.employeeName || ''} onChange={setField('salaryCertificate', 'employeeName')} />
              <Field label="Employee ID" value={documentData.salaryCertificate?.employeeId || ''} onChange={setField('salaryCertificate', 'employeeId')} />
              <Field label="Designation" value={documentData.salaryCertificate?.designation || ''} onChange={setField('salaryCertificate', 'designation')} />
              <Field label="Basic Salary" value={documentData.salaryCertificate?.basicSalary || ''} onChange={setField('salaryCertificate', 'basicSalary')} />
              <Field label="Housing Allowance" value={documentData.salaryCertificate?.housingAllowance || ''} onChange={setField('salaryCertificate', 'housingAllowance')} />
              <Field label="Transport Allowance" value={documentData.salaryCertificate?.transportAllowance || ''} onChange={setField('salaryCertificate', 'transportAllowance')} />
              <Field label="HR Name" value={documentData.salaryCertificate?.hrName || ''} onChange={setField('salaryCertificate', 'hrName')} />
              <Field label="Issued To" value={documentData.salaryCertificate?.issuedTo || ''} onChange={setField('salaryCertificate', 'issuedTo')} />
            </FieldGrid>
            <Box sx={{ mt: 1.5 }}>
              <Field label="Salary in Words" value={documentData.salaryCertificate?.salaryWordAmount || ''} onChange={setField('salaryCertificate', 'salaryWordAmount')} multiline rows={2} />
            </Box>
          </Disclosure>
        ) : null}
      </Box>
    </Paper>
  );
};

export default React.memo(DocumentWorkAreaForm);

