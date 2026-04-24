import * as React from 'react';
import './Tabs.scss';

export type TabsAlignment = 'left' | 'center';

export interface TabProps {
  label: string;
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface TabsProps {
  alignment?: TabsAlignment;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  'aria-label'?: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = () => null;
Tab.displayName = 'Tab';

function getTabChildren(children: React.ReactNode): React.ReactElement<TabProps>[] {
  const tabs: React.ReactElement<TabProps>[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Tab) {
      tabs.push(child as React.ReactElement<TabProps>);
    }
  });
  return tabs;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      alignment = 'left',
      value,
      defaultValue,
      disabled = false,
      onChange,
      className,
      'aria-label': ariaLabel,
      children,
    },
    ref,
  ) => {
    const tabs = getTabChildren(children);
    const firstValue = tabs.length > 0 ? tabs[0].props.value : '';

    const [internalValue, setInternalValue] = React.useState(
      defaultValue ?? firstValue,
    );
    const isControlled = value !== undefined;
    const activeValue = isControlled ? value : internalValue;

    const idPrefix = React.useId();

    const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

    const handleSelect = (tabValue: string) => {
      if (disabled) return;
      const tab = tabs.find((t) => t.props.value === tabValue);
      if (tab?.props.disabled) return;

      if (!isControlled) {
        setInternalValue(tabValue);
      }
      onChange?.(tabValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const enabledTabs = tabs.filter(
        (t) => !t.props.disabled && !disabled,
      );
      if (enabledTabs.length === 0) return;

      const currentIndex = enabledTabs.findIndex(
        (t) => t.props.value === activeValue,
      );

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % enabledTabs.length;
          break;
        case 'ArrowLeft':
          nextIndex =
            (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = enabledTabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const nextTab = enabledTabs[nextIndex];
      handleSelect(nextTab.props.value);
      tabRefs.current.get(nextTab.props.value)?.focus();
    };

    const activeTab = tabs.find((t) => t.props.value === activeValue);

    const rootClassNames = [
      'affirm-tabs',
      alignment === 'center' && 'affirm-tabs--center',
      disabled && 'affirm-tabs--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={rootClassNames}>
        <div
          className="affirm-tabs__tablist"
          role="tablist"
          aria-label={ariaLabel}
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab) => {
            const isSelected = tab.props.value === activeValue;
            const isTabDisabled = disabled || !!tab.props.disabled;
            const tabId = `${idPrefix}-tab-${tab.props.value}`;
            const panelId = `${idPrefix}-panel-${tab.props.value}`;

            const tabClassNames = [
              'affirm-tabs__tab',
              isSelected && 'affirm-tabs__tab--selected',
              isTabDisabled && 'affirm-tabs__tab--disabled',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={tab.props.value}
                ref={(el) => {
                  if (el) {
                    tabRefs.current.set(tab.props.value, el);
                  } else {
                    tabRefs.current.delete(tab.props.value);
                  }
                }}
                id={tabId}
                className={tabClassNames}
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId}
                tabIndex={isSelected ? 0 : -1}
                disabled={isTabDisabled}
                onClick={() => handleSelect(tab.props.value)}
              >
                <span className="affirm-tabs__content">
                  <span className="affirm-tabs__label">
                    {tab.props.label}
                  </span>
                </span>
                <span className="affirm-tabs__indicator" />
              </button>
            );
          })}
        </div>
        {activeTab && (
          <div
            id={`${idPrefix}-panel-${activeTab.props.value}`}
            className="affirm-tabs__panel"
            role="tabpanel"
            aria-labelledby={`${idPrefix}-tab-${activeTab.props.value}`}
            tabIndex={0}
          >
            {activeTab.props.children}
          </div>
        )}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
