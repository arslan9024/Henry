import React, { forwardRef } from 'react';
import clsx from './clsx';
import { useFormField } from './FormField';

/**
 * Input — styled native <input>. 16px font on mobile via CSS to prevent
 * iOS Safari auto-zoom. Optional prefix/suffix slots (icons, units, etc.).
 *
 * If wrapped in a <FormField>, automatically inherits id / aria-describedby /
 * aria-invalid / required from context.
 */
const Input = forwardRef(function Input(
  { prefix, suffix, size = 'md', className, id, type = 'text', ...rest },
  ref,
) {
  const ctx = useFormField();
  const resolvedId = id || ctx?.id;
  const describedBy = rest['aria-describedby'] || ctx?.describedBy;
  const invalid = rest['aria-invalid'] ?? ctx?.invalid;
  const required = rest.required ?? ctx?.required;

  // Strip context-derived props from rest so we don't pass them twice
  const { 'aria-describedby': _ad, 'aria-invalid': _ai, required: _req, ...inputRest } = rest;

  const inputEl = (
    <input
      ref={ref}
      id={resolvedId}
      type={type}
      className={clsx('ui-input', !prefix && !suffix && className)}
      data-size={size}
      data-invalid={invalid ? 'true' : undefined}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      required={required}
      {...inputRest}
    />
  );

  if (!prefix && !suffix) return inputEl;

  return (
    <div
      className={clsx('ui-input-wrap', className)}
      data-size={size}
      data-invalid={invalid ? 'true' : undefined}
    >
      {prefix && (
        <span className="ui-input-wrap__affix" aria-hidden="true">
          {prefix}
        </span>
      )}
      {inputEl}
      {suffix && (
        <span className="ui-input-wrap__affix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </div>
  );
});

export default Input;
