import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDocumentValue } from '../store/documentSlice';
import { selectDocument } from '../store/selectors';
import { FormField, Input, Checkbox } from './ui';

// Local Field wrapper composes the new primitives. Keeps the call-sites below
// terse while routing all chrome (label, hint, error wiring, focus ring) to
// the design system.
const Field = ({ label, type = 'text', value, onChange, min, step, placeholder }) => (
  <FormField label={label}>
    <Input
      type={type}
      value={value ?? ''}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </FormField>
);

const ToggleField = ({ label, checked, onChange }) => (
  <Checkbox label={label} checked={checked} onChange={(event) => onChange(event.target.checked)} />
);

const HenryOperationsPanel = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(selectDocument);
  const [expanded, setExpanded] = useState(false);

  const updateValue = (section, field) => (value) =>
    dispatch(
      setDocumentValue({
        section,
        field,
        value,
      }),
    );

  return (
    <section
      className={`assistant-card ${expanded ? '' : 'is-collapsed'}`}
      aria-label="Henry operations quick editor"
    >
      <div className="assistant-card__header">
        <h4>Operations Quick Edit</h4>
        <p>Live fields for compliance, PDF output, and archive metadata.</p>
        <button
          type="button"
          className="panel-link-btn"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide editor fields' : 'Show editor fields'}
        </button>
      </div>

      <div className="assistant-card__body">
        <Field
          label="Tenant Full Name"
          value={documentData.tenant.fullName}
          placeholder="Enter tenant name"
          onChange={updateValue('tenant', 'fullName')}
        />
        <Field
          label="Tenant Emirates ID"
          value={documentData.tenant.emiratesId}
          placeholder="784-XXXX-XXXXXXX-X"
          onChange={updateValue('tenant', 'emiratesId')}
        />
        <Field
          label="Contract Start Date"
          type="text"
          value={documentData.payments.contractStartDate}
          placeholder="YYYY-MM-DD"
          onChange={updateValue('payments', 'contractStartDate')}
        />
        <Field
          label="Renewal Date"
          type="text"
          value={documentData.renewal.renewalDate}
          placeholder="YYYY-MM-DD"
          onChange={updateValue('renewal', 'renewalDate')}
        />
        <Field
          label="Notice Sent Date"
          type="text"
          value={documentData.renewal.noticeSentDate}
          placeholder="YYYY-MM-DD"
          onChange={updateValue('renewal', 'noticeSentDate')}
        />
        <Field
          label="Current Rent (AED)"
          type="number"
          min="0"
          step="1"
          value={documentData.renewal.currentRent}
          onChange={updateValue('renewal', 'currentRent')}
        />
        <Field
          label="Proposed Rent (AED)"
          type="number"
          min="0"
          step="1"
          value={documentData.renewal.proposedRent}
          onChange={updateValue('renewal', 'proposedRent')}
        />
        <Field
          label="Estimated Market Rent (AED)"
          type="number"
          min="0"
          step="1"
          value={documentData.renewal.marketRent}
          onChange={updateValue('renewal', 'marketRent')}
        />
        <ToggleField
          label="Shared Housing"
          checked={documentData.occupancy.isSharedHousing}
          onChange={updateValue('occupancy', 'isSharedHousing')}
        />
        <Field
          label="Shared Housing Permit"
          value={documentData.occupancy.sharedHousingPermitNumber}
          placeholder="Permit number"
          onChange={updateValue('occupancy', 'sharedHousingPermitNumber')}
        />
        <ToggleField
          label="Ejari Occupants Registered"
          checked={documentData.occupancy.ejariOccupantsRegistered}
          onChange={updateValue('occupancy', 'ejariOccupantsRegistered')}
        />
        <Field
          label="Occupants"
          value={documentData.occupancy.occupants}
          placeholder="List occupants"
          onChange={updateValue('occupancy', 'occupants')}
        />
        <Field
          label="Eviction Reason"
          value={documentData.eviction.reason}
          placeholder="none or personal-use"
          onChange={updateValue('eviction', 'reason')}
        />
        <Field
          label="Eviction Notice Date"
          type="text"
          value={documentData.eviction.noticeDate}
          placeholder="YYYY-MM-DD"
          onChange={updateValue('eviction', 'noticeDate')}
        />
      </div>
    </section>
  );
};

export default React.memo(HenryOperationsPanel);
