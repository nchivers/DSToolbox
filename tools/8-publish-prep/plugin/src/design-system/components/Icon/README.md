# Icon

A themed SVG icon component with semantic color support. Renders from a built-in icon set.

## Import

```tsx
import { Icon } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `IconName` | — | **Required.** The icon to render. |
| `color` | `IconColor` | `'icon.primary'` | Semantic color token applied to the icon. Maps to `--affirm-color-icon-*` tokens. |
| `className` | `string` | — | Additional CSS class on the SVG element. |

### Available icon names

`'arrow-left'` | `'checkmark-small'` | `'chevron-down'` | `'chevron-right'` | `'close-small'` | `'levels'`

### Available colors

`'icon.primary'` | `'icon.primary.brand'` | `'icon.primary.brand.on_dark.static'` | `'icon.primary.brand.on_light.static'` | `'icon.primary.inverse'` | `'icon.primary.on_dark.static'` | `'icon.primary.on_light.static'` | `'icon.secondary'` | `'icon.secondary.brand'` | `'icon.secondary.inverse'` | `'icon.link'` | `'icon.link.inverse'` | `'icon.link.on_dark.static'` | `'icon.link.on_light.static'` | `'icon.critical'` | `'icon.info'` | `'icon.success'` | `'icon.warning'`

## Usage

### Basic

```tsx
<Icon name="checkmark-small" />
```

### With color

```tsx
<Icon name="close-small" color="icon.critical" />
<Icon name="checkmark-small" color="icon.success" />
<Icon name="arrow-left" color="icon.secondary" />
```

### In other components

```tsx
<InputText label="Search" startIcon={<Icon name="levels" />} />
<Button label="Back" icon="arrow-left" iconPosition="start" emphasis="tertiary" />
<Row title="Settings" trailingElement={<Icon name="chevron-right" />} interactive />
```

## Utility: `isIconName`

A type guard function exported alongside `Icon` for checking if a string is a valid icon name at runtime:

```tsx
import { isIconName } from '../design-system/components/Icon';

if (isIconName(someString)) {
  // someString is narrowed to IconName
}
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use the `color` prop to set icon color semantically. | Don't override icon color with inline styles or CSS — use the `color` prop. |
| Use icons that convey meaning alongside text labels. | Don't use icons as the sole indicator of meaning without an accessible label on the parent. |
| Pass icon names as strings to `Button`'s `icon` prop for automatic rendering. | Don't render `<Icon>` inside `Button`'s `label` — use the `icon` prop instead. |

## Accessibility

- All icons render with `aria-hidden="true"` since they are decorative. Meaning should be conveyed by surrounding text or parent element's `aria-label`.
- Uses `currentColor` for fill/stroke, which allows the `color` prop to control the rendered color via CSS custom properties.
