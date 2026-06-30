import * as React from 'react';
import './Type.scss';

type HeadlineVariant =
  | 'headline.xxlarge'
  | 'headline.xlarge'
  | 'headline.large'
  | 'headline.medium'
  | 'headline.small';

type BodyVariant =
  | 'body.xlarge'
  | 'body.large'
  | 'body.medium'
  | 'body.small';

type BodyHighImpVariant =
  | 'body.xlarge.highImp'
  | 'body.large.highImp'
  | 'body.medium.highImp'
  | 'body.small.highImp';

type BodySupportStrikeVariant =
  | 'body.support.xlarge.strike'
  | 'body.support.large.strike'
  | 'body.support.medium.strike'
  | 'body.support.small.strike';

export type TypeVariant =
  | HeadlineVariant
  | BodyVariant
  | BodyHighImpVariant
  | BodySupportStrikeVariant;

export type TypeColor =
  | 'text.primary'
  | 'text.primary.brand'
  | 'text.primary.inverse'
  | 'text.primary.on_dark.static'
  | 'text.primary.on_light.static'
  | 'text.secondary'
  | 'text.secondary.brand'
  | 'text.secondary.inverse'
  | 'text.link'
  | 'text.link.inverse'
  | 'text.link.on_dark.static'
  | 'text.link.on_light.static'
  | 'text.critical'
  | 'text.info'
  | 'text.success'
  | 'text.warning';

type TypeElement =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'label' | 'div';

export interface TypeProps {
  variant: TypeVariant;
  color?: TypeColor;
  /** @deprecated Use a `body.support.*.strike` variant instead. */
  strikethrough?: boolean;
  as?: TypeElement;
  className?: string;
  children?: React.ReactNode;
}

const defaultElementMap: Partial<Record<TypeVariant, TypeElement>> = {
  'headline.xxlarge': 'h1',
  'headline.xlarge': 'h1',
  'headline.large': 'h2',
  'headline.medium': 'h3',
  'headline.small': 'h4',
};

function toKebab(dotPath: string): string {
  return dotPath.replace(/[._]/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export const Type = React.forwardRef<HTMLElement, TypeProps>(
  (
    {
      variant,
      color = 'text.primary',
      strikethrough = false,
      as,
      className,
      children,
    },
    ref,
  ) => {
    const Tag = as ?? defaultElementMap[variant] ?? 'p';

    const variantClass = `affirm-type--${toKebab(variant)}`;
    const classNames = [
      'affirm-type',
      variantClass,
      strikethrough && 'affirm-type--strikethrough',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const style = {
      '--affirm-type-color': `var(--affirm-color-${toKebab(color)})`,
    } as React.CSSProperties;

    return (
      <Tag ref={ref as React.Ref<never>} className={classNames} style={style}>
        {children}
      </Tag>
    );
  },
);

Type.displayName = 'Type';
