# Button

A themed button component with multiple emphasis levels, variants, sizes, icon support, and a loading state.

## Import

```tsx
import { Button } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Button text. Also used as `aria-label` when `iconPosition` is `'only'`. |
| `emphasis` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Visual weight of the button. Primary is the strongest call-to-action. |
| `variant` | `'default' \| 'inverse' \| 'neutral' \| 'neutral-inverse' \| 'static-dark' \| 'static-light' \| 'destructive' \| 'destructive-inverse'` | `'default'` | Color variant that combines with emphasis to determine the button's color scheme. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls height and padding. |
| `icon` | `React.ReactNode \| IconName` | — | Icon element or icon name string. Pass an `IconName` string for automatic `<Icon>` rendering. |
| `iconPosition` | `'none' \| 'start' \| 'end' \| 'only'` | `'none'` | Where to display the icon. `'only'` hides the label visually (icon-only button). |
| `loading` | `boolean` | `false` | Shows a spinner and disables interaction. |
| `disabled` | `boolean` | `false` | Disables the button. |
| `className` | `string` | — | Additional CSS class on the root element. |
| `type` | `string` | `'button'` | HTML button type attribute. |

Also accepts all standard `<button>` HTML attributes (except `children` — use `label` instead).

## Usage

### Basic

```tsx
<Button label="Continue" />
```

### Emphasis levels

```tsx
<Button emphasis="primary" label="Submit" />
<Button emphasis="secondary" label="Cancel" />
<Button emphasis="tertiary" label="Skip" />
```

### Variants

```tsx
<Button label="Delete" variant="destructive" />
<Button label="Action" variant="inverse" />
<Button label="Neutral" variant="neutral" emphasis="secondary" />
```

### Sizes

```tsx
<Button size="small" label="Small" />
<Button size="medium" label="Medium" />
<Button size="large" label="Large" />
```

### With icon

```tsx
<Button label="Back" icon="arrow-left" iconPosition="start" emphasis="secondary" />
<Button label="Next" icon="chevron-right" iconPosition="end" />
```

### Icon-only button

```tsx
<Button label="Close" icon="close-small" iconPosition="only" emphasis="tertiary" />
```

### Loading state

```tsx
<Button label="Saving..." loading />
```

### Disabled

```tsx
<Button label="Unavailable" disabled />
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `emphasis="primary"` for the main action on a page. Limit to one primary button per view. | Don't use multiple primary buttons in the same section — demote secondary actions to `"secondary"` or `"tertiary"`. |
| Use `label` for the button text — it doubles as the accessible name for icon-only buttons. | Don't pass content as `children` — this component uses `label`, not `children`. |
| Use `loading` to indicate async operations in progress. | Don't manually disable + show a spinner — just set `loading={true}`. |
| Use `variant="destructive"` for delete/remove actions. | Don't use color to distinguish actions when emphasis alone is sufficient. |
| Pass an `IconName` string to `icon` for built-in icons. | Don't render `<Icon>` inside `label` — use the `icon` prop instead. |

## Accessibility

- Renders a native `<button>` element with full keyboard support.
- When `iconPosition="only"`, the `label` is applied as `aria-label` and a tooltip is rendered for sighted users. The tooltip auto-flips above or below the button based on available space in the viewport, so it stays visible when the button is near the top of the screen.
- When `loading` is `true`, `aria-busy` is set and the button is disabled.
- `disabled` renders the native `disabled` attribute, removing the button from the tab order.
