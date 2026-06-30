# Type

The universal text rendering component. Use `<Type>` for ALL text in the plugin UI. Never use raw `<h1>`, `<p>`, `<span>` with manual font/color styling.

## Import

```tsx
import { Type } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TypeVariant` | — | **Required.** Typography style matching the Figma token path. |
| `color` | `TypeColor` | `'text.primary'` | Text color matching a Figma semantic color token path. |
| `strikethrough` | `boolean` | `false` | *Deprecated.* Use a `body.support.*.strike` variant instead. |
| `as` | `TypeElement` | auto | Override the rendered HTML element. |
| `className` | `string` | — | Additional CSS class on the element. |
| `children` | `React.ReactNode` | — | Text content. |

### Variant values

**Headline** (Axiforma typeface):
`'headline.xxlarge'` · `'headline.xlarge'` · `'headline.large'` · `'headline.medium'` · `'headline.small'`

**Body** (Calibre typeface):
`'body.xlarge'` · `'body.large'` · `'body.medium'` · `'body.small'`

**Body high emphasis:**
`'body.xlarge.highImp'` · `'body.large.highImp'` · `'body.medium.highImp'` · `'body.small.highImp'`

**Body support strikethrough:**
`'body.support.xlarge.strike'` · `'body.support.large.strike'` · `'body.support.medium.strike'` · `'body.support.small.strike'`

### Color values

`'text.primary'` · `'text.primary.brand'` · `'text.primary.inverse'` · `'text.primary.on_dark.static'` · `'text.primary.on_light.static'` · `'text.secondary'` · `'text.secondary.brand'` · `'text.secondary.inverse'` · `'text.link'` · `'text.link.inverse'` · `'text.link.on_dark.static'` · `'text.link.on_light.static'` · `'text.critical'` · `'text.info'` · `'text.success'` · `'text.warning'`

### Default HTML element mapping

| Variant | Default element |
|---------|-----------------|
| `headline.xxlarge`, `headline.xlarge` | `<h1>` |
| `headline.large` | `<h2>` |
| `headline.medium` | `<h3>` |
| `headline.small` | `<h4>` |
| All `body.*` variants | `<p>` |

Override with the `as` prop: `'h1'`–`'h6'`, `'p'`, `'span'`, `'label'`, `'div'`.

## Usage

### Headlines

```tsx
<Type variant="headline.large" as="h1">Page Title</Type>
<Type variant="headline.medium">Section Title</Type>
<Type variant="headline.small">Subsection</Type>
```

### Body text

```tsx
<Type variant="body.large">Introduction paragraph</Type>
<Type variant="body.medium" color="text.secondary">Supporting details</Type>
<Type variant="body.small" color="text.secondary">Fine print</Type>
```

### High emphasis body

```tsx
<Type variant="body.medium.highImp">Important callout</Type>
<Type variant="body.small.highImp" color="text.critical">Error message</Type>
```

### Semantic colors

```tsx
<Type variant="body.medium" color="text.success">Payment confirmed</Type>
<Type variant="body.medium" color="text.warning">Review required</Type>
<Type variant="body.medium" color="text.link">Learn more</Type>
```

### Inline text with `as="span"`

```tsx
<Type variant="body.medium" as="span">Inline text </Type>
<Type variant="body.medium.highImp" as="span" color="text.primary.brand">$50/mo</Type>
```

### Strikethrough (deprecated — use support variant)

```tsx
<Type variant="body.support.medium.strike">Was $50/mo</Type>
```

## How color works

The `color` prop sets a `--affirm-type-color` CSS custom property on the element. The prop value maps to the corresponding semantic token:

| `color` prop | Resolved CSS variable |
|---|---|
| `'text.primary'` | `var(--affirm-color-text-primary)` |
| `'text.primary.brand'` | `var(--affirm-color-text-primary-brand)` |
| `'text.link'` | `var(--affirm-color-text-link)` |
| `'text.critical'` | `var(--affirm-color-text-critical)` |

## Do / Don't

| Do | Don't |
|----|-------|
| Use `<Type>` for every piece of text in the UI. | Don't use raw `<h1>`, `<p>`, `<span>` with manual font/color styling. |
| Use `color` prop for text colors. | Don't hardcode hex colors or override with inline `style={{ color: ... }}`. |
| Use `as` to override the HTML element when semantics differ from the default mapping. | Don't use `as="h1"` with `body.*` variants just for semantic heading — match the visual variant to the content hierarchy. |
| Use `body.support.*.strike` variants for strikethrough text. | Don't use the deprecated `strikethrough` prop — it will be removed. |

## Accessibility

- Renders semantic HTML elements by default (`<h1>`–`<h4>` for headlines, `<p>` for body).
- Override with `as` when the visual style doesn't match the document outline (e.g., a visually large callout that isn't a heading).
- Color alone does not convey meaning — pair colored text with descriptive content.
