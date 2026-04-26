import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';
import SectionToc from '../components/SectionToc';
import { Disclosure, FormField, Input, ProgressRing, Textarea } from '../components/ui';
import { setDocumentValue } from '../store/documentSlice';
import useDocumentForm from '../hooks/useDocumentForm';
import { viewingFormSchema } from './schemas/viewingFormSchema';

// ─── Field bridge ──────────────────────────────────────────────────────
// `form.fieldProps(path)` already returns { value, onChange, onBlur, error,
// 'aria-invalid' } shaped for spread. The template just needs a thin
// presentational wrapper that:
//   - Maps schema-style path ⇄ label-friendly UI
//   - Routes the optional `type='number'` through a number-coercing onChange
//     (raw values from <Input/> arrive as strings; Redux stores
//     parkingCount as a number).
// `error` from fieldProps is undefined unless the field is touched OR a
// submission attempt has been made — so first-paint never screams.
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

// Textareas (additional info / services notes) aren't in the schema — they're
// free-form annotations the regulator doesn't validate. Keep the lightweight
// dispatch path so they still hit Redux without a useDocumentForm round-trip.
const TextareaField = ({ label, value, onChange, rows = 2 }) => (
  <FormField label={label}>
    <Textarea rows={rows} value={value ?? ''} onChange={onChange} />
  </FormField>
);

// Counts how many fields in a section have a non-empty value — used as the
// Disclosure progress badge so users see at a glance which sections are ready.
const countFilled = (obj, fields) =>
  fields.filter((f) => {
    const v = obj?.[f];
    return v !== undefined && v !== null && String(v).trim().length > 0;
  }).length;

// Returns true if any schema-tracked path in the given `section` has a
// CURRENTLY-VISIBLE validation error — used to flip the section's
// ProgressRing to the danger tone so the user sees where the problems are
// without scrolling. We use `visibleErrors` (touched/submitted-gated) to
// avoid the screaming-form anti-pattern at first paint.
const sectionHasError = (visibleErrors, section) =>
  Object.keys(visibleErrors).some((path) => path.startsWith(`${section}.`));

// Renders a `<ProgressRing>` for a Disclosure header that picks tone from
// (a) any visible validation error in the section → danger, otherwise
// (b) `auto` so the ring goes neutral → warning → success as the user fills.
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

