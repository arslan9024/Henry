import React from 'react';
import { Badge, Button, FormField, Input, Select, Textarea } from '../ui';

const PlacementActionPanel = ({
  exportMode,
  exportModeOptions,
  onExportModeChange,
  sharePhone,
  onSharePhoneChange,
  shareMessage,
  onShareMessageChange,
  onDownload,
  onSave,
  onQueueWhatsApp,
  isBusy = false,
  mappingReadyCount = 0,
  mappingTotal = 0,
  contractReady = false,
  addendumReady = false,
  landlordReady = false,
  tenantReady = false,
}) => {
  return (
    <div className="placement-action-panel tenancy-form-stack">
      <div className="tenancy-template-meta">
        <p>
          <strong>Final action readiness:</strong>
        </p>
        <div className="tenancy-gate-actions">
          <Badge tone={landlordReady ? 'success' : 'warning'}>
            {landlordReady ? 'Landlord gate ready' : 'Landlord gate blocked'}
          </Badge>
          <Badge tone={tenantReady ? 'success' : 'warning'}>
            {tenantReady ? 'Tenant gate ready' : 'Tenant gate blocked'}
          </Badge>
          <Badge tone={contractReady ? 'success' : 'warning'}>
            {contractReady ? 'Contract ready' : 'Contract incomplete'}
          </Badge>
          <Badge tone={addendumReady ? 'success' : 'info'}>
            {addendumReady ? 'Addendum ready' : 'Addendum optional/incomplete'}
          </Badge>
          <Badge tone={mappingReadyCount === mappingTotal ? 'success' : 'warning'}>
            Mapping {mappingReadyCount}/{mappingTotal}
          </Badge>
        </div>
      </div>

      <FormField label="Output mode">
        <Select
          value={exportMode}
          onChange={(e) => onExportModeChange(e.target.value)}
          options={exportModeOptions}
        />
      </FormField>

      <div className="tenancy-gate-actions">
        <Button variant="secondary" onClick={onSave} disabled={isBusy}>
          {isBusy ? 'Processing…' : 'Save final package'}
        </Button>
        <Button variant="primary" onClick={onDownload} disabled={isBusy}>
          {isBusy ? 'Processing…' : 'Download PDF package'}
        </Button>
      </div>

      <FormField label="WhatsApp share phone">
        <Input
          value={sharePhone}
          onChange={(e) => onSharePhoneChange(e.target.value)}
          placeholder="+971 5X XXX XXXX"
        />
      </FormField>

      <FormField label="WhatsApp share message">
        <Textarea
          value={shareMessage}
          onChange={(e) => onShareMessageChange(e.target.value)}
          placeholder="Please find attached your tenancy contract package."
          rows={3}
        />
      </FormField>

      <Button variant="ghost" onClick={onQueueWhatsApp} disabled={isBusy || !sharePhone.trim()}>
        {isBusy ? 'Processing…' : 'Queue WhatsApp share'}
      </Button>

      <p className="tenancy-builder-note">
        WhatsApp share currently queues the selected package for asynchronous delivery and audit tracking.
      </p>
    </div>
  );
};

export default PlacementActionPanel;
