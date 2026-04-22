import * as React from 'react';
import './PageFooter.scss';
import { Type } from '../Type';
import { Link } from '../Link';

export interface PageFooterProps {
  builderName: string;
  builderSlack?: string;
  updatedDate: string;
  className?: string;
}

export const PageFooter = React.forwardRef<HTMLElement, PageFooterProps>(
  ({ builderName, builderSlack, updatedDate, className }, ref) => {
    const classNames = ['affirm-page-footer', className]
      .filter(Boolean)
      .join(' ');

    return (
      <footer ref={ref} className={classNames}>
        <Type variant="body.small" color="text.secondary" as="span">
          Built by{' '}
          {builderSlack ? (
            <Link href={builderSlack} size="small">
              {"@" + builderName}
            </Link>
          ) : (
            builderName
          )}
          {' '}for Affirm • Updated: {updatedDate}
        </Type>
      </footer>
    );
  },
);

PageFooter.displayName = 'PageFooter';
