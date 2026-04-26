import React, { forwardRef } from 'react';
import clsx from './clsx';
import { useFormField } from './FormField';

/**
 * Select — styled native <select>. Native is the right call for v1: free a11y,
 * free mobile native picker, free keyboard handling. We just style the chrome.
 *
 * Pass either children (<option>...</option>) or `options=[{value,label,disabled}]`.
 */
const Select = forwardRef(function Select(
  { options, placeholder, className, id, size = 'md', children, ...rest },
  ref,
) {
  const ctx = useFormField();
  const resolvedId = id || ctx?.id;
  const describedBy = rest['aria-describedby'] || ctx?.describedBy;
  const invalid = rest['aria-invalid'] ?? ctx?.invalid;
  const required = rest.required ?? ctx?.required;

  const { 'aria-describedby': _ad, 'aria-invalid': _ai, required: _req, ...selectRest } = rest;

  return (
    <span
      className={clsx('ui-select-wrap', className)}
      data-size={size}
      data-invalid={invalid ? 'true' : undefined}
    >
      <select
        ref={ref}
        id={resolvedId}
        className="ui-select"
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        required={required}
        {...selectRest}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <span className="ui-select-wrap__chevron" aria-hidden="true">
        ▾
      </span>
    </span>
  );
});

export default Select;
