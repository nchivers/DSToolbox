import * as React from 'react';
import './Radio.scss';

export interface RadioProps {
  label: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  value?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    { label, checked, defaultChecked, disabled = false, error = false, name, value, className, onChange },
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
      'affirm-radio',
      isChecked && 'affirm-radio--selected',
      disabled && 'affirm-radio--disabled',
      error && 'affirm-radio--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classNames}>
        <input
          ref={ref}
          className="affirm-radio__input"
          type="radio"
          name={name}
          value={value}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          onChange={handleChange}
        />
        <div className="affirm-radio__inner-container">
          <span className="affirm-radio__indicator">
            <span className="affirm-radio__dot" />
          </span>
          <span className="affirm-radio__label">{label}</span>
        </div>
      </label>
    );
  },
);

Radio.displayName = 'Radio';
