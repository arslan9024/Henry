import React, { useId } from 'react';
import clsx from './clsx';

/**
 * RadioGroup — accessible radio group.
 *
 * Renders a <fieldset role="radiogroup"> with optional <legend>, then one
 * <label><input type="radio"></label> per option. Native radios mean free
 * arrow-key navigation between options inside the same `name`.
 *
 * Props:
 *   name       string                       required (radio group must share a name)
 *   options    [{value,label,description?,disabled?}]   required
 *   value      string                       controlled active value
 *   defaultValue? string                    uncontrolled active value
 *   onChange?(value)
 *   legend?    ReactNode                    visible group label
 *   orientation 'vertical'|'horizontal' (default 'vertical')
 *   size       'sm'|'md' (default 'md')
 */
export default function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  legend,
  orientation = 'vertical',
  size = 'md',
  className,
  ...rest
}) {
  const reactId = useId();
  const isControlled = value !== undefined;

  return (
    <fieldset
      className={clsx('ui-radiogroup', className)}
      data-orientation={orientation}
      data-size={size}
      {...rest}
    >
      {legend && <legend className="ui-radiogroup__legend">{legend}</legend>}
      <div className="ui-radiogroup__list">
        {options.map((opt) => {
          const inputId = `${reactId}-${opt.value}`;
          const checkedProp = isControlled
            ? { checked: value === opt.value }
            : { defaultChecked: defaultValue === opt.value };
          return (
            <label key={opt.value} htmlFor={inputId} className="ui-radio">
              <input
                id={inputId}
                type="radio"
                name={name}
                value={opt.value}
                disabled={opt.disabled}
                onChange={(e) => onChange?.(e.target.value)}
                className="ui-radio__input"
                {...checkedProp}
              />
              <span className="ui-radio__dot" aria-hidden="true" />
              <span className="ui-radio__text">
                <span className="ui-radio__label">{opt.label}</span>
                {opt.description && <span className="ui-radio__desc">{opt.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
