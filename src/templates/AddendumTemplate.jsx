import React, { useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TemplateLayout from '../components/TemplateLayout';
import SectionToc from '../components/SectionToc';
import { Disclosure, FormField, Input, Badge } from '../components/ui';
import { setDocumentValue, addAddendumClause, removeAddendumClause } from '../store/documentSlice';
import useDocumentForm from '../hooks/useDocumentForm';
import { addendumFormSchema } from './schemas/addendumFormSchema';

// ─── helpers ──────────────────────────────────────────────────────────────────
const blank = (val, fallback = '____________________') =>
  val !== undefined && val !== null && String(val).trim() !== '' ? val : fallback;

// Read-only display row for locked RERA / policy sections.
const Row = ({ label, value }) => (
  <div className="tc-row">
    <span className="tc-label">{label}</span>
    <span className="tc-value">{value}</span>
  </div>
);

// Signature block — pure display (populated from Redux values, not editable in-line).
const SignatureBlock = ({ sigRole, name, idNo }) => (
  <div className="addendum-sig-block">
    <p className="addendum-sig-role">{sigRole}</p>
    <p className="addendum-sig-name">{blank(name)}</p>
    {idNo && <p className="addendum-sig-id">ID / Emirates ID: {blank(idNo)}</p>}
    <div className="addendum-sig-line" />
    <p className="addendum-sig-label">Signature &amp; Date</p>
  </div>
);

// Inline schema-validated field bridge — same pattern as ViewingFormTemplate.
const Field = React.memo(function Field({ form, path, label, type = 'text', placeholder = '' }) {
  const props = form.fieldProps(path);
  return (
    <FormField label={label} error={props.error}>
      <Input
        type={type}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        placeholder={placeholder}
      />
    </FormField>
  );
});

// TOC
const TOC_SECTIONS = [
  { id: 'add-ref', label: '📄 Contract Ref' },
  { id: 'add-deposit', label: '🔒 Deposit' },
  { id: 'add-renewal', label: '🔄 Renewal' },
  { id: 'add-maintenance', label: '🔧 Maintenance' },
  { id: 'add-services', label: '🏠 Services' },
  { id: 'add-rera', label: '⚖️ RERA' },
  { id: 'add-clauses', label: '📋 Clauses' },
  { id: 'add-signatories', label: '✍️ Signatories' },
];

// ─── component ────────────────────────────────────────────────────────────────
const AddendumTemplate = () => {
  const dispatch = useDispatch();
  const { company, property, tenant, landlord, addendum } = useSelector((state) => state.document);
  const form = useDocumentForm({ schema: addendumFormSchema });

  const [newClause, setNewClause] = useState('');
  const addClauseId = useId();

  const set = (section, field, value) => dispatch(setDocumentValue({ section, field, value }));

  const handleAddClause = () => {
    const trimmed = newClause.trim();
    if (!trimmed) return;
    dispatch(addAddendumClause(trimmed));
    setNewClause('');
  };

  return (
    <TemplateLayout title="Standard Tenancy Addendum (RERA)">
      <SectionToc sections={TOC_SECTIONS} title="Jump to section" />

      {/* ── 1. Contract Reference ───────────────────────────────────────── */}
      <div id="add-ref">
        <Disclosure title="1. Contract Reference" icon="📄" defaultOpen>
          <p className="addendum-intro">
            This Addendum is issued by <strong>{company.name}</strong> (DED License: {company.dedLicense}) and
            forms an integral part of the Tenancy Contract referenced below. All terms herein supplement and,
            where applicable, supersede conflicting clauses in the original contract.
          </p>
          <div className="tc-form-grid">
            <Field
              form={form}
              path="addendum.originalContractRef"
              label="Original Contract Ref."
              placeholder="e.g. WC-TC-2026-001"
            />
            <FormField label="Original Contract Date">
              <Input
                type="date"
                value={addendum.originalContractDate ?? ''}
                onChange={(e) => set('addendum', 'originalContractDate', e.target.value)}
              />
            </FormField>
            <Field
              form={form}
              path="addendum.effectiveDate"
              label="Addendum Effective Date"
              placeholder="dd/mm/yyyy"
            />
          </div>
          {/* Read-only party summary */}
          <div className="addendum-party-summary">
            <Row
              label="Property"
              value={`${blank(property.unit)}, ${blank(property.community)}, ${blank(property.city)}`}
            />
            <Row label="Landlord" value={blank(landlord.name)} />
            <Row label="Tenant" value={blank(tenant.fullName)} />
          </div>
        </Disclosure>
      </div>

      {/* ── 2. Security Deposit (LOCKED) ────────────────────────────────── */}
      <div id="add-deposit">
        <Disclosure title="2. Security Deposit" icon="🔒" badge={<Badge tone="warning">Policy fixed</Badge>}>
          <p>
            The Security Deposit for this tenancy is fixed at{' '}
            <strong>
              AED {Number(addendum.securityDeposit).toLocaleString()} (Four Thousand UAE Dirhams)
            </strong>
            , payable in full before or on the date of key handover. This amount is refundable at the end of
            the tenancy term, subject to the property being returned in its original condition, fair wear and
            tear excepted, and all outstanding obligations having been fulfilled.
          </p>
          <p className="addendum-policy-note">
            ⚠️ This value is fixed by White Caves policy and cannot be varied without written management
            approval.
          </p>
        </Disclosure>
      </div>

      {/* ── 3. Renewal Charges & Notice Period (LOCKED) ─────────────────── */}
      <div id="add-renewal">
        <Disclosure
          title="3. Renewal Charges &amp; Notice Period"
          icon="🔄"
          badge={<Badge tone="warning">Policy fixed</Badge>}
        >
          <p>
            Upon renewal of the tenancy, an administration and renewal charge of{' '}
            <strong>
              AED {Number(addendum.renewalCharges).toLocaleString()} (One Thousand and Fifty UAE Dirhams —
              inclusive of VAT)
            </strong>{' '}
            shall be due and payable by the Tenant.
          </p>
          <p>
            Both parties are required to provide written notice of their intention to renew or terminate the
            tenancy no later than <strong>{addendum.noticePeriodDays} days</strong> prior to the contract
            expiry date, in accordance with <em>{addendum.legalReference}</em>.
          </p>
          <p className="addendum-policy-note">
            ⚠️ Renewal charges and the 90-day notice requirement are fixed by RERA policy.
          </p>
        </Disclosure>
      </div>

      {/* ── 4. Maintenance Responsibilities (LOCKED) ────────────────────── */}
      <div id="add-maintenance">
        <Disclosure
          title="4. Maintenance Responsibilities"
          icon="🔧"
          badge={<Badge tone="warning">Policy fixed</Badge>}
        >
          <p>
            Maintenance obligations are apportioned based on a threshold of{' '}
            <strong>AED {Number(addendum.maintenanceCap).toLocaleString()}</strong>:
          </p>
          <Row label="Tenant (≤ AED 1,000)" value={blank(addendum.maintenanceTenantResponsibility)} />
          <Row label="Landlord (> AED 1,000)" value={blank(addendum.maintenanceLandlordResponsibility)} />
          <p>
            In all cases, the party undertaking repairs must use qualified contractors. Emergency repairs must
            be reported to the Landlord or Agent within 24 hours.
          </p>
        </Disclosure>
      </div>

      {/* ── 5. Landlord Mandatory Services (LOCKED) ─────────────────────── */}
      <div id="add-services">
        <Disclosure
          title="5. Landlord Mandatory Services"
          icon="🏠"
          badge={<Badge tone="warning">Policy fixed</Badge>}
        >
          <p>
            The Landlord agrees to provide, at no additional cost to the Tenant, the following mandatory
            services:
          </p>
          <ol className="addendum-services-list">
            {addendum.landlordServices.map((service, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i}>{service}</li>
            ))}
          </ol>
          <p>
            Services marked &ldquo;prior to key handover&rdquo; must be completed before the Tenant takes
            possession. Services during the tenancy term shall be performed at reasonable intervals.
          </p>
        </Disclosure>
      </div>

      {/* ── 6. RERA Compliance & Legal Framework (LOCKED) ──────────────── */}
      <div id="add-rera">
        <Disclosure
          title="6. RERA Compliance &amp; Legal Framework"
          icon="⚖️"
          badge={<Badge tone="warning">Policy fixed</Badge>}
        >
          <p>
            This Addendum and the principal Tenancy Contract are governed by and construed in accordance with{' '}
            <strong>{addendum.legalReference}</strong> and all RERA Regulations issued thereunder. Any dispute
            arising from this Addendum shall be referred first to the Dubai Land Department Rental Dispute
            Settlement Centre (RDSC).
          </p>
          <Row label="Notice Period" value={`${addendum.noticePeriodDays} days (per Article 25)`} />
          <Row label="Legal Reference" value={blank(addendum.legalReference)} />
          <p>
            Both parties confirm that they have read, understood, and agree to be bound by all terms contained
            in this Addendum and the principal Tenancy Contract.
          </p>
        </Disclosure>
      </div>

      {/* ── 7. Additional Agreed Clauses (EDITABLE) ─────────────────────── */}
      <div id="add-clauses">
        <Disclosure
          title="7. Additional Agreed Clauses"
          icon="📋"
          badge={
            addendum.additionalClauses.length > 0 ? (
              <Badge tone="success">
                {addendum.additionalClauses.length} clause{addendum.additionalClauses.length !== 1 ? 's' : ''}
              </Badge>
            ) : null
          }
        >
          {addendum.additionalClauses.length > 0 ? (
            <ol className="addendum-additional-clauses" aria-label="Additional clauses">
              {addendum.additionalClauses.map((clause, i) => (
                <li key={`clause-${i}`} className="tc-term-item">
                  <span className="tc-term-text">{clause}</span>
                  <button
                    type="button"
                    className="tc-term-remove"
                    aria-label={`Remove clause ${i + 1}`}
                    onClick={() => dispatch(removeAddendumClause(i))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="tc-empty-hint">No additional clauses yet. Add one below.</p>
          )}
          <div className="tc-add-term-row">
            <FormField label="New Clause" id={addClauseId}>
              <Input
                id={addClauseId}
                value={newClause}
                onChange={(e) => setNewClause(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClause();
                  }
                }}
                placeholder="Type a new clause and press Enter or click Add"
              />
            </FormField>
            <button
              type="button"
              className="tc-add-btn"
              onClick={handleAddClause}
              disabled={!newClause.trim()}
            >
              + Add Clause
            </button>
          </div>
        </Disclosure>
      </div>

      {/* ── 8. Signatories ─────────────────────────────────────────────── */}
      <div id="add-signatories">
        <Disclosure title="8. Signatories" icon="✍️">
          <p className="addendum-sig-intro">
            The undersigned parties hereby agree to all terms set forth in this Addendum.
          </p>
          <div className="tc-form-grid" style={{ marginBottom: '1rem' }}>
            <FormField label="Witness / Agent Name" hint="The agent or independent witness signing">
              <Input
                value={addendum.witnessName ?? ''}
                onChange={(e) => set('addendum', 'witnessName', e.target.value)}
                placeholder="Full name"
              />
            </FormField>
            <FormField label="Witness Emirates ID / ID No.">
              <Input
                value={addendum.witnessIdNo ?? ''}
                onChange={(e) => set('addendum', 'witnessIdNo', e.target.value)}
                placeholder="784-XXXX-XXXXXXX-X"
              />
            </FormField>
          </div>
          <div className="addendum-sig-grid">
            <SignatureBlock sigRole="Landlord" name={landlord.name} idNo={landlord.emiratesId} />
            <SignatureBlock sigRole="Tenant" name={tenant.fullName} idNo={tenant.emiratesId} />
            <SignatureBlock
              sigRole="Witness / Agent"
              name={blank(addendum.witnessName)}
              idNo={blank(addendum.witnessIdNo, '')}
            />
          </div>
          <p className="addendum-agent-footer">
            Prepared by: {company.name} — {company.role} — DED License {company.dedLicense}
          </p>
        </Disclosure>
      </div>
    </TemplateLayout>
  );
};

export default AddendumTemplate;
