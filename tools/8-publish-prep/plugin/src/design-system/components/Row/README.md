# Row

A flexible list item component for displaying content in a horizontal layout with optional leading graphic, trailing element, and interactive states.

## Import

```tsx
import { Row } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `standAlone` | `boolean` | `false` | Renders with a visible border, background, and padding. |
| `interactive` | `boolean` | `false` | Enables hover, focus-visible, and pressed states. Renders as a focusable button role. |
| `disabled` | `boolean` | `false` | Disables interaction. Only meaningful when `interactive` is `true`. |
| `leadingGraphic` | `React.ReactNode` | — | Icon or graphic displayed at the start of the row. |
| `leadingGraphicSize` | `'medium' \| 'large'` | `'medium'` | Controls the leading graphic container size (24px or 36px). |
| `title` | `string` | — | Title text rendered via the Type component. Used when `swapMainContent` is not provided. |
| `titleWeight` | `'default' \| 'high-impact'` | `'default'` | Controls the title font weight. |
| `titleColor` | `'default' \| 'accent-red'` | `'default'` | Controls the title text color. |
| `subtitle` | `RowSubtextSegment[] \| React.ReactNode` | — | Subtitle content. Pass an array of segments for structured subtitles, or any ReactNode for custom content. |
| `subtitleOrientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction for subtitle segments. |
| `swapMainContent` | `React.ReactNode` | — | Replaces the entire default text container (title + subtitle) with custom content. |
| `contentRight` | `React.ReactNode` | — | Custom content displayed to the right, before the trailing element. |
| `trailingElement` | `React.ReactNode` | — | Element displayed at the end of the row (typically Icon, Switch, or Button). |
| `className` | `string` | — | Additional CSS class on the root element. |
| `onClick` | `(e: React.MouseEvent<HTMLDivElement>) => void` | — | Click handler. Only fires when `interactive` is `true` and row is not disabled. |
| `aria-label` | `string` | — | Accessible label for the row. |

### RowSubtextSegment

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | `string` | — | **Required.** The segment text. |
| `icon` | `React.ReactNode` | — | Optional icon before the text. |
| `color` | `RowSubtextColor` | `'supplementary'` | Text color for this segment. |
| `weight` | `RowSubtextWeight` | `'default'` | Font weight for this segment. |

## Usage

### Basic row with title and subtitle

```tsx
<Row
  title="Account balance"
  subtitle={[{ text: 'Updated today' }]}
/>
```

### Interactive row with trailing chevron

```tsx
<Row
  title="Payment settings"
  subtitle={[{ text: 'Manage your payment methods' }]}
  leadingGraphic={<Icon name="levels" />}
  trailingElement={<Icon name="chevron-right" />}
  interactive
  onClick={() => navigate('/settings')}
/>
```

### Stand-alone row

```tsx
<Row
  standAlone
  title="Total balance"
  subtitle={[{ text: '$1,234.56', color: 'default', weight: 'high-impact' }]}
  trailingElement={<Icon name="chevron-right" />}
  interactive
  onClick={handleClick}
/>
```

### Row with trailing Switch (non-interactive row)

```tsx
<Row
  title="Dark mode"
  subtitle={[{ text: 'Toggle dark theme' }]}
  trailingElement={<Switch label="Dark mode" hideLabel checked={isDark} onChange={handleToggle} />}
/>
```

### Row with trailing Button (non-interactive row)

```tsx
<Row
  title="Notifications"
  subtitle={[{ text: '3 unread messages' }]}
  trailingElement={<Button label="View" size="small" />}
/>
```

### Multi-segment subtitle

```tsx
<Row
  title="Recent payment"
  subtitle={[
    { text: 'Apr 28, 2026' },
    { text: '$45.00', color: 'accent-green', weight: 'high-impact' },
  ]}
/>
```

### Custom content via swapMainContent

```tsx
<Row
  swapMainContent={
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Type variant="body.large.highImp">Custom layout</Type>
      <Type variant="body.small" color="text.secondary">Fully custom content area</Type>
    </div>
  }
  trailingElement={<Icon name="chevron-right" />}
  interactive
  onClick={handleClick}
/>
```

### Disabled interactive row

```tsx
<Row
  standAlone
  title="Unavailable"
  subtitle={[{ text: 'This action is currently disabled' }]}
  trailingElement={<Icon name="chevron-right" />}
  interactive
  disabled
/>
```

## Do / Don't

| Do | Don't |
|----|-------|
| Set `interactive` when the row navigates or triggers an action. | Don't add `onClick` without `interactive` — the handler won't fire and states won't show. |
| Use `trailingElement` with `<Icon name="chevron-right" />` for navigational rows. | Don't make the row interactive when it contains an interactive trailing element like Button or Switch. |
| Pass `subtitle` as a `RowSubtextSegment[]` for structured multi-segment subtitles. | Don't hardcode text colors — use the `color` property on segments instead. |
| Use `standAlone` for rows that appear outside a list context. | Don't nest interactive elements inside an interactive row — it creates conflicting focus targets. |
| Provide `aria-label` when the row content alone doesn't convey its purpose. | Don't use `disabled` without `interactive` — it has no visual or functional effect on non-interactive rows. |

## Accessibility

- When `interactive` is `true`, the row renders with `role="button"` and `tabIndex={0}`, making it keyboard-focusable.
- Pressing Enter or Space triggers the `onClick` handler.
- When `disabled` is `true`, `tabIndex` is set to `-1` and `aria-disabled` is applied.
- Focus-visible state displays a visible outline ring meeting WCAG 2.1 focus indicator requirements.
- Provide `aria-label` when the visual content (title/subtitle) doesn't sufficiently describe the row's action.
