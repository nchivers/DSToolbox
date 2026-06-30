# CircularLoader

An animated circular spinner for indicating loading/progress states. Available in two sizes and two color modes.

## Import

```tsx
import { CircularLoader } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'large' \| 'small'` | `'large'` | Controls the spinner dimensions. |
| `colorBorder` | `'default' \| 'default-inverse'` | `'default'` | Color scheme. Use `'default-inverse'` on dark backgrounds. |
| `className` | `string` | — | Additional CSS class on the root element. |

## Usage

### Basic

```tsx
<CircularLoader />
```

### Small (inline or inside buttons)

```tsx
<CircularLoader size="small" />
```

### Inverse (on dark surfaces)

```tsx
<CircularLoader colorBorder="default-inverse" />
```

### Full-page loading state

```tsx
<div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--affirm-spacing-400)' }}>
  <CircularLoader />
</div>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `size="small"` when embedding inside buttons or compact areas. | Don't use `size="large"` inside tight layouts like Row trailing elements. |
| Use `colorBorder="default-inverse"` on dark backgrounds. | Don't hardcode spinner colors — use the `colorBorder` prop. |
| Wrap in a centered container when used as a page-level loading indicator. | Don't show a loader indefinitely — always pair with a timeout or error state. |

## Accessibility

- Renders with `role="status"` and `aria-label="Loading"` so screen readers announce the loading state.
- The SVG animation is purely decorative — the semantic meaning comes from the ARIA attributes.
