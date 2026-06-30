# ListOfRows

A container that arranges multiple Row components in a vertical list with configurable visual treatments (card, individual containers, divided, or plain).

## Import

```tsx
import { ListOfRows } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `treatment` | `'contained-aio' \| 'contained-individual' \| 'uncontained-divided' \| 'uncontained-undivided'` | `'contained-aio'` | Controls the visual container style and whether dividers are inserted between rows. |
| `children` | `React.ReactNode` | — | **Required.** Row components to display in the list. |
| `className` | `string` | — | Additional CSS class on the root element. |

## Usage

### All in one card (default)

```tsx
<ListOfRows treatment="contained-aio">
  <Row title="Payment 1" subtitle={[{ text: 'Due Jan 15' }]} />
  <Row title="Payment 2" subtitle={[{ text: 'Due Feb 15' }]} />
  <Row title="Payment 3" subtitle={[{ text: 'Due Mar 15' }]} />
</ListOfRows>
```

### Individual containers

```tsx
<ListOfRows treatment="contained-individual">
  <Row standAlone title="Account A" contentRight={<Type variant="body.large">$1,200.00</Type>} />
  <Row standAlone title="Account B" contentRight={<Type variant="body.large">$3,400.00</Type>} />
</ListOfRows>
```

### Uncontained with dividers

```tsx
<ListOfRows treatment="uncontained-divided">
  <Row title="Transaction 1" subtitle={[{ text: 'Completed' }]} />
  <Row title="Transaction 2" subtitle={[{ text: 'Pending' }]} />
  <Row title="Transaction 3" subtitle={[{ text: 'Failed', color: 'accent-red' }]} />
</ListOfRows>
```

### Uncontained without dividers

```tsx
<ListOfRows treatment="uncontained-undivided">
  <Row title="Item A" />
  <Row title="Item B" />
  <Row title="Item C" />
</ListOfRows>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Pass only `<Row>` components as children. | Don't pass arbitrary elements — this component is designed exclusively for Row children. |
| Use `treatment="contained-individual"` with `standAlone` on each Row. | Don't forget to pass `standAlone` to Row children when using `contained-individual` — the ListOfRows does not apply it automatically. |
| Let the number of children determine the list length. | Don't try to control the number of rows via a prop — pass the exact Row elements you need. |
| Use the `treatment` prop to match your layout context. | Don't override container styles with custom CSS — use the appropriate treatment instead. |

## Accessibility

- The root container has `role="list"` applied automatically.
- Each child is wrapped in a `role="listitem"` container.
- No additional ARIA attributes are required from consumers.
