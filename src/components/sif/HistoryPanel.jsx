import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectGenerationHistory, clearHistory } from '../../store/payrollSlice';

/**
 * HistoryPanel
 * Displays list of previously generated SIF files
 * Shows: Filename, date, employee count, total amount, download buttons
 */
export default function HistoryPanel() {
  const dispatch = useDispatch();
  const history = useSelector(selectGenerationHistory);

  const handleClearHistory = () => {
    if (confirm('Clear all generation history?')) {
      dispatch(clearHistory());
    }
  };

  if (history.length === 0) {
    return (
      <section className="sif-section sif-history-section">
        <div className="sif-section__header">
          <h3 className="sif-section__title">📜 Generation History</h3>
        </div>
        <div className="sif-history-empty">
          <p>No files generated yet</p>
          <p className="sif-hint">Generated SIF files will appear here</p>
        </div>
      </section>
    );
  }

  return (
    <section className="sif-section sif-history-section">
      <div className="sif-section__header">
        <h3 className="sif-section__title">📜 Generation History</h3>
        <span className="sif-badge">{history.length}</span>
        <button
          type="button"
          className="sif-btn sif-btn--text sif-btn--danger"
          onClick={handleClearHistory}
          title="Clear all history"
        >
          Clear All
        </button>
      </div>

      <div className="sif-history-list">
        {history.map((record) => (
          <div key={record.id} className="sif-history-item">
            <div className="sif-history-item__main">
              <div className="sif-history-filename">📄 {record.sifFilename}</div>
              <div className="sif-history-meta">
                <span className="sif-history-date">{new Date(record.generatedAt).toLocaleString()}</span>
                <span className="sif-history-count">
                  👥 {record.employeeCount} employee{record.employeeCount !== 1 ? 's' : ''}
                </span>
                <span className="sif-history-amount">💰 AED {record.totalSalary.toFixed(2)}</span>
              </div>
            </div>
            <div className="sif-history-actions">
              <button
                type="button"
                className="sif-btn sif-btn--sm sif-btn--secondary"
                title="Download again"
                disabled
              >
                ⬇ Re-download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sif-hint">ℹ️ {history.length} of 50 maximum records shown</div>
    </section>
  );
}
