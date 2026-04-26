import React, { createContext, useContext, useId, useMemo } from 'react';
import clsx from './clsx';

/**
 * FormFieldContext — silently shared between FormField and the Input/Textarea/Select
 * primitives so callers don't have to manually wire `id` / `aria-describedby` /
 * `aria-invalid`. The control reads this context and self-applies the right ARIA.
 *
 * If the context is null (control rendered outside a FormField, e.g. in a
 * compact toolbar), the control falls back to its own props.
 */
export const FormFieldContext = createContext(null);

export function useFormField() {
  return useContext(FormFieldContext);
}

/**
 * FormField — label + control + hint + error wrapper.
 *
 * Generates stable IDs (via React 18's useId), wires aria-describedby to the
 * hint and error elements, and flips aria-invalid on the contained control.
 *
 * Usage:
 *   <FormField label="Email" hint="We never share." error={errors.email} required>
 *     <Input type="email" value={…} onChange={…} />
 *   </FormField>
 */
export default function FormField({
  label,
  hint,
  error,
  required = false,
  children,
  className,
  id: idProp,
  ...rest
}) {
  const reactId = useId();
  const id = idProp || `ff-${reactId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const ctx = useMemo(
    () => ({
      id,
      describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined,
      invalid: Boolean(error),
      required,
    }),
    [id, hintId, errorId, error, required],
  );

  return (
    <div className={clsx('ui-field', className)} data-invalid={error ? 'true' : undefined} {...rest}>
      {label && (
        <label className="ui-field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="ui-field__required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <FormFieldContext.Provider value={ctx}>{children}</FormFieldContext.Provider>
      {hint && !error && (
        <p className="ui-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="ui-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
