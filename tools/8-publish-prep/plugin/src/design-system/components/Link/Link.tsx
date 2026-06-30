import * as React from 'react';
import './Link.scss';

export type LinkSize = 'large' | 'medium' | 'small';

type LinkElement = 'a' | 'button' | 'span';

export interface LinkProps extends React.HTMLAttributes<HTMLElement> {
  size?: LinkSize;
  externalLink?: boolean;
  disabled?: boolean;
  as?: LinkElement;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  className?: string;
  children?: React.ReactNode;
}

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11 3H17V9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 3L9 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 11V16C14 16.5523 13.5523 17 13 17H4C3.44772 17 3 16.5523 3 16V7C3 6.44772 3.44772 6 4 6H9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Link = React.forwardRef<HTMLElement, LinkProps>(
  (
    {
      size = 'medium',
      externalLink = false,
      disabled = false,
      as,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const Tag = as ?? 'a';

    const classNames = [
      'affirm-link',
      `affirm-link--${size}`,
      disabled && 'affirm-link--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={classNames}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...rest}
      >
        <span className="affirm-link__container">
          <span className="affirm-link__text">{children}</span>
          {externalLink && <ExternalLinkIcon className="affirm-link__icon" />}
        </span>
      </Tag>
    );
  },
);

Link.displayName = 'Link';
