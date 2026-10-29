/**
 * [Category 1: View]
 * White Caves Real Estate - Contract Comparison Diff Table
 * Clean single-purpose presentation component (< 75 lines, zero inline CSS).
 */

import React from 'react';

export const ContractDiffTable = ({ diffRows, selectedFields, onToggleField }) => {
  return (
    <div className="diff-modal__body">
      <table className="diff-modal__table">
        <thead>
          <tr>
            <th className="diff-modal__th">Apply</th>
            <th className="diff-modal__th">Field Parameter</th>
            <th className="diff-modal__th">Previous Term</th>
            <th className="diff-modal__th">Renewed Term</th>
            <th className="diff-modal__th">Status</th>
          </tr>
        </thead>
        <tbody>
          {diffRows.map((r) => {
            const isSelected = selectedFields.includes(r.key);
            return (
              <tr key={r.key} className={`diff-modal__tr ${isSelected ? 'is-selected' : ''}`}>
                <td className="diff-modal__td diff-modal__td-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleField(r.key)}
                    aria-label={`Select ${r.field}`}
                  />
                </td>
                <td className="diff-modal__td-bold">{r.field}</td>
                <td className="diff-modal__td-muted">{r.oldVal}</td>
                <td className="diff-modal__td-green">{r.newVal}</td>
                <td className="diff-modal__td">
                  <span className={`diff-modal__badge ${r.type === 'renewal' ? 'is-renewal' : 'is-same'}`}>
                    {r.badge}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(ContractDiffTable);
