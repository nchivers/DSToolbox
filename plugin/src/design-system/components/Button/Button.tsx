import * as React from 'react';
import './Button.scss';
import { Icon, isIconName } from '../Icon';
import type { IconName } from '../Icon';
import { CircularLoader } from '../CircularLoader';

export type ButtonEmphasis = 'primary' | 'secondary' | 'tertiary';

export type ButtonVariant =
  | 'default'
  | 'inverse'
  | 'neutral'
  | 'neutral-inverse'
  | 'static-dark'
  | 'static-light'
  | 'destructive'
  | 'destructive-inverse';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonIconPosition = 'none' | 'start' | 'end' | 'only';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  emphasis?: ButtonEmphasis;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode | IconName;
  iconPosition?: ButtonIconPosition;
  label: string;
  loading?: boolean;
}

/**
 * Maps emphasis + variant to the CSS modifier class and token path segment.
 *
 * Figma "Variant" prop  →  token segment
 * ───────────────────────────────────────
 * default               →  {emphasis}
 * inverse               →  {emphasis}-inverse
 * neutral               →  {emphasis}-neutral
 * neutral-inverse       →  {emphasis}-neutral-inverse
 * static-dark           →  {emphasis}-static
 * static-light          →  {emphasis}-inverse-static
 * destructive           →  {emphasis}-destructive
 * destructive-inverse   →  {emphasis}-destructive-inverse
 */
function getVariantModifier(
  emphasis: ButtonEmphasis,
  variant: ButtonVariant,
): string {
  switch (variant) {
    case 'default':
      return emphasis;
    case 'inverse':
      return `${emphasis}-inverse`;
    case 'neutral':
      return `${emphasis}-neutral`;
    case 'neutral-inverse':
      return `${emphasis}-neutral-inverse`;
    case 'static-dark':
      return `${emphasis}-static`;
    case 'static-light':
      return `${emphasis}-inverse-static`;
    case 'destructive':
      return `${emphasis}-destructive`;
    case 'destructive-inverse':
      return `${emphasis}-destructive-inverse`;
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      emphasis = 'primary',
      variant = 'default',
      size = 'medium',
      icon,
      iconPosition = 'none',
      label,
      loading = false,
      disabled = false,
      className,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const variantMod = getVariantModifier(emphasis, variant);
    const hasIcon = icon != null && iconPosition !== 'none';
    const isIconOnly = iconPosition === 'only';

    const classNames = [
      'affirm-button',
      `affirm-button--${variantMod}`,
      `affirm-button--${size}`,
      `affirm-button--emphasis-${emphasis}`,
      hasIcon && iconPosition === 'start' && 'affirm-button--icon-start',
      hasIcon && iconPosition === 'end' && 'affirm-button--icon-end',
      isIconOnly && 'affirm-button--icon-only',
      disabled && 'affirm-button--disabled',
      loading && 'affirm-button--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const renderIcon = () => {
      if (isIconName(icon)) {
        return <Icon name={icon} className="affirm-button__icon-svg" />;
      }
      return icon;
    };

    const loaderColor =
      variant === 'inverse' ||
      variant === 'static-light' ||
      variant === 'neutral-inverse'
        ? 'default-inverse'
        : 'default';

    return (
      <button
        ref={ref}
        className={classNames}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-label={isIconOnly ? label : undefined}
        {...rest}
      >
        {loading ? (
          <span className="affirm-button__loading-icon">
            <CircularLoader
              size="small"
              colorBorder={loaderColor}
            />
          </span>
        ) : (
          <>
            {hasIcon && (
              <span className="affirm-button__icon">{renderIcon()}</span>
            )}
            <span className="affirm-button__label">{label}</span>
            {isIconOnly && (
              <span className="affirm-button__tooltip" role="tooltip">
                {label}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
