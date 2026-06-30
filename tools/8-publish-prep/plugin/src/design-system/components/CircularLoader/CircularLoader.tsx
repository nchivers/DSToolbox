import * as React from 'react';
import './CircularLoader.scss';

export interface CircularLoaderProps {
  colorBorder?: 'default' | 'default-inverse';
  size?: 'large' | 'small';
  className?: string;
}

export const CircularLoader = React.forwardRef<HTMLDivElement, CircularLoaderProps>(
  ({ colorBorder = 'default', size = 'large', className }, ref) => {
    const classNames = [
      'affirm-circular-loader',
      size === 'small' && 'affirm-circular-loader--small',
      colorBorder === 'default-inverse' && 'affirm-circular-loader--inverse',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} role="status" aria-label="Loading">
        <svg className="affirm-circular-loader__spinner" viewBox="0 0 100 100">
          <path
            className="affirm-circular-loader__arc"
            d="M 50 5 A 45 45 0 1 1 5 50"
          />
        </svg>
      </div>
    );
  },
);

CircularLoader.displayName = 'CircularLoader';
