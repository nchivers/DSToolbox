# Design System Architecture Reference

Condensed reference for building components. For full documentation see `src/design-system/README.md`.

## Directory structure per component

```
src/design-system/components/<ComponentName>/
  <ComponentName>.tsx    # React component
  <ComponentName>.scss   # BEM styles consuming var(--affirm-*) tokens
  _tokens.scss           # CSS custom property definitions (light + dark + all-modes)
  index.ts               # Barrel export
  README.md              # Usage docs for developers and AI agents
```

## Token naming convention

CSV paths map 1:1 to CSS custom properties -- dots and underscores become hyphens:

| CSV path | CSS custom property |
|----------|---------------------|
| `affirm.color.checkbox.indicator.bg.selected.resting` | `--affirm-color-checkbox-indicator-bg-selected-resting` |
| `affirm.size.checkbox.indicator.all` | `--affirm-size-checkbox-indicator-all` |
| `affirm.radius.checkbox.container.all` | `--affirm-radius-checkbox-container-all` |
| `affirm.spacing.checkbox.gap.x` | `--affirm-spacing-checkbox-gap-x` |

General pattern: `--affirm-{foundation}-{component}-{part}-{property}-{state}-{interaction}`

## `_tokens.scss` structure

```scss
@use 'sass:map';
@use '../../tokens/base-colors' as *;
@use '../../tokens/base-sizes' as *;

// Mode-independent (sizes, radius, spacing)
:root {
  --affirm-radius-<component>-<part>-all: #{map.get($base-sizes, '<scale-key>')};
  --affirm-size-<component>-<part>-<property>: #{map.get($base-sizes, '<scale-key>')};
  --affirm-spacing-<component>-<part>-<property>: #{map.get($base-sizes, '<scale-key>')};
}

// Light mode colors
[data-mode='light'] {
  --affirm-color-<component>-<part>-<property>-<state>-<interaction>: #{map.get($base-colors, '<color-key>')};
}

// Dark mode colors
[data-mode='dark'] {
  --affirm-color-<component>-<part>-<property>-<state>-<interaction>: #{map.get($base-colors, '<color-key>')};
}
```

Group tokens within each block by component part with comment headers. See `Checkbox/_tokens.scss` or `Switch/_tokens.scss` for real examples.

## SCSS patterns

### BEM naming
- Block: `.affirm-<kebab-case-component>` (e.g., `.affirm-checkbox`, `.affirm-input-text-area`)
- Elements: `&__<layer-name>` (e.g., `&__indicator`, `&__label`, `&__track`)
- Modifiers: `&--<state>` (e.g., `&--selected`, `&--disabled`, `&--error`)

### Token consumption
Every visual property comes from a `var()` reference -- never hardcode values:
```scss
.affirm-checkbox__indicator {
  width: var(--affirm-size-checkbox-indicator-all);
  height: var(--affirm-size-checkbox-indicator-all);
  border-radius: var(--affirm-radius-checkbox-indicator-container-all);
  background: var(--affirm-color-checkbox-indicator-bg-unselected-resting);
}
```

### State styling order
Style states in this order per element: resting, `:hover`, `:active`, `:has(&__input:focus-visible)`. Group by modifier combination:

1. Unselected (base)
2. Selected (`&--selected`)
3. Error unselected (`&--error`)
4. Error + selected (`&--error#{&}--selected`)
5. Disabled (`&--disabled`)
6. Disabled + selected (`&--disabled#{&}--selected`)

### Compound modifier selectors
Use `#{&}` interpolation for compound modifiers:
```scss
&--error#{&}--selected &__track { ... }
&--disabled#{&}--selected &__handle { ... }
```

### Focus-visible pattern
```scss
&:has(&__input:focus-visible) {
  outline: var(--affirm-size-<component>-outline-width-focus-visible) solid
    var(--affirm-color-<component>-container-outline-focus-visible);
  outline-offset: var(--affirm-spacing-<component>-container-outline-offset-focus-visible);
}
```

### Typography
Import the component-type mixin partial and apply to text elements:
```scss
@use '../../tokens/component-type' as typography;

.affirm-<component>__label {
  @include typography.component-paragraph-large;
  color: var(--affirm-color-<component>-label-text-unselected-resting);
}
```

