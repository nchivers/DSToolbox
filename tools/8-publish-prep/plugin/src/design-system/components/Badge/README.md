# Badge

A small label component for displaying status, category, or metadata. Supports multiple color categories, size variants, optional icons, and inverse/static contexts.

## Import

```tsx
import { Badge } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `'default' \| 'brand-primary' \| 'brand-secondary' \| 'brand-featured' \| 'brand-tertiary' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'default'` | Color category that determines background and text color. |
| `context` | `'default' \| 'static' \| 'inverse' \| 'inverse-static'` | `'default'` | Visual context for different surface backgrounds. Use `inverse` on dark surfaces, `static` for non-adaptive colors. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls padding and font size. |
| `icon` | `React.ReactNode` | — | Optional icon rendered alongside the text. |
| `iconPosition` | `'start' \| 'end'` | `'start'` | Position of the icon relative to the text. |
| `children` | `React.ReactNode` | — | **Required.** Badge label text. |
| `className` | `string` | — | Additional CSS class on the root element. |

## Usage

### Basic

```tsx
<Badge>Default</Badge>
```

### Category variants

```tsx
<Badge category="success">Approved</Badge>
<Badge category="error">Failed</Badge>
<Badge category="warning">Pending</Badge>
<Badge category="info">New</Badge>
<Badge category="brand-primary">Affirm</Badge>
```

### Sizes

```tsx
<Badge size="small">Small</Badge>
<Badge size="medium">Medium</Badge>
<Badge size="large">Large</Badge>
```

### With icon

```tsx
<Badge category="success" icon={<Icon name="checkmark-small" />}>
  Complete
</Badge>

<Badge category="error" icon={<Icon name="close-small" />} iconPosition="end">
  Rejected
</Badge>
```

### Inverse context (on dark surfaces)

```tsx
<Badge category="brand-primary" context="inverse">Affirm</Badge>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `category` to communicate semantic meaning (success, error, etc.). | Don't use color categories purely for decoration — pick the one that matches the status. |
| Use `size="small"` in dense layouts like table rows or list items. | Don't use `size="large"` inside compact components like Row. |
| Use `context="inverse"` when placing a badge on a dark surface. | Don't hardcode text or background colors — use the `category` and `context` props. |

## Accessibility

- Renders as a `<div>` with text content — screen readers announce the badge text naturally.
- Does not have an interactive role. If a badge needs to be actionable, wrap it in a button or link.
- Color alone does not convey meaning — the text content should describe the status independently.
