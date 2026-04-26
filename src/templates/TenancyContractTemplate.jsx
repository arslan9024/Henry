import React, { useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';
import SectionToc from '../components/SectionToc';
import { Disclosure, FormField, Input, Textarea, Select, ProgressRing, Badge } from '../components/ui';
import { setDocumentValue, addTenancyTerm, removeTenancyTerm } from '../store/documentSlice';
import useDocumentForm from '../hooks/useDocumentForm';
import { tenancyFormSchema } from './schemas/tenancyFormSchema';

// ─── Field helpers ─────────────────────────────────────────────────────────────
const Field = React.memo(function Field({ form, path, label, type = 'text', placeholder = '' }) {
  const props = form.fieldProps(path);
  const onChange =
    type === 'number'
      ? (e) => props.onChange({ target: { value: Number(e.target.value) || 0 } })
      : props.onChange;
  return (
    <FormField label={label} error={props.error}>
      <Input
        type={type}
        value={props.value}
        onChange={onChange}
        onBlur={props.onBlur}
        placeholder={placeholder}
      />
    </FormField>
  );
});

const TextareaField = ({ label, value, onChange, rows = 3, placeholder = '' }) => (
  <FormField label={label}>
    <Textarea rows={rows} value={value ?? ''} onChange={onChange} placeholder={placeholder} />
  </FormField>
);

const SelectField = ({ label, value, onChange, options = [] }) => (
  <FormField label={label}>
    <Select value={value ?? ''} onChange={onChange} options={options} />
  </FormField>
);

// ─── Section progress badge ────────────────────────────────────────────────────
const countFilled = (obj, fields) =>
  fields.filter((f) => {
    const v = obj?.[f];
    return v !== undefined && v !== null && String(v).trim().length > 0;
  }).length;

const sectionHasError = (visibleErrors, section) =>
  Object.keys(visibleErrors).some((path) => path.startsWith(`${section}.`));

const SectionBadge = ({ section, obj, fields, visibleErrors, label }) => {
  const filled = countFilled(obj, fields);
  const total = fields.length;
  const tone = sectionHasError(visibleErrors, section) ? 'danger' : 'auto';
  return (
    <ProgressRing
      value={filled}
      max={total}
      tone={tone}
      size="md"
      label={`${label} progress, ${filled} of ${total}`}
    />
  );
};

// ─── Option lists ──────────────────────────────────────────────────────────────
const USAGE_OPTIONS = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Mixed', label: 'Mixed' },
];
const PROPERTY_TYPE_OPTIONS = [
  { value: 'Villa', label: 'Villa' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Studio', label: 'Studio' },
  { value: 'Office', label: 'Office' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Warehouse', label: 'Warehouse' },
];
const PROPERTY_STATUS_OPTIONS = [
  { value: 'Vacant – Ready to move in', label: 'Vacant – Ready to move in' },
  { value: 'Occupied', label: 'Occupied' },
  { value: 'Under Renovation', label: 'Under Renovation' },
];
const PAYMENT_MODE_OPTIONS = [
  { value: '1 Cheque', label: '1 Cheque' },
  { value: '2 Cheques', label: '2 Cheques' },
  { value: '4 Cheques', label: '4 Cheques' },
  { value: '6 Cheques', label: '6 Cheques' },
  { value: '12 Cheques', label: '12 Cheques' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cash', label: 'Cash' },
];
const EVICTION_REASON_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sale', label: 'Sale of property' },
  { value: 'personal-use', label: 'Personal use by owner' },
  { value: 'renovation', label: 'Major renovation' },
  { value: 'non-payment', label: 'Non-payment of rent' },
  { value: 'breach', label: 'Breach of contract' },
];
const MAINTENANCE_OPTIONS = [
  { value: 'tenant-minor-landlord-major', label: 'Tenant: minor / Landlord: major' },
  { value: 'landlord-all', label: 'Landlord: all maintenance' },
  { value: 'tenant-all', label: 'Tenant: all maintenance' },
];

// ─── Section TOC ──────────────────────────────────────────────────────────────
const TOC_SECTIONS = [
  { id: 'tc-property', label: '🏠 Property' },
  { id: 'tc-tenant', label: '👤 Tenant' },
  { id: 'tc-landlord', label: '🏡 Landlord' },
  { id: 'tc-financial', label: '💰 Financials' },
  { id: 'tc-dates', label: '📅 Dates' },
  { id: 'tc-occupancy', label: '👥 Occupancy' },
  { id: 'tc-banking', label: '🏦 Banking' },
  { id: 'tc-terms', label: '📋 Terms' },
  { id: 'tc-handover', label: '🔑 Handover' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const TenancyContractTemplate = () => {
  const dispatch = useDispatch();
  const { tenant, landlord, property, payments, renewal, occupancy, eviction, tenancy } = useSelector(
    (state) => state.document,
  );
  const form = useDocumentForm({ schema: tenancyFormSchema });
  const { visibleErrors } = form;

  const [newTerm, setNewTerm] = useState('');
  const addTermId = useId();

  const set = (section, field, value) => dispatch(setDocumentValue({ section, field, value }));

  const handleAddTerm = () => {
    const trimmed = newTerm.trim();
    if (!trimmed) return;
    dispatch(addTenancyTerm(trimmed));
    setNewTerm('');
  };

  return (
    <TemplateLayout title="Tenancy Contract (DLD Ejari)">
      <SectionToc sections={TOC_SECTIONS} title="Jump to section" />

      {/* ── 1. Property Details ─────────────────────────────────────────── */}
      <div id="tc-property">
        <Disclosure
          title="Property Details"
          icon="🏠"
          badge={
            <SectionBadge
              section="property"
              obj={property}
              fields={['unit', 'community', 'city', 'projectName', 'propertyType', 'propertyStatus']}
              visibleErrors={visibleErrors}
              label="Property Details"
            />
          }
        >
          <div className="tc-form-grid">
            <Field form={form} path="property.unit" label="Unit No." placeholder="e.g. Villa 12" />
            <Field
              form={form}
              path="property.cluster"
              label="Cluster / Building"
              placeholder="e.g. Block A"
            />
            <Field form={form} path="property.community" label="Community" placeholder="e.g. Damac Hills 2" />
            <Field form={form} path="property.city" label="City" placeholder="Dubai" />
            <Field
              form={form}
              path="property.projectName"
              label="Project Name"
              placeholder="e.g. Damac Hills 2"
            />
            <Field form={form} path="property.size" label="Size" placeholder="e.g. 3,600 sq ft" />
            <Field
              form={form}
              path="property.parking"
              label="Parking"
              placeholder="e.g. 2 Allocated Spaces"
            />
            <Field
              form={form}
              path="property.description"
              label="Description"
              placeholder="e.g. 4 Bed + Maid"
            />
            <SelectField
              label="Usage"
              value={property.usage}
              onChange={(e) => set('property', 'usage', e.target.value)}
              options={USAGE_OPTIONS}
            />
            <SelectField
              label="Property Type"
              value={property.propertyType}
              onChange={(e) => set('property', 'propertyType', e.target.value)}
              options={PROPERTY_TYPE_OPTIONS}
            />
            <SelectField
              label="Property Status"
              value={property.propertyStatus}
              onChange={(e) => set('property', 'propertyStatus', e.target.value)}
              options={PROPERTY_STATUS_OPTIONS}
            />
            <Field form={form} path="property.condition" label="Condition" placeholder="e.g. Unfurnished" />
            <Field form={form} path="property.plotNo" label="Plot No." placeholder="Optional" />
            <Field form={form} path="property.makaniNo" label="Makani No." placeholder="Optional" />
            <Field
              form={form}
              path="property.dewaPremisesNo"
              label="DEWA Premises No."
              placeholder="Optional"
            />
            <Field
              form={form}
              path="property.ownersAssociationNo"
              label="Owners Association No."
              placeholder="Optional"
            />
          </div>
        </Disclosure>
      </div>

      {/* ── 2. Tenant Details ───────────────────────────────────────────── */}
      <div id="tc-tenant">
        <Disclosure
          title="Tenant Details"
          icon="👤"
          badge={
            <SectionBadge
              section="tenant"
              obj={tenant}
              fields={['fullName', 'emiratesId', 'contactNo', 'email', 'occupation']}
              visibleErrors={visibleErrors}
              label="Tenant Details"
            />
          }
        >
          <div className="tc-form-grid">
            <Field
              form={form}
              path="tenant.fullName"
              label="Full Name"
              placeholder="Tenant full legal name"
            />
            <Field
              form={form}
              path="tenant.emiratesId"
              label="Emirates ID"
              placeholder="784-XXXX-XXXXXXX-X"
            />
            <Field form={form} path="tenant.idExpiryDate" label="ID Expiry Date" type="date" />
            <Field form={form} path="tenant.passportNo" label="Passport No." placeholder="Optional" />
            <Field form={form} path="tenant.contactNo" label="Contact No." placeholder="+971 50 XXX XXXX" />
            <Field
              form={form}
              path="tenant.email"
              label="Email"
              type="email"
              placeholder="tenant@example.com"
            />
            <Field
              form={form}
              path="tenant.occupation"
              label="Occupation"
              placeholder="e.g. Software Engineer"
            />
            <Field form={form} path="tenant.address" label="Address" placeholder="Current address" />
            <Field form={form} path="tenant.poBox" label="P.O. Box" placeholder="Optional" />
          </div>
        </Disclosure>
      </div>

      {/* ── 3. Landlord Details ─────────────────────────────────────────── */}
      <div id="tc-landlord">
        <Disclosure
          title="Landlord Details"
          icon="🏡"
          badge={
            <SectionBadge
              section="landlord"
              obj={landlord}
              fields={['name', 'emiratesId', 'email', 'phone']}
              visibleErrors={visibleErrors}
              label="Landlord Details"
            />
          }
        >
          <div className="tc-form-grid">
            <Field form={form} path="landlord.name" label="Landlord Name" placeholder="Full legal name" />
            <Field
              form={form}
              path="landlord.emiratesId"
              label="Emirates ID"
              placeholder="784-XXXX-XXXXXXX-X"
            />
            <Field form={form} path="landlord.idExpiryDate" label="ID Expiry Date" type="date" />
            <Field
              form={form}
              path="landlord.email"
              label="Email"
              type="email"
              placeholder="landlord@example.com"
            />
            <Field form={form} path="landlord.phone" label="Phone" placeholder="+971 X XXX XXXX" />
          </div>
        </Disclosure>
      </div>

      {/* ── 4. Financial Terms ──────────────────────────────────────────── */}
      <div id="tc-financial">
        <Disclosure
          title="Financial Terms"
          icon="💰"
          badge={
            <SectionBadge
              section="payments"
              obj={payments}
              fields={['annualRent', 'securityDeposit', 'agencyFee', 'ejariFee', 'modeOfPayment']}
              visibleErrors={visibleErrors}
              label="Financial Terms"
            />
          }
        >
          <div className="tc-form-grid">
            <Field
              form={form}
              path="payments.annualRent"
              label="Annual Rent (AED)"
              type="number"
              placeholder="85000"
            />
            <Field
              form={form}
              path="payments.securityDeposit"
              label="Security Deposit (AED)"
              type="number"
              placeholder="4250"
            />
            <Field
              form={form}
              path="payments.agencyFee"
              label="Agency Fee (AED)"
              type="number"
              placeholder="4250"
            />
            <Field
              form={form}
              path="payments.ejariFee"
              label="Ejari Fee (AED)"
              type="number"
              placeholder="265"
            />
            <FormField label="Total Due (AED)" hint="Auto-sum — edit individual amounts above">
              <Input
                type="number"
                value={payments.total ?? 0}
                readOnly
                tabIndex={-1}
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </FormField>
            <SelectField
              label="Mode of Payment"
              value={payments.modeOfPayment}
              onChange={(e) => set('payments', 'modeOfPayment', e.target.value)}
              options={PAYMENT_MODE_OPTIONS}
            />
          </div>
        </Disclosure>
      </div>

      {/* ── 5. Contract Term & Dates ────────────────────────────────────── */}
      <div id="tc-dates">
        <Disclosure
          title="Contract Term & Dates"
          icon="📅"
          badge={
            <SectionBadge
              section="payments"
              obj={payments}
              fields={['contractStartDate', 'contractEndDate', 'moveInDate']}
              visibleErrors={visibleErrors}
              label="Contract Term & Dates"
            />
          }
        >
          <div className="tc-form-grid">
            <Field form={form} path="payments.moveInDate" label="Move-in Date" placeholder="01 May 2026" />
            <Field
              form={form}
              path="payments.contractStartDate"
              label="Contract Start Date"
              placeholder="01 May 2026"
            />
            <Field
              form={form}
              path="payments.contractEndDate"
              label="Contract End Date"
              placeholder="30 April 2027"
            />
            <Field
              form={form}
              path="payments.signingDeadline"
              label="Signing Deadline"
              placeholder="01 May 2026"
            />
            <FormField label="Renewal Date">
              <Input
                value={renewal.renewalDate ?? ''}
                onChange={(e) => set('renewal', 'renewalDate', e.target.value)}
                placeholder="30 April 2027"
              />
            </FormField>
            <FormField label="Notice Period (days)">
              <Input
                type="number"
                value={tenancy.noticePeriodDays ?? 90}
                onChange={(e) => set('tenancy', 'noticePeriodDays', Number(e.target.value) || 0)}
                placeholder="90"
              />
            </FormField>
            <FormField label="Grace Period — late payment (days)">
              <Input
                type="number"
                value={tenancy.gracePeriodDays ?? 5}
                onChange={(e) => set('tenancy', 'gracePeriodDays', Number(e.target.value) || 0)}
                placeholder="5"
              />
            </FormField>
            <FormField label="Ejari No." hint="Leave blank until Ejari submission is complete">
              <Input
                value={tenancy.ejariNumber ?? ''}
                onChange={(e) => set('tenancy', 'ejariNumber', e.target.value)}
                placeholder="Populated after Ejari registration"
              />
            </FormField>
            <FormField label="Ejari Registration Date">
              <Input
                value={tenancy.ejariRegistrationDate ?? ''}
                onChange={(e) => set('tenancy', 'ejariRegistrationDate', e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </FormField>
          </div>
        </Disclosure>
      </div>

      {/* ── 6. Occupancy & Conditions ───────────────────────────────────── */}
      <div id="tc-occupancy">
        <Disclosure
          title="Occupancy & Conditions"
          icon="👥"
          badge={
            <SectionBadge
              section="tenancy"
              obj={tenancy}
              fields={['maintenanceObligation', 'includedUtilities']}
              visibleErrors={visibleErrors}
              label="Occupancy & Conditions"
            />
          }
        >
          <div className="tc-form-grid">
            <FormField label="Sub-letting Allowed">
              <Select
                value={tenancy.subletAllowed ? 'yes' : 'no'}
                onChange={(e) => set('tenancy', 'subletAllowed', e.target.value === 'yes')}
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'yes', label: 'Yes' },
                ]}
              />
            </FormField>
            <FormField label="Pets Allowed">
              <Select
                value={tenancy.petsAllowed ? 'yes' : 'no'}
                onChange={(e) => set('tenancy', 'petsAllowed', e.target.value === 'yes')}
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'yes', label: 'Yes' },
                ]}
              />
            </FormField>
            <SelectField
              label="Maintenance Obligation"
              value={tenancy.maintenanceObligation}
              onChange={(e) => set('tenancy', 'maintenanceObligation', e.target.value)}
              options={MAINTENANCE_OPTIONS}
            />
            <FormField label="Included Utilities" hint="e.g. DEWA, District Cooling, or None">
              <Input
                value={tenancy.includedUtilities ?? ''}
                onChange={(e) => set('tenancy', 'includedUtilities', e.target.value)}
                placeholder="None, or DEWA, District Cooling…"
              />
            </FormField>
            <FormField label="Ejari Occupants Registered">
              <Select
                value={occupancy.ejariOccupantsRegistered ? 'yes' : 'no'}
                onChange={(e) => set('occupancy', 'ejariOccupantsRegistered', e.target.value === 'yes')}
                options={[
                  { value: 'no', label: 'Pending' },
                  { value: 'yes', label: 'Yes – Registered' },
                ]}
              />
            </FormField>
            <FormField label="Shared Housing">
              <Select
                value={occupancy.isSharedHousing ? 'yes' : 'no'}
                onChange={(e) => set('occupancy', 'isSharedHousing', e.target.value === 'yes')}
                options={[
                  { value: 'no', label: 'No – Standard occupancy' },
                  { value: 'yes', label: 'Yes – Shared housing permit required' },
                ]}
              />
            </FormField>
            {occupancy.isSharedHousing && (
              <FormField label="Shared Housing Permit No.">
                <Input
                  value={occupancy.sharedHousingPermitNumber ?? ''}
                  onChange={(e) => set('occupancy', 'sharedHousingPermitNumber', e.target.value)}
                  placeholder="Permit number"
                />
              </FormField>
            )}
            <FormField label="Occupants" hint="Optional — for DLD occupant registration">
              <Input
                value={occupancy.occupants ?? ''}
                onChange={(e) => set('occupancy', 'occupants', e.target.value)}
                placeholder="e.g. 2 Adults + 1 Child"
              />
            </FormField>
            <SelectField
              label="Eviction Reason"
              value={eviction.reason}
              onChange={(e) => set('eviction', 'reason', e.target.value)}
              options={EVICTION_REASON_OPTIONS}
            />
            {eviction.reason !== 'none' && (
              <FormField label="Eviction Notice Date">
                <Input
                  type="date"
                  value={eviction.noticeDate ?? ''}
                  onChange={(e) => set('eviction', 'noticeDate', e.target.value)}
                />
              </FormField>
            )}
          </div>
        </Disclosure>
      </div>

      {/* ── 7. Landlord Banking Details ─────────────────────────────────── */}
      <div id="tc-banking">
        <Disclosure
          title="Landlord Banking Details"
          icon="🏦"
          badge={
            <SectionBadge
              section="landlord"
              obj={landlord}
              fields={['iban', 'bank', 'swift']}
              visibleErrors={visibleErrors}
              label="Landlord Banking Details"
            />
          }
        >
          <div className="tc-form-grid">
            <Field form={form} path="landlord.iban" label="IBAN" placeholder="AE030359356491705358002" />
            <Field form={form} path="landlord.bank" label="Bank" placeholder="First Abu Dhabi Bank (FAB)" />
            <Field form={form} path="landlord.swift" label="SWIFT / BIC" placeholder="NBADAEAA" />
          </div>
        </Disclosure>
      </div>

      {/* ── 8. Additional Terms ─────────────────────────────────────────── */}
      <div id="tc-terms">
        <Disclosure
          title="Additional Terms"
          icon="📋"
          badge={
            tenancy.additionalTerms.length > 0 ? (
              <Badge tone="success">
                {tenancy.additionalTerms.length} term{tenancy.additionalTerms.length !== 1 ? 's' : ''}
              </Badge>
            ) : null
          }
        >
          <TextareaField
            label="Special Conditions"
            value={tenancy.specialConditions}
            onChange={(e) => set('tenancy', 'specialConditions', e.target.value)}
            rows={4}
            placeholder="Any special conditions agreed between landlord and tenant…"
          />
          <div className="tc-terms-list">
            {tenancy.additionalTerms.length > 0 && (
              <ol className="tc-terms-ordered" aria-label="Additional contract terms">
                {tenancy.additionalTerms.map((term, i) => (
                  <li key={`term-${i}`} className="tc-term-item">
                    <span className="tc-term-text">{term}</span>
                    <button
                      type="button"
                      className="tc-term-remove"
                      aria-label={`Remove term ${i + 1}`}
                      onClick={() => dispatch(removeTenancyTerm(i))}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
            )}
            {tenancy.additionalTerms.length === 0 && (
              <p className="tc-empty-hint">No additional terms yet. Add one below.</p>
            )}
            <div className="tc-add-term-row">
              <FormField label="New Term" id={addTermId}>
                <Input
                  id={addTermId}
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTerm();
                    }
                  }}
                  placeholder="Type a new term and press Enter or click Add"
                />
              </FormField>
              <button type="button" className="tc-add-btn" onClick={handleAddTerm} disabled={!newTerm.trim()}>
                + Add Term
              </button>
            </div>
          </div>
        </Disclosure>
      </div>

      {/* ── 9. Key Handover & Inspection ────────────────────────────────── */}
      <div id="tc-handover">
        <Disclosure
          title="Key Handover & Inspection"
          icon="🔑"
          badge={
            tenancy.checklistCompleted ? (
              <Badge tone="success">✓ Complete</Badge>
            ) : (
              <Badge tone="neutral">Pending</Badge>
            )
          }
        >
          <div className="tc-form-grid">
            <FormField label="Key Handover Date">
              <Input
                type="date"
                value={tenancy.keyHandoverDate ?? ''}
                onChange={(e) => set('tenancy', 'keyHandoverDate', e.target.value)}
              />
            </FormField>
            <FormField label="Checklist Completed">
              <Select
                value={tenancy.checklistCompleted ? 'yes' : 'no'}
                onChange={(e) => set('tenancy', 'checklistCompleted', e.target.value === 'yes')}
                options={[
                  { value: 'no', label: '⏳ Pending' },
                  { value: 'yes', label: '✅ Completed' },
                ]}
              />
            </FormField>
          </div>
          <TextareaField
            label="Move-in Inspection Notes"
            value={tenancy.moveInInspectionNotes}
            onChange={(e) => set('tenancy', 'moveInInspectionNotes', e.target.value)}
            rows={5}
            placeholder="Record property condition at handover — existing marks, missing items, meter readings…"
          />
        </Disclosure>
      </div>
    </TemplateLayout>
  );
};

export default TenancyContractTemplate;
