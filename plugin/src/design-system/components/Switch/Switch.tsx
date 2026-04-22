import * as React from 'react';
import './Switch.scss';
import { Icon } from '../Icon';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  error?: boolean;
  hideLabel?: boolean;
  label: React.ReactNode;
  labelPosition?: 'end' | 'start';
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    { checked, defaultChecked, disabled = false, error = false, hideLabel = false, label, labelPosition = 'end', name, onChange },
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
      'affirm-switch',
      isChecked && 'affirm-switch--selected',
      disabled && 'affirm-switch--disabled',
      error && 'affirm-switch--error',
      labelPosition === 'start' && 'affirm-switch--inverted',
    ]
      .filter(Boolean)
      .join(' ');

    const labelClassNames = [
      'affirm-switch__label',
      hideLabel && 'affirm-switch__label--hidden',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classNames}>
        <input
          ref={ref}
          className="affirm-switch__input"
          type="checkbox"
          role="switch"
          name={name}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          aria-checked={isChecked}
          onChange={handleChange}
        />
        <span className="affirm-switch__track">
          <span className="affirm-switch__icon">
            <Icon
              name={isChecked ? 'checkmark-small' : 'close-small'}
              className="affirm-switch__icon"
            />
          </span>
          <span className="affirm-switch__handle" />
        </span>
        <span className={labelClassNames}>{label}</span>
      </label>
    );
  },
);

Switch.displayName = 'Switch';
