import * as React from 'react';
import { useFocusVisible } from '../../hooks';
import './InputTextArea.scss';

export interface InputTextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'defaultValue' | 'value'> {
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

export const InputTextArea = React.forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const rootClassNames = [
      'affirm-input-text-area',
      isFilled && 'affirm-input-text-area--filled',
      error && 'affirm-input-text-area--error',
      disabled && 'affirm-input-text-area--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const showErrorMessage = error && errorMessage;
    const showMessage = !error && message;

    return (
      <div className={rootClassNames}>
        <label className="affirm-input-text-area__input" htmlFor={resolvedId}>
          {startIcon && (
            <span className="affirm-input-text-area__icon-start">{startIcon}</span>
          )}
          <div className="affirm-input-text-area__field-wrapper">
            <span className="affirm-input-text-area__label">
              {label}
            </span>
            <textarea
              ref={ref}
              id={resolvedId}
              className="affirm-input-text-area__field"
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
            <span className="affirm-input-text-area__icon-end">{endIcon}</span>
          )}
        </label>
        {showErrorMessage && (
          <p className="affirm-input-text-area__error-message" role="alert">
            {errorMessage}
          </p>
        )}
        {showMessage && (
          <p className="affirm-input-text-area__message">{message}</p>
        )}
      </div>
    );
  },
);

InputTextArea.displayName = 'InputTextArea';
