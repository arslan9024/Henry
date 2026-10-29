/**
 * [Category 1: View]
 * ChequeScheduleTable - Reusable schedule data table for cheques & installments (< 45 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';

export const ChequeScheduleTable = ({ schedule }) => {
  return (
    <table className="cheque-schedule-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Cheque Maturity Date</th>
          <th>Installment Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((c) => (
          <tr key={c.index}>
            <td>
              <strong>{c.index}</strong>
            </td>
            <td className="cheque-schedule-table__date">{c.date}</td>
            <td className="cheque-schedule-table__amount">{c.amountFormatted}</td>
            <td className="cheque-schedule-table__memo">{c.memo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

ChequeScheduleTable.propTypes = {
  schedule: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ChequeScheduleTable;
