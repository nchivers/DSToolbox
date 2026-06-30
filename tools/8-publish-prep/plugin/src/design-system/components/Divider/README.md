# Divider

A horizontal rule that visually separates content into sections. Stretches to fill the width of its container.

## Import

```tsx
import { Divider } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'primary-inverse' \| 'secondary-inverse' \| 'tertiary-inverse'` | `'primary'` | Color variant of the divider line. Inverse variants are intended for use on dark backgrounds. |
| `className` | `string` | — | Additional CSS class on the root `<hr>` element. |

## Usage

### Basic

```tsx
<Divider />
```

### Secondary variant

```tsx
<Divider variant="secondary" />
```

### Tertiary variant

```tsx
<Divider variant="tertiary" />
```

### Inverse variants (on a dark surface)

```tsx
<Divider variant="primary-inverse" />
<Divider variant="secondary-inverse" />
<Divider variant="tertiary-inverse" />
```

### With custom class

```tsx
<Divider className="my-section-divider" />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `variant` to control visual weight and polarity. | Don't override the border color with custom CSS — use the provided variants. |
| Use inverse variants when placing the divider on a dark or brand-colored surface. | Don't nest a `Divider` inside inline elements like `<span>` — it renders an `<hr>` block element. |
| Let the divider stretch naturally to its container width. | Don't set a fixed width — the component is designed to fill its parent. |
| Use `variant="secondary"` or `variant="tertiary"` for subtler separation. | Don't pass `children` — `Divider` does not accept children. |

## Accessibility

- Renders a semantic `<hr>` element, which carries an implicit `role="separator"`.
- Screen readers announce the divider as a thematic break between content sections.
- No keyboard interaction — the divider is not focusable or interactive.
