import * as React from 'react';
import { useFocusVisible } from '../../hooks';
import { Divider } from '../Divider';
import { Icon } from '../Icon';
import './Dropdown.scss';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  error?: boolean;
  errorMessage?: string;
  message?: string;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  className?: string;
  name?: string;
  id?: string;
  onChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  'aria-label'?: string;
}

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (
    {
      label,
      options,
      value,
      defaultValue,
      error = false,
      errorMessage,
      message,
      disabled = false,
      startIcon,
      className,
      name,
      id,
      onChange,
      onOpenChange,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const currentValue = isControlled ? value : internalValue;
    const isFilled = currentValue !== '';

    const [isOpen, setIsOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [keyboardActive, setKeyboardActive] = React.useState(false);
    const [openAbove, setOpenAbove] = React.useState(false);

    const rootRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const listboxRef = React.useRef<HTMLUListElement>(null);

    const { isFocusVisible, focusVisibleProps } = useFocusVisible();

    const generatedId = React.useId();
    const resolvedId = id ?? generatedId;
    const listboxId = `${resolvedId}-listbox`;

    const selectedOption = options.find((opt) => opt.value === currentValue);

    const enabledIndices = React.useMemo(
      () => options.reduce<number[]>((acc, opt, i) => {
        if (!opt.disabled) acc.push(i);
        return acc;
      }, []),
      [options],
    );

    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref],
    );

    const open = React.useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      onOpenChange?.(true);
    }, [disabled, onOpenChange]);

    const close = React.useCallback(() => {
      setIsOpen(false);
      setActiveIndex(-1);
      setKeyboardActive(false);
      onOpenChange?.(false);
    }, [onOpenChange]);

    const selectOption = React.useCallback(
      (optionValue: string) => {
        if (!isControlled) {
          setInternalValue(optionValue);
        }
        onChange?.(optionValue);
        close();
        triggerRef.current?.focus();
      },
      [isControlled, onChange, close],
    );

    // Smart positioning
    React.useEffect(() => {
      if (!isOpen || !triggerRef.current) return;

      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const listboxHeight = 240;
      setOpenAbove(spaceBelow < listboxHeight && rect.top > listboxHeight);
    }, [isOpen]);

    // Click outside
    React.useEffect(() => {
      if (!isOpen) return;

      const handleMouseDown = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          close();
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [isOpen, close]);

    // Scroll active item into view
    React.useEffect(() => {
      if (!isOpen || activeIndex < 0) return;

      const item = document.getElementById(`${listboxId}-option-${activeIndex}`);
      item?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, activeIndex, listboxId]);

    const getNextEnabledIndex = (current: number, direction: 1 | -1): number => {
      if (enabledIndices.length === 0) return -1;
      if (current === -1) {
        return direction === 1 ? enabledIndices[0] : enabledIndices[enabledIndices.length - 1];
      }
      const currentPos = enabledIndices.indexOf(current);
      const nextPos = currentPos + direction;
      if (nextPos < 0 || nextPos >= enabledIndices.length) return current;
      return enabledIndices[nextPos];
    };

    const handleTriggerClick = () => {
      if (disabled) return;
      if (isOpen) {
        close();
      } else {
        open();
      }
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case ' ':
        case 'Enter': {
          e.preventDefault();
          if (isOpen) {
            if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
              selectOption(options[activeIndex].value);
            } else {
              close();
            }
          } else {
            open();
            setKeyboardActive(true);
            const selectedIdx = options.findIndex((o) => o.value === currentValue);
            const startIdx = selectedIdx >= 0 && !options[selectedIdx].disabled
              ? selectedIdx
              : enabledIndices[0] ?? -1;
            setActiveIndex(startIdx);
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          setKeyboardActive(true);
          if (!isOpen) {
            open();
            const selectedIdx = options.findIndex((o) => o.value === currentValue);
            setActiveIndex(
              selectedIdx >= 0 && !options[selectedIdx].disabled
                ? selectedIdx
                : enabledIndices[0] ?? -1,
            );
          } else {
            setActiveIndex((prev) => getNextEnabledIndex(prev, 1));
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setKeyboardActive(true);
          if (!isOpen) {
            open();
            setActiveIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
          } else {
            setActiveIndex((prev) => getNextEnabledIndex(prev, -1));
          }
          break;
        }
        case 'Home': {
          if (isOpen) {
            e.preventDefault();
            setKeyboardActive(true);
            setActiveIndex(enabledIndices[0] ?? -1);
          }
          break;
        }
        case 'End': {
          if (isOpen) {
            e.preventDefault();
            setKeyboardActive(true);
            setActiveIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
          }
          break;
        }
        case 'Escape': {
          if (isOpen) {
            e.preventDefault();
            close();
          }
          break;
        }
        case 'Tab': {
          if (isOpen) {
            close();
          }
          break;
        }
      }
    };

    const handleItemClick = (option: DropdownOption) => {
      if (option.disabled) return;
      selectOption(option.value);
    };

    const rootClassNames = [
      'affirm-dropdown',
      isFilled && 'affirm-dropdown--filled',
      isOpen && 'affirm-dropdown--open',
      error && 'affirm-dropdown--error',
      disabled && 'affirm-dropdown--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const listboxClassNames = [
      'affirm-listbox',
      openAbove && 'affirm-listbox--above',
    ]
      .filter(Boolean)
      .join(' ');

    const showErrorMessage = error && errorMessage;
    const showMessage = !error && message;

    const activeDescendantId =
      isOpen && keyboardActive && activeIndex >= 0
        ? `${listboxId}-option-${activeIndex}`
        : undefined;

    return (
      <div ref={rootRef} className={rootClassNames}>
        <button
          ref={setRef}
          type="button"
          className="affirm-dropdown__input"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          aria-invalid={error || undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          data-focus-visible={isFocusVisible || undefined}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          onFocus={focusVisibleProps.onFocus}
          onBlur={focusVisibleProps.onBlur}
        >
          {startIcon && (
            <span className="affirm-dropdown__icon-start">{startIcon}</span>
          )}
          <span className="affirm-dropdown__field-wrapper">
            <span className="affirm-dropdown__label">{label}</span>
            <span className="affirm-dropdown__value">
              {selectedOption?.label}
            </span>
          </span>
          <span className="affirm-dropdown__indicator">
            <Icon name="chevron-down" />
          </span>
        </button>

        {showErrorMessage && (
          <p className="affirm-dropdown__error-message" role="alert">
            {errorMessage}
          </p>
        )}
        {showMessage && (
          <p className="affirm-dropdown__message">{message}</p>
        )}

        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            className={listboxClassNames}
            role="listbox"
            aria-label={ariaLabel ?? label}
            onMouseMove={() => {
              if (keyboardActive) setKeyboardActive(false);
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isActive = keyboardActive && index === activeIndex;

              const itemClassNames = [
                'affirm-listbox__item',
                isSelected && 'affirm-listbox__item--selected',
                option.disabled && 'affirm-listbox__item--disabled',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <React.Fragment key={option.value}>
                  {index > 0 && (
                    <li role="presentation" className="affirm-listbox__divider">
                      <Divider />
                    </li>
                  )}
                  <li
                    id={`${listboxId}-option-${index}`}
                    className={itemClassNames}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    data-active={isActive || undefined}
                    onClick={() => handleItemClick(option)}
                  >
                    {option.icon && (
                      <span className="affirm-listbox__item-icon">
                        {option.icon}
                      </span>
                    )}
                    <span className="affirm-listbox__item-label">
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="affirm-listbox__item-selected-icon">
                        <Icon name="checkmark-small" />
                      </span>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        )}

        {name && (
          <input type="hidden" name={name} value={currentValue} />
        )}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