Available mixins: `component-singleline-{xlarge|large|medium|small|xsmall}` and `component-paragraph-{xlarge|large|medium|small|xsmall}`, each with optional `-mid-imp` and `-high-imp` weight variants.

### Disabled hover/active suppression
Override hover/active states for disabled to prevent visual changes:
```scss
&--disabled:hover &__track,
&--disabled:active &__track {
  background: var(--affirm-color-<component>-track-bg-unselected-disabled);
}
```

## TSX patterns

### Figma property → TypeScript prop mapping

Every component prop must trace back to a Figma property. Figma has 4 property types:

| Figma type | TypeScript pattern | Example |
|------------|-------------------|---------|
| Boolean | `propName?: boolean` | `disabled?: boolean` |
| Enum (variant) | Exported union alias + prop | `export type ButtonSize = 'small' \| 'medium' \| 'large';` → `size?: ButtonSize` |
| Text | `propName: string` or `propName?: string` | `label: string` |
| Instance swap | `propName?: React.ReactNode` | `startIcon?: React.ReactNode` |

**1:1 mapping:** One Figma property = one TypeScript prop. Never decompose a single Figma enum into multiple props (e.g., do NOT split a "Variant" enum with "Primary.Inverse" into separate `variant` + `inverse` props).
**Naming:** Use Figma property name → camelCase. "Label Position" → `labelPosition`. "Show Icon" → `showIcon`.
**Enum values:** Convert to kebab-case — dots, spaces, and camelCase boundaries become hyphens, then lowercase. "Primary.Inverse" → `'primary-inverse'`, "Extra Small" → `'extra-small'`.
**State enums:** Figma "State" values (resting, hover, pressed, disabled, focused) are NOT props — they map to CSS pseudo-classes and BEM modifiers.
**Boolean + swap merging:** If a boolean controls an instance swap slot's visibility, merge them into a single optional slot prop. "Has Icon" + "Icon" → `icon?: React.ReactNode`.

### Explicit prop typing (MANDATORY)

**NEVER extend base HTML attribute interfaces.** No `extends React.HTMLAttributes<...>`, no `extends Omit<React.InputHTMLAttributes<...>, ...>`. This leaks hundreds of irrelevant props.

Declare every prop explicitly. Only include standard structural props the component actually needs:
- `className?: string`
- `disabled?: boolean`
- `name?: string` (form fields only)
- `id?: string` (form fields needing label association)
- `onChange?`, `onFocus?`, `onBlur?`, `onClick?` — typed to the specific element
- Specific `aria-*` props (e.g., `aria-label?: string`) when needed — not a blanket spread

### Component structure
```tsx
import * as React from 'react';
import './<ComponentName>.scss';
import { Icon } from '../Icon';

export type <ComponentName>Size = 'small' | 'medium' | 'large';

export interface <ComponentName>Props {
  label: string;
  size?: <ComponentName>Size;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const <ComponentName> = React.forwardRef<HTMLInputElement, <ComponentName>Props>(
  ({ label, size = 'medium', disabled = false, error = false, className, onChange }, ref) => {

    const classNames = [
      'affirm-<kebab-name>',
      `affirm-<kebab-name>--${size}`,
      disabled && 'affirm-<kebab-name>--disabled',
      error && 'affirm-<kebab-name>--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <label className={classNames}>
        {/* Hidden input + visible elements */}
      </label>
    );
  },
);

<ComponentName>.displayName = '<ComponentName>';
```

### Controlled/uncontrolled pattern
Used by Checkbox, Switch, InputText, InputTextArea:
```tsx
const [internalValue, setInternalValue] = React.useState(defaultValue ?? initialValue);
const isControlled = value !== undefined;
const currentValue = isControlled ? value : internalValue;

const handleChange = (e) => {
  if (!isControlled) {
    setInternalValue(e.target.value);
  }
  onChange?.(e);
};
```

### Class name construction
Always use the array + filter + join pattern -- no classnames library:
```tsx
const classNames = [
  'affirm-component',
  condition && 'affirm-component--modifier',
  className,
]
  .filter(Boolean)
  .join(' ');
```

### Focus-visible hook
For input components that need custom focus styling:
```tsx
import { useFocusVisible } from '../../hooks';

const { isFocusVisible, focusVisibleProps } = useFocusVisible();
// Spread focusVisibleProps onto the input, use isFocusVisible for data attribute
```

## Barrel / index exports

