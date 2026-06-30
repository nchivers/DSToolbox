import * as React from 'react';
import { useFocusVisible } from '../../hooks';
import './InputNumber.scss';

export interface InputNumberProps {
  label: string;
  value?: string;
  defaultValue?: string;
  error?: boolean;
  errorMessage?: string;
  message?: string;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  name?: string;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      label,
      value,
      defaultValue,
      error = false,
      errorMessage,
      message,
      disabled = false,
      startIcon,
      endIcon,
      min,
      max,
      step,
      className,
      name,
      id,
      onChange,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const { isFocusVisible, focusVisibleProps } = useFocusVisible();
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const currentValue = isControlled ? value : internalValue;
    const isFilled = currentValue.length > 0;

    const inputId = React.useId();
    const resolvedId = id ?? inputId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const rootClassNames = [
      'affirm-input-number',
      isFilled && 'affirm-input-number--filled',
      error && 'affirm-input-number--error',
      disabled && 'affirm-input-number--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const showErrorMessage = error && errorMessage;
    const showMessage = !error && message;

    return (
      <div className={rootClassNames}>
        <label className="affirm-input-number__input" htmlFor={resolvedId}>
          {startIcon && (
            <span className="affirm-input-number__icon-start">{startIcon}</span>
          )}
          <div className="affirm-input-number__field-wrapper">
            <span className="affirm-input-number__label">
              {label}
            </span>
            <input
              ref={ref}
              id={resolvedId}
              className="affirm-input-number__field"
              type="number"
              value={isControlled ? value : undefined}
              defaultValue={!isControlled ? defaultValue : undefined}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
              name={name}
              onChange={handleChange}
              onFocus={(e) => {
                focusVisibleProps.onFocus();
                onFocus?.(e);
              }}
              onBlur={(e) => {
                focusVisibleProps.onBlur();
                onBlur?.(e);
              }}
              aria-invalid={error || undefined}
              data-focus-visible={isFocusVisible || undefined}
            />
          </div>
          {endIcon && (
            <span className="affirm-input-number__icon-end">{endIcon}</span>
          )}
        </label>
        {showErrorMessage && (
          <p className="affirm-input-number__error-message" role="alert">
            {errorMessage}
          </p>
        )}
        {showMessage && (
          <p className="affirm-input-number__message">{message}</p>
        )}
      </div>
    );
  },
);

InputNumber.displayName = 'InputNumber';
