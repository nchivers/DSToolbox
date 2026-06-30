import * as React from 'react';
import './Checkbox.scss';
import { Icon } from '../Icon';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  error?: boolean;
  label: React.ReactNode;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { checked, defaultChecked, disabled = false, error = false, label, name, onChange },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const classNames = [
      'affirm-checkbox',
      isChecked && 'affirm-checkbox--selected',
      disabled && 'affirm-checkbox--disabled',
      error && 'affirm-checkbox--error',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classNames}>
        <div className="affirm-checkbox__inner-container">
          <input
            ref={ref}
            className="affirm-checkbox__input"
            type="checkbox"
            name={name}
            checked={isControlled ? checked : undefined}
            defaultChecked={!isControlled ? defaultChecked : undefined}
            disabled={disabled}
            onChange={handleChange}
          />
          <span className="affirm-checkbox__indicator">
            {isChecked ? <Icon name="checkmark-small" className="affirm-checkbox__indicator-icon" /> : null}
          </span>
          <span className="affirm-checkbox__label">{label}</span>
        </div>
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