const ViewingFormTemplate = () => {
  const dispatch = useDispatch();
  const { broker, tenant, property, viewing } = useSelector((state) => state.document);
  const form = useDocumentForm({ schema: viewingFormSchema });

  // Free-form textareas don't go through the schema; keep their tiny ad-hoc
  // dispatcher intact so we don't widen the schema with notes that never
  // need validation.
  const onTextarea = (section, field) => (e) =>
    dispatch(setDocumentValue({ section, field, value: e.target.value }));

  const brokerFields = [
    'orn',
    'brn',
    'companyName',
    'commercialLicenseNumber',
    'brokerName',
    'phone',
    'mobile',
    'email',
    'address',
  ];
  const tenantFields = ['fullName', 'emiratesId', 'passportNo', 'contactNo', 'email', 'poBox', 'address'];
  const propertyFields = [
    'propertyStatus',
    'plotNo',
    'propertyType',
    'usage',
    'size',
    'makaniNo',
    'projectName',
    'buildingNumber',
    'ownersAssociationNo',
    'parkingCount',
    'unit',
    'community',
  ];
  const scheduleFields = ['viewingDate', 'viewingTime'];

  // Aggregate validity for the in-page status pill. Counts only schema-tracked
  // fields, not the cosmetic per-section `completion()` badge.
  const errorCount = Object.keys(form.errors).length;

  const tocSections = [
    { id: 'vf-agreement', label: 'Agreement', icon: '📝' },
    { id: 'vf-broker', label: 'Broker', icon: '🧑‍💼' },
    { id: 'vf-tenant', label: 'Tenant', icon: '👤' },
    { id: 'vf-property', label: 'Property', icon: '🏠' },
    { id: 'vf-schedule', label: 'Schedule', icon: '📅' },
  ];

  return (
    <TemplateLayout title="Property Viewing Agreement (DLD/RERA P210)">
      <div className="simple-doc-header">
        <h3>{broker.companyName || '—'}</h3>
        <p>RERA No. DLD/RERA/RL/LP/P210 · Vr.4 · Aug 2022</p>
      </div>

      {/*
       * Form-level status pill. Always visible, calmly informative when the
       * form is clean, escalates to a "fix N issues" prompt only after the
       * user has interacted (per-field red rings come from `visibleErrors`,
       * gated on touched/submitted in the hook).
       */}
      <div className="viewing-status" role="status">
        {form.isValid ? (
          <span className="viewing-status__ok">All required fields look good.</span>
        ) : (
          <span className="viewing-status__warn">
            {errorCount} field{errorCount === 1 ? '' : 's'} need attention before this agreement is ready.
          </span>
        )}
      </div>

      <SectionToc sections={tocSections} className="print-hidden" title="Viewing sections" />

      <section id="vf-agreement" className="viewing-anchor">
        <Disclosure title="Agreement" icon="📝" defaultOpen>
          <div className="viewing-grid">
            <Field form={form} path="viewing.agreementNumber" label="Agreement Number" />
            <Field form={form} path="property.documentDate" label="Date" placeholder="22 April 2026" />
          </div>
        </Disclosure>
      </section>

      <section id="vf-broker" className="viewing-anchor">
        <Disclosure
          title="Broker Details"
          icon="🧑‍💼"
          badge={
            <SectionBadge
              section="broker"
              obj={broker}
              fields={brokerFields}
              visibleErrors={form.visibleErrors}
              label="Broker details"
            />
          }
        >
          <div className="viewing-grid">
            <Field form={form} path="broker.orn" label="ORN" />
            <Field form={form} path="broker.brn" label="BRN" />
            <Field form={form} path="broker.companyName" label="Company Name" />
            <Field form={form} path="broker.commercialLicenseNumber" label="Commercial License Number" />
            <Field form={form} path="broker.brokerName" label="Broker's Name" />
            <Field form={form} path="broker.phone" label="Phone" />
            <Field form={form} path="broker.mobile" label="Mobile" />
            <Field form={form} path="broker.email" label="Email" type="email" />
            <Field form={form} path="broker.address" label="Address" />
          </div>
        </Disclosure>
      </section>

      <section id="vf-tenant" className="viewing-anchor">
        <Disclosure
          title="Tenant Details"
          icon="👤"
          badge={
            <SectionBadge
              section="tenant"
              obj={tenant}
              fields={tenantFields}
              visibleErrors={form.visibleErrors}
              label="Tenant details"
            />
          }
        >
          <div className="viewing-grid">
            <Field form={form} path="tenant.fullName" label="Tenant's Name" />
            <Field form={form} path="tenant.emiratesId" label="Emirates ID" />
            <Field form={form} path="tenant.passportNo" label="Passport No." />
            <Field form={form} path="tenant.contactNo" label="Mobile / Phone" />
            <Field form={form} path="tenant.email" label="Email" type="email" />
            <Field form={form} path="tenant.poBox" label="P.O. Box" />
            <Field form={form} path="tenant.address" label="Address" />
          </div>
          <TextareaField
            label="Additional Information"
            value={viewing.additionalInfo}
            onChange={onTextarea('viewing', 'additionalInfo')}
          />
        </Disclosure>
      </section>

      <section id="vf-property" className="viewing-anchor">
        <Disclosure
          title="Property Details"
          icon="🏠"
          badge={
            <SectionBadge
              section="property"
              obj={property}
              fields={propertyFields}
              visibleErrors={form.visibleErrors}
              label="Property details"
            />
          }
        >
          <div className="viewing-grid">
            <Field form={form} path="property.propertyStatus" label="Property Status" />
            <Field form={form} path="property.plotNo" label="Plot No." />
            <Field
              form={form}
              path="property.propertyType"
              label="Type (Villa / Apartment / Shop / Office / Warehouse / Other)"
            />
            <Field form={form} path="property.usage" label="Use (Residential / Commercial / Other)" />
            <Field form={form} path="property.size" label="Area" />
            <Field form={form} path="property.makaniNo" label="Makani ID" />
            <Field form={form} path="property.projectName" label="Project Name" />
            <Field form={form} path="property.buildingNumber" label="Building Number" />
            <Field form={form} path="property.ownersAssociationNo" label="Owners' Association No" />
            <Field form={form} path="property.parkingCount" label="No. of Car Parks" type="number" />
            <Field
              form={form}
              path="viewing.rentalBudget"
              label="Approx. Rental Budget"
              placeholder="AED 90,000"
            />
            <Field form={form} path="property.unit" label="Unit / Property No." />
            <Field form={form} path="property.community" label="Community" />
          </div>
          <TextareaField
            label="Services and General Information"
            value={viewing.servicesNotes}
            onChange={onTextarea('viewing', 'servicesNotes')}
          />
        </Disclosure>
      </section>

      <section id="vf-schedule" className="viewing-anchor">
        <Disclosure
          title="Viewing Schedule"
          icon="📅"
          badge={
            <SectionBadge
              section="viewing"
              obj={viewing}
              fields={scheduleFields}
              visibleErrors={form.visibleErrors}
              label="Viewing schedule"
            />
          }
        >
          <div className="viewing-grid">
            <Field form={form} path="viewing.viewingDate" label="Viewing Date" placeholder="DD MMM YYYY" />
            <Field form={form} path="viewing.viewingTime" label="Viewing Time" placeholder="3:00 PM" />
          </div>
        </Disclosure>
      </section>

      <p className="doc-note">
        Toggle <strong>Print Preview</strong> at the top of this panel to render the official A4 PDF, or click
        <strong> Generate PDF</strong> in the footer to save it directly to{' '}
        <code>
          /records/{'{YEAR}'}/{'{MONTH}'}/…
        </code>
        .
      </p>
    </TemplateLayout>
  );
};

export default React.memo(ViewingFormTemplate);
