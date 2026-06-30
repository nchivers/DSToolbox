import * as React from 'react';
import './ListOfRows.scss';
import { Divider } from '../Divider';

export type ListOfRowsTreatment =
  | 'contained-aio'
  | 'contained-individual'
  | 'uncontained-divided'
  | 'uncontained-undivided';

export interface ListOfRowsProps {
  treatment?: ListOfRowsTreatment;
  children: React.ReactNode;
  className?: string;
}

export const ListOfRows = React.forwardRef<HTMLDivElement, ListOfRowsProps>(
  ({ treatment = 'contained-aio', children, className }, ref) => {
    const classNames = [
      'affirm-list-of-rows',
      treatment !== 'contained-aio' && `affirm-list-of-rows--${treatment}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const showDividers =
      treatment === 'contained-aio' || treatment === 'uncontained-divided';

    const items = React.Children.toArray(children);

    return (
      <div ref={ref} className={classNames} role="list">
        {items.map((child, index) => (
          <React.Fragment key={index}>
            <div className="affirm-list-of-rows__item" role="listitem">
              {child}
            </div>
            {showDividers && index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    );
  },
);

ListOfRows.displayName = 'ListOfRows';
