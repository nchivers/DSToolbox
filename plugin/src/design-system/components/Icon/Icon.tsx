import * as React from 'react';
import './Icon.scss';

export type IconName = 'checkmark-small' | 'chevron-down' | 'close-small' | 'levels';

export type IconColor =
  | 'icon.primary'
  | 'icon.primary.brand'
  | 'icon.primary.brand.on_dark.static'
  | 'icon.primary.brand.on_light.static'
  | 'icon.primary.inverse'
  | 'icon.primary.on_dark.static'
  | 'icon.primary.on_light.static'
  | 'icon.secondary'
  | 'icon.secondary.brand'
  | 'icon.secondary.inverse'
  | 'icon.link'
  | 'icon.link.inverse'
  | 'icon.link.on_dark.static'
  | 'icon.link.on_light.static'
  | 'icon.critical'
  | 'icon.info'
  | 'icon.success'
  | 'icon.warning';

export interface IconProps {
  name: IconName;
  color?: IconColor;
  className?: string;
}

interface IconDef {
  viewBox: string;
  path: React.ReactNode;
}

const icons: Record<IconName, IconDef> = {
  'checkmark-small': {
    viewBox: '0 0 20 20',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5473 6.83094C13.8018 7.06418 13.8189 7.45954 13.5857 7.71399L9.00237 12.714C8.88718 12.8397 8.72565 12.9128 8.55522 12.9165C8.38479 12.9202 8.22025 12.8541 8.0997 12.7336L6.01637 10.6503C5.77229 10.4062 5.77229 10.0105 6.01637 9.76639C6.26045 9.52231 6.65618 9.52231 6.90025 9.76639L8.52201 11.3881L12.6643 6.86933C12.8975 6.61488 13.2929 6.59769 13.5473 6.83094Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    path: (
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  'close-small': {
    viewBox: '0 0 20 20',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.46967 6.46967C6.76256 6.17678 7.23744 6.17678 7.53033 6.46967L10 8.93934L12.4697 6.46967C12.7626 6.17678 13.2374 6.17678 13.5303 6.46967C13.8232 6.76256 13.8232 7.23744 13.5303 7.53033L11.0607 10L13.5303 12.4697C13.8232 12.7626 13.8232 13.2374 13.5303 13.5303C13.2374 13.8232 12.7626 13.8232 12.4697 13.5303L10 11.0607L7.53033 13.5303C7.23744 13.8232 6.76256 13.8232 6.46967 13.5303C6.17678 13.2374 6.17678 12.7626 6.46967 12.4697L8.93934 10L6.46967 7.53033C6.17678 7.23744 6.17678 6.76256 6.46967 6.46967Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
  "levels": {
    viewBox: '0 0 20 20',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.79169 1.66666C4.79169 1.32148 4.51186 1.04166 4.16669 1.04166C3.82151 1.04166 3.54169 1.32148 3.54169 1.66666L3.54169 3.60417C2.11529 3.89371 1.04169 5.15481 1.04169 6.66666C1.04169 8.39255 2.4408 9.79166 4.16669 9.79166C5.89258 9.79166 7.29169 8.39255 7.29169 6.66666C7.29169 5.15481 6.21809 3.89371 4.79169 3.60417V1.66666ZM4.16669 4.79166C3.13115 4.79166 2.29169 5.63112 2.29169 6.66666C2.29169 7.70219 3.13115 8.54166 4.16669 8.54166C5.20222 8.54166 6.04169 7.70219 6.04169 6.66666C6.04169 5.63112 5.20222 4.79166 4.16669 4.79166ZM15.8334 1.04166C16.1785 1.04166 16.4584 1.32148 16.4584 1.66666V3.60417C17.8848 3.89371 18.9584 5.15481 18.9584 6.66666C18.9584 8.39255 17.5592 9.79166 15.8334 9.79166C14.1075 9.79166 12.7084 8.39255 12.7084 6.66666C12.7084 5.15481 13.782 3.89371 15.2084 3.60417V1.66666C15.2084 1.32148 15.4882 1.04166 15.8334 1.04166ZM13.9584 6.66666C13.9584 5.63112 14.7978 4.79166 15.8334 4.79166C16.8689 4.79166 17.7084 5.63112 17.7084 6.66666C17.7084 7.70219 16.8689 8.54166 15.8334 8.54166C14.7978 8.54166 13.9584 7.70219 13.9584 6.66666ZM10.625 16.3958C12.0514 16.1063 13.125 14.8452 13.125 13.3333C13.125 11.6074 11.7259 10.2083 10 10.2083C8.27413 10.2083 6.87502 11.6074 6.87502 13.3333C6.87502 14.8452 7.94862 16.1063 9.37502 16.3958L9.37502 18.3333C9.37502 18.6785 9.65484 18.9583 10 18.9583C10.3452 18.9583 10.625 18.6785 10.625 18.3333L10.625 16.3958ZM10 15.2083C8.96449 15.2083 8.12502 14.3689 8.12502 13.3333C8.12502 12.2978 8.96449 11.4583 10 11.4583C11.0356 11.4583 11.875 12.2978 11.875 13.3333C11.875 14.3689 11.0356 15.2083 10 15.2083ZM15.8334 11.0417C16.1785 11.0417 16.4584 11.3215 16.4584 11.6667L16.4584 18.3333C16.4584 18.6785 16.1785 18.9583 15.8334 18.9583C15.4882 18.9583 15.2084 18.6785 15.2084 18.3333L15.2084 11.6667C15.2084 11.3215 15.4882 11.0417 15.8334 11.0417ZM10.625 1.66666C10.625 1.32148 10.3452 1.04166 10 1.04166C9.65484 1.04166 9.37502 1.32148 9.37502 1.66666L9.37502 8.33332C9.37502 8.6785 9.65484 8.95832 10 8.95832C10.3452 8.95832 10.625 8.6785 10.625 8.33332L10.625 1.66666ZM4.16669 11.0417C4.51186 11.0417 4.79169 11.3215 4.79169 11.6667L4.79169 18.3333C4.79169 18.6785 4.51187 18.9583 4.16669 18.9583C3.82151 18.9583 3.54169 18.6785 3.54169 18.3333L3.54169 11.6667C3.54169 11.3215 3.82151 11.0417 4.16669 11.0417Z"
        fill="currentColor"
        stroke="none"
      />
    ),
  },
};

const iconNames: ReadonlySet<string> = new Set(Object.keys(icons));

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && iconNames.has(value);
}

function toKebab(dotPath: string): string {
  return dotPath.replace(/[._]/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, color = 'icon.primary', className }, ref) => {
    const icon = icons[name];

    const classNames = ['affirm-icon', className].filter(Boolean).join(' ');

    const style = {
      '--affirm-icon-color': `var(--affirm-color-${toKebab(color)})`,
    } as React.CSSProperties;

    return (
      <svg
        ref={ref}
        className={classNames}
        style={style}
        viewBox={icon.viewBox}
        fill="none"
        stroke="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {icon.path}
      </svg>
    );
  },
);

Icon.displayName = 'Icon';
