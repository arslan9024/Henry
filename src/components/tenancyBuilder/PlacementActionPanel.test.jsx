import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlacementActionPanel from './PlacementActionPanel';

const baseProps = {
  exportMode: 'separate',
  exportModeOptions: [
    { value: 'separate', label: 'Separate files' },
    { value: 'merged', label: 'Merged file' },
  ],
  onExportModeChange: vi.fn(),
  sharePhone: '+971528643118',
  onSharePhoneChange: vi.fn(),
  shareMessage: 'Please find attached your tenancy contract package.',
  onShareMessageChange: vi.fn(),
  onDownload: vi.fn(),
  onSave: vi.fn(),
  onQueueWhatsApp: vi.fn(),
  isBusy: false,
  mappingReadyCount: 12,
  mappingTotal: 12,
  contractReady: true,
  addendumReady: true,
  landlordReady: true,
  tenantReady: true,
  canFinalize: true,
  finalizationBlockers: [],
  sharePhoneValid: true,
  sharePhoneValidationText: 'Phone format looks valid for queueing.',
};

describe('PlacementActionPanel', () => {
  it('disables save/download and queue actions when finalization is blocked', () => {
    render(
      <PlacementActionPanel
        {...baseProps}
        canFinalize={false}
        sharePhoneValid={false}
        finalizationBlockers={['Landlord gate is incomplete.']}
      />,
    );

    expect(screen.getByText(/finalize blocked until these are resolved/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save final package/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /download pdf package/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /queue whatsapp share/i })).toBeDisabled();
  });

  it('enables all final actions when gates are ready and phone is valid', () => {
    render(<PlacementActionPanel {...baseProps} />);

    expect(screen.getByText(/all required gates are ready for final actions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save final package/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /download pdf package/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /queue whatsapp share/i })).toBeEnabled();
  });
});
