import React, { forwardRef } from 'react';
import clsx from './clsx';
import { useFormField } from './FormField';

/**
 * Checkbox — styled native <input type="checkbox"> with a custom box and
 * inline label. Uses the native control underneath so a11y, keyboard, and
 * forms all "just work".
 *
 * Props:
 *   label        ReactNode  inline text/markup to the right of the box
 *   description? ReactNode  optional helper line under the label
 *   indeterminate? boolean  shows the mixed-state visual + sets DOM property
 *   size         'sm'|'md' (default 'md')
 *
 * Wires into FormField context like Input/Textarea/Select for id +
 * aria-describedby + aria-invalid + required.
 */
const Checkbox = forwardRef(function Checkbox(
  { label, description, indeterminate = false, size = 'md', className, id, ...rest },
  ref,
) {
  const ctx = useFormField();
  const resolvedId = id || ctx?.id;
  const describedBy = rest['aria-describedby'] || ctx?.describedBy;
  const invalid = rest['aria-invalid'] ?? ctx?.invalid;
  const required = rest.required ?? ctx?.required;

  const { 'aria-describedby': _ad, 'aria-invalid': _ai, required: _req, ...inputRest } = rest;

  // Compose ref: own callback to set indeterminate + caller-supplied ref
  const setRef = (node) => {
    if (node) node.indeterminate = Boolean(indeterminate);
    if (typeof ref === 'function') ref(node);
    else if (ref && typeof ref === 'object') ref.current = node;
  };

  return (
    <label
      className={clsx('ui-checkbox', className)}
      data-size={size}
      data-invalid={invalid ? 'true' : undefined}
    >
      <input
        ref={setRef}
        id={resolvedId}
        type="checkbox"
        className="ui-checkbox__input"
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        required={required}
        {...inputRest}
      />
      <span className="ui-checkbox__box" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="ui-checkbox__check">
          {indeterminate ? <line x1="3" y1="8" x2="13" y2="8" /> : <polyline points="3,8 7,12 13,4" />}
        </svg>
      </span>
      {(label || description) && (
        <span className="ui-checkbox__text">
          {label && <span className="ui-checkbox__label">{label}</span>}
          {description && <span className="ui-checkbox__desc">{description}</span>}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
