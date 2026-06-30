# CardContainer

A themed container component that provides consistent background, border, radius, and shadow styling based on its placement context and background color.

## Import

```tsx
import { CardContainer } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placement` | `'on-page' \| 'on-surface' \| 'inset'` | `'on-page'` | Controls border-radius, padding, and border-width based on the card's nesting depth. `on-page` for top-level cards, `on-surface` for one level nested, `inset` for deeply nested. |
| `backgroundColor` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Sets the background, border, and shadow colors for the card. |
| `as` | `'div' \| 'section' \| 'article'` | `'div'` | The HTML element to render. Use for semantic HTML when appropriate. |
| `children` | `ReactNode` | — | Content rendered inside the card. |
| `className` | `string` | — | Additional CSS class on the root element. |

## Usage

### Basic

```tsx
<CardContainer>
  <Type variant="body.medium">Card content goes here.</Type>
</CardContainer>
```

### Placement variants

```tsx
<CardContainer placement="on-page">
  <Type variant="body.medium">Top-level card on a page (16px radius, 16px padding).</Type>
</CardContainer>

<CardContainer placement="on-surface">
  <Type variant="body.medium">Card nested one level deep (8px radius, 16px padding).</Type>
</CardContainer>

<CardContainer placement="inset">
  <Type variant="body.medium">Deeply nested card (2px radius, 12px padding).</Type>
</CardContainer>
```

### Background color variants

```tsx
<CardContainer backgroundColor="primary">
  <Type variant="body.medium">Primary background.</Type>
</CardContainer>

<CardContainer backgroundColor="secondary">
  <Type variant="body.medium">Secondary background.</Type>
</CardContainer>

<CardContainer backgroundColor="tertiary">
  <Type variant="body.medium">Tertiary background.</Type>
</CardContainer>
```

### Nested cards

```tsx
<CardContainer placement="on-page" backgroundColor="primary">
  <Type variant="body.medium">Outer card</Type>
  <CardContainer placement="on-surface" backgroundColor="secondary">
    <Type variant="body.medium">Inner card</Type>
    <CardContainer placement="inset" backgroundColor="tertiary">
      <Type variant="body.medium">Deeply nested card</Type>
    </CardContainer>
  </CardContainer>
</CardContainer>
```

### Semantic HTML element

```tsx
<CardContainer as="section">
  <Type variant="headline.small" as="h2">Section title</Type>
  <Type variant="body.medium">Section content inside a semantic section element.</Type>
</CardContainer>

<CardContainer as="article">
  <Type variant="headline.small" as="h2">Article title</Type>
  <Type variant="body.medium">Article content inside a semantic article element.</Type>
</CardContainer>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Use `placement` to match the card's nesting depth in the layout. | Don't use `inset` for top-level cards on a page — use `on-page` instead. |
| Pass content as `children`. | Don't pass content via a named prop — this component uses `children`. |
| Use `as` for semantic HTML (`section`, `article`). | Don't override border-radius or padding with custom CSS — use the `placement` prop. |
| Nest `CardContainer` components to build layered card layouts. | Don't hardcode background colors — use the `backgroundColor` prop. |

## Accessibility

- Renders a plain container element (`div`, `section`, or `article`) with no implicit ARIA role.
- When using `as="section"` or `as="article"`, include a heading element inside for proper document outline.
- The component does not trap focus or handle keyboard events — it is a purely visual container.
