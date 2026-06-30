# Chip

An interactive pill-shaped element that triggers an action or navigation on click. Not for static data display — use Badge for that purpose.

## Import

```tsx
import { Chip } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Visible text content of the chip. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls the overall size of the chip. |
| `swapIcon` | `React.ReactNode` | — | Optional leading icon. Pass an `<Icon>` component or any renderable node. When provided, the icon is displayed before the label. |
| `disabled` | `boolean` | `false` | Disables interaction and applies disabled styling. |
| `className` | `string` | — | Additional CSS class on the root button element. |
| `onClick` | `(e: React.MouseEvent<HTMLButtonElement>) => void` | — | Click handler fired when the chip is activated. |
| `aria-label` | `string` | — | Accessible label override. Use when `label` alone is not descriptive enough. |

## Usage

### Basic

```tsx
<Chip label="Filter" />
```

### Sizes

```tsx
<Chip label="Small chip" size="small" />
<Chip label="Medium chip" size="medium" />
<Chip label="Large chip" size="large" />
```

### With a leading icon

```tsx
<Chip label="Settings" swapIcon={<Icon name="levels" />} />
```

### Disabled

```tsx
<Chip label="Unavailable" disabled />
```

### With click handler

```tsx
<Chip label="View details" onClick={() => navigate('/details')} />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `Chip` for interactive elements that perform an action or navigate. | Don't use `Chip` for static informational labels — use `Badge` instead. |
| Pass an `<Icon>` component to `swapIcon` for the leading icon. | Don't pass raw SVG or `<img>` elements to `swapIcon`. |
| Use the `size` prop to match surrounding layout density. | Don't override chip sizing with custom CSS. |
| Provide `aria-label` when `label` alone is ambiguous in context. | Don't omit `label` — it is required and serves as the accessible name. |
| Set `disabled` when the chip action is temporarily unavailable. | Don't hide the chip instead of disabling it — disabled conveys that the action exists but is unavailable. |

## Accessibility

- Renders as a native `<button>` element, inheriting keyboard focus and activation (Enter/Space).
- The trailing chevron icon is decorative (`aria-hidden="true"` on the SVG via the `Icon` component).
- The `label` prop provides the accessible name by default. Use `aria-label` to override when the visible label is insufficient.
- When `disabled`, the native `disabled` attribute is set, removing the element from the tab order and preventing activation.
