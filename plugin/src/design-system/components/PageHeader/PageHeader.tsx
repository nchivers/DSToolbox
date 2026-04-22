import * as React from 'react';
import './PageHeader.scss';
import { Type } from '../Type';

export interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  actionPosition?: 'start' | 'end';
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(({ title, description, action, actionPosition = 'end' }, ref) => {
  return (
    <div ref={ref} className="affirm-page-header">
        {action && actionPosition === 'start' && <div className="affirm-page-header__start-action">{action}</div>}
        <Type variant="headline.medium" color="text.primary" as="h1">{title}</Type>
        <Type variant="body.large" color="text.primary">{description}</Type>
        {action && actionPosition === 'end' && <div className="affirm-page-header__end-action">{action}</div>}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';