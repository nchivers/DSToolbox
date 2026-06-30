import * as React from 'react';
import './Chip.scss';
import { Icon } from '../Icon';

export type ChipSize = 'small' | 'medium' | 'large';

export interface ChipProps {
  label: string;
  size?: ChipSize;
  swapIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      label,
      size = 'medium',
      swapIcon,
      disabled = false,
      className,
      onClick,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const classNames = [
      'affirm-chip',
      `affirm-chip--${size}`,
      disabled && 'affirm-chip--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        <span className="affirm-chip__container">
          {swapIcon != null && (
            <span className="affirm-chip__icon">{swapIcon}</span>
          )}
          <span className="affirm-chip__label">{label}</span>
          <span className="affirm-chip__indicator">
            <Icon name="chevron-right" />
          </span>
        </span>
      </button>
    );
  },
);

Chip.displayName = 'Chip';
