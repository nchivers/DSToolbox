import * as React from 'react';
import './Badge.scss';

export type BadgeCategory =
  | 'default'
  | 'brand-primary'
  | 'brand-secondary'
  | 'brand-featured'
  | 'brand-tertiary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export type BadgeContext = 'default' | 'static' | 'inverse' | 'inverse-static';

export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  category?: BadgeCategory;
  context?: BadgeContext;
  size?: BadgeSize;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  children: React.ReactNode;
  className?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      category = 'default',
      context = 'default',
      size = 'medium',
      icon,
      iconPosition = 'start',
      children,
      className,
    },
    ref,
  ) => {
    const classNames = [
      'affirm-badge',
      `affirm-badge--${category}`,
      `affirm-badge--${size}`,
      (context === 'inverse' || context === 'inverse-static') &&
        'affirm-badge--inverse',
      (context === 'static' || context === 'inverse-static') &&
        'affirm-badge--static',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconElement = icon ? (
      <span className="affirm-badge__icon">{icon}</span>
    ) : null;

    return (
      <div ref={ref} className={classNames}>
        {iconPosition === 'start' && iconElement}
        <span className="affirm-badge__text">{children}</span>
        {iconPosition === 'end' && iconElement}
      </div>
    );
  },
);

Badge.displayName = 'Badge';
