import React, { forwardRef } from 'react';
import clsx from './clsx';
import { useFormField } from './FormField';

/**
 * Textarea — styled native <textarea>. Same FormField context wiring as Input.
 */
const Textarea = forwardRef(function Textarea({ rows = 4, className, id, size = 'md', ...rest }, ref) {
  const ctx = useFormField();
  const resolvedId = id || ctx?.id;
  const describedBy = rest['aria-describedby'] || ctx?.describedBy;
  const invalid = rest['aria-invalid'] ?? ctx?.invalid;
  const required = rest.required ?? ctx?.required;

  const { 'aria-describedby': _ad, 'aria-invalid': _ai, required: _req, ...textRest } = rest;

  return (
    <textarea
      ref={ref}
      id={resolvedId}
      rows={rows}
      className={clsx('ui-textarea', className)}
      data-size={size}
      data-invalid={invalid ? 'true' : undefined}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      required={required}
      {...textRest}
    />
  );
});

export default Textarea;
