import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectArchiveEntriesForCurrentUnit } from '../store/selectors';
import { addAuditLog } from '../store/auditSlice';
import Disclosure from './Disclosure';
import { EmptyState } from './ui';

const monthKey = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
};

const ArchiveHistorySidebar = () => {
  const dispatch = useDispatch();
  const entries = useSelector(selectArchiveEntriesForCurrentUnit);
  const [downloadingId, setDownloadingId] = useState('');

  const handleDownload = async (entry) => {
    try {
      setDownloadingId(entry.id);
      const { downloadQuotationPdf } = await import('../pdf/generateQuotationPdf');
      await downloadQuotationPdf({
        documentData: entry.documentSnapshot,
        templateKey: entry.templateKey,
      });
      dispatch(
        addAuditLog({
          type: 'ARCHIVE_RECORDED',
          template: entry.templateKey,
          timestamp: new Date().toISOString(),
          fileName: entry.fileName,
          recordPath: entry.recordPath,
        }),
      );
    } finally {
      setDownloadingId('');
    }
  };

  // Sort by createdAt desc, then bucket by month label.
  const grouped = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const buckets = new Map();
    sorted.forEach((entry) => {
      const key = monthKey(entry.createdAt);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(entry);
    });
    return Array.from(buckets.entries()); // [[label, entries[]], ...]
  }, [entries]);

  const currentMonth = monthKey(new Date().toISOString());

  return (
    <aside className="archive-panel print-hidden" aria-label="Archive history sidebar">
      <h3>Archive History</h3>
      <p className="policy-meta">Quotations for the active unit/property.</p>

      {entries.length === 0 ? (
        <EmptyState
          icon="🗂"
          title="No archived quotations yet"
          description="Generated PDFs for the active unit will be filed here automatically."
        />
      ) : null}

      {grouped.map(([label, items]) => (
        <Disclosure
          key={label}
          title={label}
          icon="🗂"
          badge={items.length}
          defaultOpen={label === currentMonth}
        >
          <div className="archive-list">
            {items.map((entry) => (
              <article className="archive-item" key={entry.id}>
                <p className="archive-item__title">{entry.fileName}</p>
                <p className="archive-item__meta">{entry.templateLabel}</p>
                <p className="archive-item__meta">Tenant: {entry.tenantName}</p>
                <p className="archive-item__meta">Stored path: {entry.recordPath}</p>
                <p className="archive-item__meta">Created: {new Date(entry.createdAt).toLocaleString()}</p>
                <button
                  className="utility-btn"
                  type="button"
                  onClick={() => handleDownload(entry)}
                  disabled={downloadingId === entry.id}
                >
                  {downloadingId === entry.id ? 'Preparing…' : 'Download Again'}
                </button>
              </article>
            ))}
          </div>
        </Disclosure>
      ))}
    </aside>
  );
};

export default React.memo(ArchiveHistorySidebar);
