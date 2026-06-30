import * as React from 'react';
import './SectionHeader.scss';
import { Type } from '../Type';
import { Button } from '../Button';

export interface SectionHeaderProps {
  title: string;
  body?: string;
  actionLabel?: string;
  onActionClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, body, actionLabel, onActionClick, className }, ref) => {
    const classNames = ['affirm-section-header', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames}>
        <div className="affirm-section-header__header">
          <Type variant="headline.small" className="affirm-section-header__title" as="h2">
            {title}
          </Type>
          {actionLabel && (
            <div className="affirm-section-header__action">
              <Button
                emphasis="tertiary"
                size="medium"
                label={actionLabel}
                iconPosition="end"
                icon="chevron-right"
                onClick={onActionClick}
              />
            </div>
          )}
        </div>
        {body && (
          <Type variant="body.large" color="text.primary" className="affirm-section-header__body">
            {body}
          </Type>
        )}
      </div>
    );
  },
);

SectionHeader.displayName = 'SectionHeader';
