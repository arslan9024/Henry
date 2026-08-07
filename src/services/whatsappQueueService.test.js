import { beforeEach, describe, expect, it, vi } from 'vitest';

const { persistRecordFileMock } = vi.hoisted(() => ({
  persistRecordFileMock: vi.fn(),
}));

vi.mock('../records/archiveService', () => ({
  persistRecordFile: persistRecordFileMock,
}));

import { loadWhatsAppQueue, queueWhatsAppSharePackage } from './whatsappQueueService';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistRecordFileMock.mockResolvedValue({ ok: true, path: '/records/mock/file.pdf' });
});

describe('whatsappQueueService', () => {
  it('loadWhatsAppQueue returns [] when storage is empty', () => {
    expect(loadWhatsAppQueue()).toEqual([]);
  });

  it('returns missing-phone when phone is absent', async () => {
    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    await expect(
      queueWhatsAppSharePackage({ phone: '', blob, fileName: 'contract.pdf' }),
    ).resolves.toMatchObject({ ok: false, reason: 'missing-phone' });
  });

  it('queues manifest locally and persists file + manifest', async () => {
    const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });

    const result = await queueWhatsAppSharePackage({
      phone: '+971528643118',
      blob,
      fileName: 'contract.pdf',
      messageTemplate: 'Please review your contract.',
      caseContext: { unit: 'Unit 131', tenantName: 'Mahmoud Bashar Mufty' },
    });

    expect(result.ok).toBe(true);
    expect(result.queueId).toMatch(/^wa-/);

    const queue = loadWhatsAppQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      phone: '+971528643118',
      fileName: 'contract.pdf',
      status: 'queued',
    });

    expect(persistRecordFileMock).toHaveBeenCalledTimes(2);
    expect(persistRecordFileMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        fileName: 'contract.pdf',
      }),
    );
    expect(persistRecordFileMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        fileName: 'queue-manifest.json',
      }),
    );
  });
});
