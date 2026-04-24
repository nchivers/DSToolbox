# Tabs

A compound tab component that pairs a tab bar with content panels, switching the visible panel when a tab is selected.

## Import

```tsx
import { Tabs, Tab } from '../design-system/components';
```

## Props

### Tabs

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alignment` | `'left' \| 'center'` | `'left'` | Controls horizontal distribution of tabs. Left-aligned tabs are spaced apart; centered tabs stretch equally. |
| `value` | `string` | — | The `value` of the currently active tab (controlled mode). |
| `defaultValue` | `string` | — | The `value` of the initially active tab (uncontrolled mode). Defaults to the first tab if omitted. |
| `disabled` | `boolean` | `false` | Disables all tabs and prevents selection changes. |
| `onChange` | `(value: string) => void` | — | Called with the new tab's `value` when the user selects a different tab. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `aria-label` | `string` | — | Accessible label for the `tablist` landmark. |
| `children` | `ReactNode` | — | **Required.** One or more `<Tab>` elements. |

### Tab

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** The visible text shown in the tab button. |
| `value` | `string` | — | **Required.** Unique identifier used to match the active tab. |
| `disabled` | `boolean` | `false` | Disables this individual tab. |
| `children` | `ReactNode` | — | **Required.** Content to display in the panel when this tab is active. |

## Usage

### Basic (uncontrolled)

```tsx
<Tabs defaultValue="overview" aria-label="Project sections">
  <Tab label="Overview" value="overview">
    <p>Overview content goes here.</p>
  </Tab>
  <Tab label="Details" value="details">
    <p>Details content goes here.</p>
  </Tab>
  <Tab label="Settings" value="settings">
    <p>Settings content goes here.</p>
  </Tab>
</Tabs>
```

### Controlled

```tsx
const [activeTab, setActiveTab] = React.useState('tab1');

<Tabs value={activeTab} onChange={setActiveTab} aria-label="Dashboard">
  <Tab label="Analytics" value="tab1">
    <AnalyticsDashboard />
  </Tab>
  <Tab label="Reports" value="tab2">
    <ReportsList />
  </Tab>
</Tabs>
```

### Centered alignment

```tsx
<Tabs alignment="center" defaultValue="first" aria-label="Navigation">
  <Tab label="Home" value="first">
    <p>Home content</p>
  </Tab>
  <Tab label="Profile" value="second">
    <p>Profile content</p>
  </Tab>
</Tabs>
```

### Disabled

```tsx
<Tabs disabled defaultValue="tab1" aria-label="Disabled tabs">
  <Tab label="Active" value="tab1">
    <p>This tab is visible but all tabs are disabled.</p>
  </Tab>
  <Tab label="Inactive" value="tab2">
    <p>Cannot navigate here.</p>
  </Tab>
</Tabs>
```

### Individual tab disabled

```tsx
<Tabs defaultValue="enabled" aria-label="Mixed tabs">
  <Tab label="Enabled" value="enabled">
    <p>This tab works normally.</p>
  </Tab>
  <Tab label="Disabled" value="disabled-tab" disabled>
    <p>This content is unreachable.</p>
  </Tab>
  <Tab label="Also enabled" value="also-enabled">
    <p>This tab works too.</p>
  </Tab>
</Tabs>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `<Tab>` children with `label`, `value`, and `children` props. | Don't pass raw HTML elements as direct children of `<Tabs>` — only `<Tab>` is recognized. |
| Provide a unique `value` string for each `<Tab>`. | Don't duplicate `value` across tabs — selection will be ambiguous. |
| Use `aria-label` on `<Tabs>` to describe the tab group. | Don't omit `aria-label` — screen readers need a label for the `tablist` landmark. |
| Use `defaultValue` for uncontrolled or `value` + `onChange` for controlled. | Don't pass both `value` and `defaultValue` — use one pattern or the other. |
| Place the panel content inside each `<Tab>` as `children`. | Don't try to render panel content outside of `<Tabs>` — the component manages panel display automatically. |

## Accessibility

- Uses `role="tablist"` on the tab bar and `role="tab"` on each button.
- Active tab has `aria-selected="true"` and `tabindex="0"`; inactive tabs have `aria-selected="false"` and `tabindex="-1"`.
- Each tab button links to its panel via `aria-controls`; each panel links back via `aria-labelledby`.
- The content panel has `role="tabpanel"` and `tabindex="0"` for keyboard access.
- **Arrow Left / Arrow Right** moves focus between tabs and activates them.
- **Home / End** jumps to the first or last enabled tab.
- Disabled tabs are skipped during keyboard navigation.
