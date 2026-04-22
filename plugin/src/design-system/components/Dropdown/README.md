# Dropdown

A select-like control that opens a listbox of options when activated. Supports single selection, keyboard navigation, error/disabled states, optional leading icons on the trigger and per-option, and smart viewport-aware positioning.

## Import

```tsx
import { Dropdown } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Visible label text inside the trigger. Floats above the value when an option is selected. |
| `options` | `DropdownOption[]` | — | **Required.** Array of options to display in the listbox. |
| `value` | `string` | — | Controlled selected value. When provided, the component is controlled. |
| `defaultValue` | `string` | `''` | Initial value for uncontrolled usage. |
| `error` | `boolean` | `false` | Applies error styling to the trigger and shows `errorMessage` instead of `message`. |
| `errorMessage` | `string` | — | Error text displayed below the trigger when `error` is `true`. |
| `message` | `string` | — | Helper text displayed below the trigger when not in error state. |
| `disabled` | `boolean` | `false` | Disables the trigger, preventing interaction and applying disabled styling. |
| `startIcon` | `React.ReactNode` | — | Icon rendered at the start of the trigger, before the label. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `name` | `string` | — | Form field name. Renders a hidden `<input>` with this name and the current value. |
| `id` | `string` | auto-generated | DOM id for the trigger button. |
| `onChange` | `(value: string) => void` | — | Called with the selected option's value when a selection is made. |
| `onOpenChange` | `(open: boolean) => void` | — | Called when the listbox opens or closes. |
| `aria-label` | `string` | — | Accessible label for the combobox and listbox when the visible label is insufficient. |

### DropdownOption

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | — | **Required.** Unique identifier for this option. |
| `label` | `string` | — | **Required.** Display text for this option. |
| `icon` | `React.ReactNode` | — | Optional leading icon rendered before the label. |
| `disabled` | `boolean` | `false` | Prevents selecting this option. |

## Usage

### Basic

```tsx
<Dropdown
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ]}
  onChange={(val) => console.log(val)}
/>
```

### Controlled

```tsx
const [country, setCountry] = React.useState('us');

<Dropdown
  label="Country"
  value={country}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
  ]}
  onChange={setCountry}
/>
```

### With start icon

```tsx
<Dropdown
  label="Category"
  startIcon={<Icon name="levels" />}
  options={[
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
  ]}
/>
```

### With option icons

```tsx
<Dropdown
  label="Payment method"
  options={[
    { value: 'card', label: 'Credit card', icon: <Icon name="checkmark-small" /> },
    { value: 'bank', label: 'Bank transfer', icon: <Icon name="checkmark-small" /> },
  ]}
/>
```

### Error state

```tsx
<Dropdown
  label="State"
  error
  errorMessage="Please select a state"
  options={[
    { value: 'ca', label: 'California' },
    { value: 'ny', label: 'New York' },
  ]}
/>
```

### With helper text

```tsx
<Dropdown
  label="Frequency"
  message="How often should we send reports?"
  options={[
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ]}
/>
```

### Disabled

```tsx
<Dropdown
  label="Region"
  disabled
  options={[
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
  ]}
/>
```

### Disabled option

```tsx
<Dropdown
  label="Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise', disabled: true },
  ]}
/>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use the `options` prop to provide selectable items. | Don't pass options as `children` — this component does not accept `children`. |
| Use `onChange` to respond to selections. The callback receives the option's `value` string. | Don't attach `onClick` to the root — use `onChange` for value changes and `onOpenChange` for open/close. |
| Pair `error` with `errorMessage` so the user knows what went wrong. | Don't set `error` without providing an `errorMessage`. |
| Use `value` + `onChange` for controlled forms, or `defaultValue` for uncontrolled. | Don't set both `value` and `defaultValue` — pick one pattern. |
| Ensure every option has a unique `value` string. | Don't use duplicate `value` strings — this breaks selection tracking and ARIA. |
| Use `startIcon` for a leading icon on the trigger. | Don't hardcode an icon inside `label` text — use the `startIcon` prop instead. |

## Accessibility

- **Role**: The trigger has `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`, and `aria-controls`. The popup has `role="listbox"` with `role="option"` on each item.
- **Keyboard**:
  - `Space` / `Enter`: Open the listbox (or select the active option if open).
  - `Arrow Down` / `Arrow Up`: Navigate options. Opens the listbox if closed.
  - `Home` / `End`: Jump to the first or last enabled option.
  - `Escape`: Close the listbox without selecting.
  - `Tab`: Close the listbox and move focus to the next element.
- **Focus visible**: The focus outline only appears when the user navigates via keyboard (Tab). Clicking does not trigger the focus outline.
- **Active descendant**: `aria-activedescendant` tracks the currently highlighted option for screen readers.
- **Selection**: `aria-selected="true"` marks the selected option. `aria-disabled` marks disabled options.
- The consumer should provide `aria-label` if the visible `label` is not descriptive enough for screen readers.
