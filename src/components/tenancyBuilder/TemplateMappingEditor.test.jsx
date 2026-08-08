import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TemplateMappingEditor from './TemplateMappingEditor';

const mocks = vi.hoisted(() => ({
  fetchRecordFile: vi.fn(),
  inspectFillablePdfFields: vi.fn(),
}));

vi.mock('../../records/archiveService', () => ({
  fetchRecordFile: mocks.fetchRecordFile,
}));

vi.mock('../../pdf/templatePdfService', () => ({
  inspectFillablePdfFields: mocks.inspectFillablePdfFields,
}));

const fields = [
  {
    id: 'tenant-name',
    path: 'tenant.fullName',
    labelEn: 'Tenant name',
    labelAr: 'اسم المستأجر',
  },
];

const renderEditor = (props = {}) =>
  render(
    <TemplateMappingEditor
      template={{
        id: 'copy-1',
        kind: 'working-copy',
        mode: 'static',
        sourcePersistedPath: '/records/template.pdf',
        ...props.template,
      }}
      fields={fields}
      onSave={props.onSave || vi.fn()}
      onNotify={props.onNotify || vi.fn()}
    />,
  );

describe('TemplateMappingEditor', () => {
  beforeEach(() => {
    mocks.fetchRecordFile.mockReset();
    mocks.inspectFillablePdfFields.mockReset();
    mocks.fetchRecordFile.mockResolvedValue({ ok: false, reason: 'offline' });
  });

  it('edits and saves static coordinate mappings on a working copy', () => {
    const onSave = vi.fn();
    renderEditor({ onSave });

    expect(screen.getByRole('heading', { name: /static coordinate mapping editor/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('X'), { target: { value: '125' } });
    fireEvent.click(screen.getByRole('button', { name: /save mapping profile/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'static',
        mappings: [expect.objectContaining({ path: 'tenant.fullName', x: 125 })],
      }),
    );
  });

  it('keeps master mappings read-only', () => {
    renderEditor({ template: { kind: 'master' } });
    expect(screen.getByText(/master template is read-only/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save mapping profile/i })).toBeDisabled();
  });

  it('detects fields and saves fillable mappings', async () => {
    const onSave = vi.fn();
    mocks.fetchRecordFile.mockResolvedValue({ ok: true, blob: new Blob(['pdf']) });
    mocks.inspectFillablePdfFields.mockResolvedValue([{ name: 'tenant_name', type: 'PDFTextField' }]);
    renderEditor({ template: { mode: 'fillable' }, onSave });

    fireEvent.click(screen.getByRole('button', { name: /detect acroform fields/i }));
    await waitFor(() => expect(screen.getByRole('option', { name: /tenant_name/i })).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('PDF field'), { target: { value: 'tenant_name' } });
    fireEvent.click(screen.getByRole('button', { name: /save mapping profile/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'fillable',
        mappings: [expect.objectContaining({ pdfFieldName: 'tenant_name' })],
      }),
    );
  });
});
