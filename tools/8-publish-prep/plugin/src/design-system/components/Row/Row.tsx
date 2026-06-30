import * as React from 'react';
import './Row.scss';
import { Type } from '../Type';

export type RowTitleWeight = 'default' | 'high-impact';
export type RowTitleColor = 'default' | 'accent-red';
export type RowLeadingGraphicSize = 'medium' | 'large';
export type RowSubtextColor = 'default' | 'supplementary' | 'accent-green' | 'accent-red' | 'brand-indigo';
export type RowSubtextWeight = 'default' | 'high-impact';
export type RowSubtextOrientation = 'horizontal' | 'vertical';

export interface RowSubtextSegment {
  text: string;
  icon?: React.ReactNode;
  color?: RowSubtextColor;
  weight?: RowSubtextWeight;
}

export interface RowProps {
  standAlone?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  leadingGraphic?: React.ReactNode;
  leadingGraphicSize?: RowLeadingGraphicSize;
  title?: string;
  titleWeight?: RowTitleWeight;
  titleColor?: RowTitleColor;
  subtitle?: RowSubtextSegment[] | React.ReactNode;
  subtitleOrientation?: RowSubtextOrientation;
  swapMainContent?: React.ReactNode;
  contentRight?: React.ReactNode;
  trailingElement?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  'aria-label'?: string;
}

function getTypeVariant(weight: RowTitleWeight, size: 'large' | 'medium' | 'small'): string {
  if (weight === 'high-impact') {
    return `body.${size}.highImp`;
  }
  return `body.${size}`;
}

function getSubtextTypeColor(color: RowSubtextColor): string {
  switch (color) {
    case 'default':
      return 'text.primary';
    case 'supplementary':
      return 'text.secondary';
    case 'accent-green':
      return 'text.success';
    case 'accent-red':
      return 'text.critical';
    case 'brand-indigo':
      return 'text.link';
  }
}

function getTitleTypeColor(color: RowTitleColor): string {
  switch (color) {
    case 'default':
      return 'text.primary';
    case 'accent-red':
      return 'text.critical';
  }
}

function isSubtextSegmentArray(
  value: RowSubtextSegment[] | React.ReactNode,
): value is RowSubtextSegment[] {
  return Array.isArray(value) && value.length > 0 && typeof (value[0] as RowSubtextSegment).text === 'string';
}

export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  (
    {
      standAlone = false,
      interactive = false,
      disabled = false,
      leadingGraphic,
      leadingGraphicSize = 'medium',
      title,
      titleWeight = 'default',
      titleColor = 'default',
      subtitle,
      subtitleOrientation = 'horizontal',
      swapMainContent,
      contentRight,
      trailingElement,
      className,
      onClick,
      'aria-label': ariaLabel,
    },
    ref,
  ) => {
    const classNames = [
      'affirm-row',
      standAlone && 'affirm-row--stand-alone',
      interactive && 'affirm-row--interactive',
      disabled && 'affirm-row--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const leadingGraphicClassNames = [
      'affirm-row__leading-graphic',
      leadingGraphicSize === 'large' && 'affirm-row__leading-graphic--large',
    ]
      .filter(Boolean)
      .join(' ');

    const subtitleClassNames = [
      'affirm-row__subtitle',
      subtitleOrientation === 'vertical' && 'affirm-row__subtitle--vertical',
    ]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive || disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(e);
    };

    const renderSubtitle = () => {
      if (!subtitle) return null;

      if (isSubtextSegmentArray(subtitle)) {
        return (
          <div className={subtitleClassNames}>
            {subtitle.map((segment, i) => (
              <span key={i} className="affirm-row__subtitle-segment">
                {segment.icon && (
                  <span className="affirm-row__subtitle-segment-icon">
                    {segment.icon}
                  </span>
                )}
                <Type
                  variant={getTypeVariant(segment.weight || 'default', 'small') as any}
                  color={getSubtextTypeColor(segment.color || 'supplementary') as any}
                  as="span"
                >
                  {segment.text}
                </Type>
              </span>
            ))}
          </div>
        );
      }

      return <div className={subtitleClassNames}>{subtitle}</div>;
    };

    const renderMainContent = () => {
      if (swapMainContent) return swapMainContent;

      return (
        <div className="affirm-row__text-container">
          {title && (
            <Type
              variant={getTypeVariant(titleWeight, 'large') as any}
              color={getTitleTypeColor(titleColor) as any}
              as="span"
              className="affirm-row__title"
            >
              {title}
            </Type>
          )}
          {renderSubtitle()}
        </div>
      );
    };

    const interactiveProps = interactive
      ? {
          role: 'button' as const,
          tabIndex: disabled ? -1 : 0,
          onKeyDown: handleKeyDown,
          'aria-disabled': disabled || undefined,
        }
      : {};

    return (
      <div
        ref={ref}
        className={classNames}
        onClick={interactive ? handleClick : undefined}
        aria-label={ariaLabel}
        {...interactiveProps}
      >
        <div className="affirm-row__content-left">
          {leadingGraphic && (
            <div className={leadingGraphicClassNames}>
              {leadingGraphic}
            </div>
          )}
          {renderMainContent()}
        </div>

        {(contentRight || trailingElement) && (
          <div className="affirm-row__content-right">
            {contentRight}
            {trailingElement && (
              <div className="affirm-row__trailing-element">
                {trailingElement}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

Row.displayName = 'Row';
