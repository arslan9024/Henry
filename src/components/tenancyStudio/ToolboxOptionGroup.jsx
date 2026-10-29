/**
 * [Category 1: View]
 * White Caves Real Estate - Studio Toolbox Option Radio Group
 * Reusable single-purpose radio option group (< 50 lines).
 */

import React from 'react';

export const ToolboxOptionGroup = ({ title, name, options, currentValue, onSelect }) => {
  return (
    <div>
      <label className="toolbox-group__label">{title}</label>
      <div className="toolbox-group__options">
        {Object.values(options).map((opt) => {
          const isSelected = currentValue === opt.id;
          return (
            <label key={opt.id} className={`toolbox-option-card ${isSelected ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name={name}
                value={opt.id}
                checked={isSelected}
                onChange={() => onSelect(opt.id)}
                className="toolbox-option-radio"
              />
              <div>
                <div className="toolbox-option-title">{opt.name}</div>
                <div className="toolbox-option-desc">{opt.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default ToolboxOptionGroup;
