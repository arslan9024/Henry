import React from 'react';
import { Badge, Card } from '../ui';

const display = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return '—';
  return String(value);
};

const FieldDiffPanel = ({ title = 'Field Changes', rows = [] }) => {
  const changedRows = rows.filter((row) => row.changed);

  return (
    <Card variant="outlined" className="field-diff-panel">
      <Card.Header>
        <h4>{title}</h4>
        <Badge tone={changedRows.length ? 'warning' : 'success'}>
          {changedRows.length ? `${changedRows.length} change(s)` : 'No changes'}
        </Badge>
      </Card.Header>
      <Card.Body>
        <div className="field-diff-panel__table" role="table" aria-label={title}>
          <div className="field-diff-panel__row field-diff-panel__row--head" role="row">
            <span role="columnheader">Field</span>
            <span role="columnheader">Current</span>
            <span role="columnheader">New</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.key}
              className={`field-diff-panel__row ${row.changed ? 'is-changed' : ''}`}
              role="row"
            >
              <span role="cell">{row.label}</span>
              <span role="cell">{display(row.currentValue)}</span>
              <span role="cell">{display(row.nextValue)}</span>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default FieldDiffPanel;
