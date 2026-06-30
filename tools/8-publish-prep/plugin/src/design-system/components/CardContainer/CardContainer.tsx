import * as React from 'react';
import './CardContainer.scss';

export type CardContainerPlacement = 'on-page' | 'on-surface' | 'inset';
export type CardContainerBackgroundColor = 'primary' | 'secondary' | 'tertiary';
export type CardContainerElement = 'div' | 'section' | 'article';

export interface CardContainerProps {
  placement?: CardContainerPlacement;
  backgroundColor?: CardContainerBackgroundColor;
  as?: CardContainerElement;
  children?: React.ReactNode;
  className?: string;
}

export const CardContainer = React.forwardRef<HTMLElement, CardContainerProps>(
  (
    {
      placement = 'on-page',
      backgroundColor = 'primary',
      as: Element = 'div',
      children,
      className,
    },
    ref,
  ) => {
    const classNames = [
      'affirm-card-container',
      `affirm-card-container--${placement}`,
      `affirm-card-container--${backgroundColor}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Element ref={ref as React.Ref<HTMLDivElement>} className={classNames}>
        {children}
      </Element>
    );
  },
);

CardContainer.displayName = 'CardContainer';
