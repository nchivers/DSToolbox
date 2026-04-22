import * as React from 'react';
import { useFocusVisible } from '../../hooks';
import './InputText.scss';

export interface InputTextProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'value'> {
  label: string;
  value?: string;
  defaultValue?: string;
  error?: boolean;
  errorMessage?: string;
  message?: string;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
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
      className,
      onFocus,
      onBlur,
      onChange,
      id,
      ...rest
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
      'affirm-input-text',
      isFilled && 'affirm-input-text--filled',
      error && 'affirm-input-text--error',
      disabled && 'affirm-input-text--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const showErrorMessage = error && errorMessage;
    const showMessage = !error && message;

    return (
      <div className={rootClassNames}>
        <label className="affirm-input-text__input" htmlFor={resolvedId}>
          {startIcon && (
            <span className="affirm-input-text__icon-start">{startIcon}</span>
          )}
          <div className="affirm-input-text__field-wrapper">
            <span className="affirm-input-text__label">
              {label}
            </span>
            <input
              ref={ref}
              id={resolvedId}
              className="affirm-input-text__field"
              type="text"
              value={isControlled ? value : undefined}
              defaultValue={!isControlled ? defaultValue : undefined}
              disabled={disabled}
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
              {...rest}
            />
          </div>
          {endIcon && (
            <span className="affirm-input-text__icon-end">{endIcon}</span>
          )}
        </label>
        {showErrorMessage && (
          <p className="affirm-input-text__error-message" role="alert">
            {errorMessage}
          </p>
        )}
        {showMessage && (
          <p className="affirm-input-text__message">{message}</p>
        )}
      </div>
    );
  },
);

InputText.displayName = 'InputText';