### Per-component `index.ts`
```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### Registration checklist

1. **`src/design-system/tokens/_index.scss`**: Add `@use` import (alphabetical order):
   ```scss
   @use '../components/<ComponentName>/tokens' as <kebab-name>-tokens;
   ```

2. **`src/design-system/components/index.ts`**: Add exports (alphabetical order):
   ```typescript
   export { ComponentName } from './<ComponentName>';
   export type { ComponentNameProps } from './<ComponentName>';
   ```

3. **`src/design-system/index.ts`**: Add root barrel exports:
   ```typescript
   export { ComponentName } from './components';
   export type { ComponentNameProps } from './components';
   ```

## Component README template

Every component MUST include a `README.md`. It serves two audiences: developers reading docs and AI agents consuming context. Follow this structure exactly — no sections may be omitted.

````markdown
# <ComponentName>

<One-sentence description of what the component does and when to use it.>

## Import

```tsx
import { <ComponentName> } from '../design-system/components';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | **Required.** Visible text label. |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls the overall size. |
| `disabled` | `boolean` | `false` | Disables interaction and applies disabled styling. |
| `className` | `string` | — | Additional CSS class on the root element. |

> For every prop: list the name, its exact TypeScript type, the default value (or "—" if required/no default), and a short description. Mark required props with **Required.** in the description.

## Usage

### Basic

```tsx
<<ComponentName> label="Example" />
```

### With all options

```tsx
<<ComponentName>
  label="Example"
  size="large"
  disabled
  className="my-custom-class"
/>
```

<Include one example per major variant or feature. If the component has controlled/uncontrolled behavior, show both patterns. If it accepts slot props (icons, actions), show an example with content passed in.>

## Do / Don't

| Do | Don't |
|----|-------|
| Use the `label` prop for visible text. | Don't render text as a child — this component does not accept `children`. |
| Use `size` to match the surrounding layout density. | Don't override size with custom CSS. |
| Pair `error` with an accessible error message. | Don't set `error` without telling the user what went wrong. |

> Include 3–6 rows covering the most common mistakes. Focus on things an AI agent or new developer would get wrong: passing wrong prop types, using children when the component uses named slots, hardcoding styles, forgetting accessibility, etc.

## Accessibility

- <Keyboard interaction notes>
- <ARIA attributes the component sets automatically>
- <Anything the consumer must provide (e.g., aria-label for icon-only buttons)>
````

### Writing guidelines

- **Props table is the single source of truth.** Every prop on the interface must appear in the table. If a prop is not in the table, an AI agent will not know it exists.
- **Examples must be copy-pasteable.** Use realistic prop values, not "foo" or "bar". Every example must be valid JSX that compiles without changes.
- **Do / Don't prevents misuse.** Think about what an agent or unfamiliar developer would try that would break the component, look wrong, or violate the design system. Call those out explicitly.
- **Keep it concise.** This is a component README, not a tutorial. One sentence per description, one example per pattern.

## Existing components for reference

| Component | Has tokens | Prop typing | Key patterns to study |
|-----------|-----------|------------|----------------------|
| `Checkbox` | Yes | Explicit (preferred) | Controlled/uncontrolled, indicator + label, error states, focus-visible |
| `Switch` | Yes | Explicit (preferred) | Compound modifiers (`#{&}`), track/handle/icon structure, `role="switch"` |
| `Button` | Yes | Explicit with union aliases (preferred) | `ButtonSize`, `ButtonEmphasis`, `ButtonVariant` union types, icon slot merging boolean + instance swap |
| `PageHeader` | Yes | Explicit (preferred) | Slot prop (`action?: React.ReactNode`), enum for position |
| `Icon` | No | Explicit (preferred) | Union type `IconName`, inline style for color variable, `toKebab` helper |
| `InputText` | Yes | ~~extends Omit~~ (legacy) | `useFocusVisible` hook, `data-focus-visible` attribute — follow structure but use explicit props for new components |
| `InputTextArea` | Yes | ~~extends Omit~~ (legacy) | Multi-line input, resize handling — follow structure but use explicit props for new components |
| `Link` | Yes | ~~extends HTMLAttributes~~ (legacy) | Polymorphic `as` prop, size variants — follow structure but use explicit props for new components |
| `Type` | No | Explicit (preferred) | Variant/color dot-notation to CSS variable mapping |
