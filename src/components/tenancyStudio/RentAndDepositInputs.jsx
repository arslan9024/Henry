/**
 * [Category 1: View]
 * RentAndDepositInputs - Annual rent, security deposit, Ejari and Chiller policies (< 55 lines, 0 inline CSS).
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EJARI_PAYERS, CHILLER_POLICIES } from '../../config/tenancyOptionsConfig';

export const RentAndDepositInputs = ({ annualRent, securityDeposit, onChange }) => {
  return (
    <>
      <div className="studio-field-group">
        <label className="studio-field-label">Annual Rent (AED)</label>
        <input
          type="text"
          className="studio-input"
          value={annualRent || ''}
          onChange={(e) => onChange('annual_rent', e.target.value)}
          placeholder="e.g. 120,000"
        />
      </div>
      <div className="studio-field-group">
        <label className="studio-field-label">Security Deposit (AED)</label>
        <input
          type="text"
          className="studio-input"
          value={securityDeposit || ''}
          onChange={(e) => onChange('security_deposit', e.target.value)}
          placeholder="e.g. 6,000"
        />
      </div>
      <div className="studio-field-group">
        <label className="studio-field-label">Ejari Registration Fee</label>
        <select className="studio-select" defaultValue={EJARI_PAYERS[0]}>
          {EJARI_PAYERS.map((ep) => (
            <option key={ep} value={ep}>
              {ep}
            </option>
          ))}
        </select>
      </div>
      <div className="studio-field-group studio-field-group--full">
        <label className="studio-field-label">AC / Chiller Responsibility</label>
        <select className="studio-select" defaultValue={CHILLER_POLICIES[0]}>
          {CHILLER_POLICIES.map((cp) => (
            <option key={cp} value={cp}>
              {cp}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

RentAndDepositInputs.propTypes = {
  annualRent: PropTypes.string,
  securityDeposit: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default RentAndDepositInputs;
