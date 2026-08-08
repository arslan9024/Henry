import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { APP_PAGES } from '../store/appRouteSlice';
import useAppNavigation from '../hooks/useAppNavigation';
import { Badge, Button, Card, EmptyState, Input, Select } from './ui';

export const REQUIRED_RECORD_FIELDS = [
  ['landlord.name', 'Landlord name'],
  ['landlord.phone', 'Landlord phone'],
  ['landlord.email', 'Landlord email'],
  ['property.unit', 'Property unit'],
  ['property.community', 'Community'],
  ['tenant.fullName', 'Tenant name'],
  ['tenant.contactNo', 'Tenant phone'],
  ['tenant.email', 'Tenant email'],
  ['payments.contractStartDate', 'Contract start'],
  ['payments.contractEndDate', 'Contract end'],
  ['payments.annualRent', 'Annual rent'],
];

const readByPath = (value, path) => path.split('.').reduce((current, key) => current?.[key], value);
const isPresent = (value) =>
  value !== null && value !== undefined && String(value).trim() !== '' && value !== 0;

export const evaluateActiveRecord = (documentData) => {
  const missing = REQUIRED_RECORD_FIELDS.filter(([path]) => !isPresent(readByPath(documentData, path))).map(
    ([path, label]) => ({ path, label }),
  );
  const complete = REQUIRED_RECORD_FIELDS.length - missing.length;
  return {
    id: 'active-record',
    kind: 'active',
    label: `${documentData?.property?.unit || 'Unassigned unit'} · ${documentData?.tenant?.fullName || 'Unnamed tenant'}`,
    missing,
    percent: Math.round((complete / REQUIRED_RECORD_FIELDS.length) * 100),
    status: missing.length ? 'incomplete' : 'ready',
  };
};

const ValidationDashboardPage = () => {
  const { goToPage } = useAppNavigation();
  const documentData = useSelector((state) => state.document);
  const archiveEntries = useSelector((state) => state.archive?.entries || []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const records = useMemo(() => {
    const active = evaluateActiveRecord(documentData);
    const archived = archiveEntries.map((entry, index) => ({
      id: entry.id || `archive-${index}`,
      kind: 'archive',
      label: entry.fileName || entry.template || entry.recordPath || 'Archived artifact',
      detail: entry.recordPath || entry.persisted || '',
      percent: entry.persisted === false ? 0 : 100,
      status: entry.persisted === false ? 'incomplete' : 'archived',
      missing: entry.persisted === false ? [{ label: 'Durable file persistence', path: 'persisted' }] : [],
    }));
    return [active, ...archived];
  }, [archiveEntries, documentData]);

  const filtered = records.filter((record) => {
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesQuery = record.label.toLowerCase().includes(query.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <main className="workflow-page shell-page" id="main" tabIndex={-1}>
      <section className="workflow-page__header">
        <div className="workflow-page__header-copy">
          <h2>Validation Dashboard</h2>
          <p>Find incomplete active records and verify persisted output artifacts.</p>
        </div>
        <div className="workflow-page__header-actions">
          <Button variant="secondary" onClick={() => goToPage(APP_PAGES.TENANCY_BUILDER)}>
            Open Tenancy Builder
          </Button>
        </div>
      </section>

      <Card variant="outlined">
        <Card.Body>
          <div className="tenancy-form-grid">
            <div>
              <label htmlFor="validation-status-filter">Status</label>
              <Select
                id="validation-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                options={[
                  { value: 'all', label: `All (${records.length})` },
                  { value: 'incomplete', label: 'Incomplete' },
                  { value: 'ready', label: 'Ready' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
            <div>
              <label htmlFor="validation-record-search">Search records</label>
              <Input
                id="validation-record-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Unit, tenant, or file"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <section className="validation-dashboard-grid" aria-label="Validation records">
        {filtered.length ? (
          filtered.map((record) => (
            <Card variant="outlined" key={record.id}>
              <Card.Header>
                <h3>{record.label}</h3>
                <Badge tone={record.status === 'incomplete' ? 'warning' : 'success'}>{record.status}</Badge>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Completion:</strong> {record.percent}%
                </p>
                {record.detail ? <p>{record.detail}</p> : null}
                {record.missing.length ? (
                  <ul>
                    {record.missing.map((item) => (
                      <li key={item.path}>{item.label}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No validation gaps detected.</p>
                )}
              </Card.Body>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="✅"
            title="No matching records"
            description="Adjust the status or search filter."
          />
        )}
      </section>
    </main>
  );
};

export default ValidationDashboardPage;
