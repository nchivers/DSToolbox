import * as React from 'react';
import './Divider.scss';

export type DividerVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'primary-inverse'
  | 'secondary-inverse'
  | 'tertiary-inverse';

export interface DividerProps {
  variant?: DividerVariant;
  className?: string;
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ variant = 'primary', className }, ref) => {
    const classNames = [
      'affirm-divider',
      variant !== 'primary' && `affirm-divider--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <hr ref={ref} className={classNames} />;
  },
);

Divider.displayName = 'Divider';
