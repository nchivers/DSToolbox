# Design System

A lightweight, CSS-native design system for the Affirm Figma Plugin. Tokens are defined as CSS custom properties scoped to `data-mode` and `data-theme` attributes. No runtime JavaScript is involved in token resolution — the CSS cascade handles everything.

## Architecture

```
src/design-system/
  tokens/
    _base-colors.scss              # Primitive hex palette (SCSS map, compiles away)
    _base-sizes.scss               # Primitive size scale (SCSS map, compiles away)
    _global.scss                   # App-level defaults: spacing, radius, fonts, interaction-state colors
    _semantic.scss                 # Semantic color tokens (bg, border, fill, icon, text)
    _typography.scss               # Typography tokens (semantic headline/body + component type scale)
    themes/
      <theme-name>/                # Override folders — only vars that differ
        _<component>.scss
        _semantic.scss             # Semantic token overrides for this theme
        _typography.scss           # Typography token overrides for this theme
        _index.scss
    _index.scss                    # Imports global, semantic, component defaults, then theme overrides

  components/
    <ComponentName>/
      <ComponentName>.tsx          # React component
      <ComponentName>.scss         # BEM styles (consumes vars)
      _tokens.scss                 # Default token definitions (light + dark)
      index.ts
    index.ts                       # Barrel for all components

  ThemeProvider.tsx                 # React context: manages data-theme + data-mode
  usePreferredColorScheme.ts       # OS color scheme detection hook
  index.ts                         # Barrel exports
```

## Token layers

The system has five layers, each with increasing specificity:

| Layer | Selector | Specificity | Purpose |
|-------|----------|-------------|---------|
| 1. Base primitives | _(compile-time only)_ | N/A | Raw hex colors and pixel sizes as SCSS maps |
| 2a. Semantic color tokens | `[data-mode]` | (0,1,0) | Design system color vocabulary (bg, border, fill, icon, text) |
| 2b. Typography tokens | `:root` | (0,0,1) | Semantic + component type scale (families, weights, sizes, line heights) |
| 2c. Component defaults | `:root` / `[data-mode]` | (0,0,1) / (0,1,0) | Per-component values for all themes |
| 3. Theme overrides | `[data-theme]` or `[data-theme][data-mode]` | (0,1,0) / (0,2,0) | Sparse overrides per theme (color, typography, component) |
| 4. Component styles | `.affirm-<component>` | varies | Consumes `var(--affirm-*)` references |

Semantic tokens (2a) and component defaults (2b) are peers at the same specificity. They define different variable names so load order between them doesn't matter. The default theme ("affirm") has no override folder — its values **are** the defaults baked into `_semantic.scss` and each component's `_tokens.scss`. Theme overrides only need to declare what differs.

## Semantic tokens

Semantic tokens live in `tokens/_semantic.scss` and define the design system's shared color vocabulary — background, border, fill, icon, and text colors with light and dark mode values. They sit between the raw base primitives and component-specific tokens.

### Naming

Semantic token names map from the design system CSV by replacing dots and underscores with hyphens:

| CSV name | CSS custom property |
|----------|-------------------|
| `affirm.color.bg.primary` | `--affirm-color-bg-primary` |
| `affirm.color.bg.primary.on_dark.static` | `--affirm-color-bg-primary-on-dark-static` |
| `affirm.color.fill.accent.series_a.high` | `--affirm-color-fill-accent-series-a-high` |

### Categories

| Category | Prefix | Count | Examples |
|----------|--------|-------|---------|
| Background | `--affirm-color-bg-*` | 9 | primary, secondary, tertiary + brand/inverse variants |
| Border | `--affirm-color-border-*` | 11 | emphasis, primary, secondary + separation variants |
| Fill | `--affirm-color-fill-*` | 14 | accent series (a–d), neutral, brand |
| Icon | `--affirm-color-icon-*` | 18 | critical, info, link, primary, secondary, success, warning |
| Text | `--affirm-color-text-*` | 16 | critical, info, link, primary, secondary, success, warning |

### Using semantic tokens

Reference them anywhere via `var()`, the same as component tokens:

```scss
.my-card {
  background: var(--affirm-color-bg-secondary);
  color: var(--affirm-color-text-primary);
  border: 1px solid var(--affirm-color-border-primary);
}

.my-card__icon {
  color: var(--affirm-color-icon-secondary);
}
```

### Theming semantic tokens

Override them in a theme folder using compound selectors, just like component tokens:

```scss
// tokens/themes/rufus/_semantic.scss
@use 'sass:map';
@use '../../base-colors' as *;

[data-theme='rufus'][data-mode='light'] {
  --affirm-color-bg-primary-brand: #{map.get($base-colors, 'red-100')};
  --affirm-color-text-primary-brand: #{map.get($base-colors, 'red-800')};
}

[data-theme='rufus'][data-mode='dark'] {
  --affirm-color-bg-primary-brand: #{map.get($base-colors, 'red-600')};
  --affirm-color-text-primary-brand: #{map.get($base-colors, 'red-200')};
}
```

Only declare tokens that differ from the defaults. Everything else inherits from `_semantic.scss`.

### Semantic tokens vs. global app tokens vs. component tokens

- **Semantic tokens** (`_semantic.scss`) — the shared color vocabulary for the design system (e.g., "what is the primary background color?"). No interaction states.
- **Global app tokens** (`_global.scss`) — spacing, radius, fonts, plus interaction-state colors for generic HTML elements used by `ui.scss` (e.g., hover/pressed/disabled).
- **Component tokens** (`components/<Name>/_tokens.scss`) — fine-grained per-state tokens for a specific component (e.g., checkbox indicator background when selected and hovered).

Components can reference semantic tokens via `var()` for values that align (e.g., label text color resolving to `var(--affirm-color-text-primary)`).

## Typography tokens

Typography tokens live in `tokens/_typography.scss` and define the full type scale for both consumer-facing content (headlines and body text) and internal DS components. Unlike color tokens, typography tokens are mode-independent — they do not change between light and dark mode.

### Token groups

| Group | Prefix | Purpose |
|-------|--------|---------|
| Semantic font families | `--affirm-semantic-font-family-*` | Headline (Axiforma) and body (Calibre) typefaces |
| Semantic weights | `--affirm-semantic-weight-*` | Generic emphasis levels + per-category overrides |
| Semantic sizes | `--affirm-semantic-size-*` | Font sizes for body (XLarge–Small) and headline (XXLarge–Small) |
| Semantic line heights | `--affirm-semantic-line-height-*` | Per-size line heights for body and headline |
| Semantic letter spacing | `--affirm-semantic-letter-spacing-*` | Per-size tracking for body and headline |
| Semantic paragraph | `--affirm-semantic-paragraph-*` | Paragraph spacing for body sizes |
| Component font family | `--affirm-component-font-family` | Typeface for DS components (Calibre) |
| Component weights | `--affirm-component-weight-*` | default / midImp / highImp |
| Component sizes | `--affirm-component-size-*` | XLarge through XSmall |
| Component line heights | `--affirm-component-line-height-*-tight` / `*-default` | Two densities: tight (single-line) and default (paragraph) |
| Component letter spacing | `--affirm-component-letter-spacing-*` | Per-size tracking |
| Component paragraph | `--affirm-component-paragraph-*` | Paragraph spacing per size |

### Naming

CSV paths map to CSS custom properties the same way as color tokens — dots to hyphens, camelCase to kebab-case:

| CSV path | CSS custom property |
|----------|-------------------|
| `semantic.fontFamily.headline` | `--affirm-semantic-font-family-headline` |
| `semantic.size.body.XLarge` | `--affirm-semantic-size-body-xlarge` |
| `semantic.lineHeight.headline.Large` | `--affirm-semantic-line-height-headline-large` |
| `component.size.XLarge` | `--affirm-component-size-xlarge` |
| `component.lineHeight.XLarge • tight` | `--affirm-component-line-height-xlarge-tight` |
| `component.lineHeight.XLarge • default` | `--affirm-component-line-height-xlarge-default` |

Weight strings from the CSV are mapped to numeric CSS font-weight values: Regular=400, Medium=500, Semibold=600, Bold=700.

### Using typography tokens

```scss
.affirm-headline {
  font-family: var(--affirm-semantic-font-family-headline);
  font-weight: var(--affirm-semantic-weight-headline-large);
  font-size: var(--affirm-semantic-size-headline-large);
  line-height: var(--affirm-semantic-line-height-headline-large);
  letter-spacing: var(--affirm-semantic-letter-spacing-headline-large);
}

.affirm-label {
  font-family: var(--affirm-component-font-family);
  font-weight: var(--affirm-component-weight-default);
  font-size: var(--affirm-component-size-medium);
  line-height: var(--affirm-component-line-height-medium-tight);
}
```

### Theming typography

Typography tokens live in `:root` (specificity 0,0,1). Themes override them with `[data-theme]` (specificity 0,1,0):

```scss
// tokens/themes/rufus/_typography.scss
[data-theme='rufus'] {
  --affirm-semantic-font-family-headline: 'Custom Brand Font', sans-serif;
  --affirm-semantic-size-headline-xxlarge: 48px;
  --affirm-semantic-weight-headline-xxlarge: 700;
}
```

### Relationship to `_global.scss` font-family vars

`_global.scss` defines three legacy font-family vars (`--affirm-font-family-brand`, `--affirm-font-family-body`, `--affirm-font-family-component`) that are consumed by `ui.scss`. These coexist with the new typography tokens and carry the same values. Existing consumers do not need to migrate.

## Typography component

A single `<Type>` component renders all semantic typography styles. Its `variant` and `color` props mirror Figma token paths directly so engineers can copy values straight from design specs.

### `<Type>`

```tsx
import { Type } from './design-system';

{/* Figma: affirm.typography.headline.large + affirm.color.text.primary */}
<Type variant="headline.large">Account Summary</Type>

{/* Figma: affirm.typography.body.medium + affirm.color.text.secondary */}
<Type variant="body.medium" color="text.secondary">Regular paragraph</Type>

{/* Figma: affirm.typography.body.small.highImp + affirm.color.text.critical */}
<Type variant="body.small.highImp" color="text.critical" strikethrough>Was $50/mo</Type>

{/* Override the rendered HTML element */}
<Type variant="body.small" as="span" color="text.link">Inline link</Type>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TypeVariant` (required) | — | Typography style matching Figma token path |
| `color` | `TypeColor` | `'text.primary'` | Text color matching Figma semantic color token path |
| `strikethrough` | `boolean` | `false` | Applies `text-decoration: line-through` |
| `as` | `TypeElement` | auto | Override rendered HTML element |
| `className` | `string` | — | Additional CSS classes |
| `ref` | `Ref<HTMLElement>` | — | Forwarded ref |

### Variant values

Headline (Axiforma typeface):
`'headline.xxlarge'` · `'headline.xlarge'` · `'headline.large'` · `'headline.medium'` · `'headline.small'`

Body default (Calibre typeface):
`'body.xlarge'` · `'body.large'` · `'body.medium'` · `'body.small'`

Body high emphasis:
`'body.xlarge.highImp'` · `'body.large.highImp'` · `'body.medium.highImp'` · `'body.small.highImp'`

### Color values

All 16 semantic text colors from `_semantic.scss`: `'text.primary'` · `'text.primary.brand'` · `'text.primary.inverse'` · `'text.secondary'` · `'text.secondary.brand'` · `'text.secondary.inverse'` · `'text.link'` · `'text.link.inverse'` · `'text.critical'` · `'text.info'` · `'text.success'` · `'text.warning'` · plus static variants.

### Default HTML element mapping

| Variant prefix | Default element |
|----------------|-----------------|
| `headline.xxlarge`, `headline.xlarge` | `<h1>` |
| `headline.large` | `<h2>` |
| `headline.medium` | `<h3>` |
| `headline.small` | `<h4>` |
| `body.*` | `<p>` |

Override with the `as` prop: `'h1'`–`'h6'`, `'p'`, `'span'`, `'label'`, `'div'`.

### How color works

The `color` prop sets a `--affirm-type-color` CSS custom property on the element, which the SCSS consumes. The prop value maps to the corresponding semantic token by converting dots/underscores to hyphens:

| `color` prop | Resolved CSS variable |
|--------------|----------------------|
| `'text.primary'` | `var(--affirm-color-text-primary)` |
| `'text.primary.brand'` | `var(--affirm-color-text-primary-brand)` |
| `'text.link'` | `var(--affirm-color-text-link)` |

### Component-level typography

The `--affirm-component-*` tokens (XLarge–XSmall, tight/default densities, 3 emphasis levels) are for DS component authors who need fine-grained control inside component SCSS. Reference them directly via `var()` — these are not wrapped in the `Type` component.

## How to add a component

1. **Create the folder** `components/<ComponentName>/` with four files:

   - `<ComponentName>.tsx` — React component
   - `<ComponentName>.scss` — BEM styles using `var(--affirm-*)` references
   - `_tokens.scss` — Default token definitions
   - `index.ts` — Barrel export

2. **Define tokens in `_tokens.scss`** following the naming convention from the token CSV:

   ```scss
   @use 'sass:map';
   @use '../../tokens/base-colors' as *;
   @use '../../tokens/base-sizes' as *;

   // Mode-independent tokens (sizes, spacing, radius)
   :root {
     --affirm-size-button-height: #{map.get($base-sizes, '500')};
     --affirm-radius-button-all: #{map.get($base-sizes, '100')};
   }

   // Light mode colors
   [data-mode='light'] {
     --affirm-color-button-bg-resting: #{map.get($base-colors, 'indigo-950')};
     --affirm-color-button-bg-hover: #{map.get($base-colors, 'indigo-700')};
     --affirm-color-button-text-resting: #{map.get($base-colors, 'gray-white')};
   }

   // Dark mode colors
   [data-mode='dark'] {
     --affirm-color-button-bg-resting: #{map.get($base-colors, 'indigo-300')};
     --affirm-color-button-bg-hover: #{map.get($base-colors, 'indigo-200')};
     --affirm-color-button-text-resting: #{map.get($base-colors, 'gray-950')};
   }
   ```

3. **Write styles in `<ComponentName>.scss`** — reference tokens only, never hardcode values:

   ```scss
   .affirm-button {
     height: var(--affirm-size-button-height);
     border-radius: var(--affirm-radius-button-all);
     background: var(--affirm-color-button-bg-resting);
     color: var(--affirm-color-button-text-resting);

     &:hover {
       background: var(--affirm-color-button-bg-hover);
     }
   }
   ```

4. **Register the tokens** by adding an import to `tokens/_index.scss`:

   ```scss
   @use '../components/Button/tokens';
   ```

5. **Export the component** from `components/index.ts` and `design-system/index.ts`.

## How to add a theme

Themes are sparse override folders. They only declare the CSS custom properties that differ from the defaults.

1. **Create the folder** `tokens/themes/<theme-name>/` with:

   - `_<component>.scss` — overrides for each component that differs
   - `_index.scss` — forwards all component overrides in this theme

2. **Define overrides** using compound selectors:

   ```scss
   @use 'sass:map';
   @use '../../base-colors' as *;

   [data-theme='rufus'][data-mode='light'] {
     --affirm-color-button-bg-resting: #{map.get($base-colors, 'red-800')};
     --affirm-color-button-bg-hover: #{map.get($base-colors, 'red-600')};
   }

   [data-theme='rufus'][data-mode='dark'] {
     --affirm-color-button-bg-resting: #{map.get($base-colors, 'red-200')};
     --affirm-color-button-bg-hover: #{map.get($base-colors, 'red-300')};
   }
   ```

   Any tokens not overridden (sizes, spacing, other colors) inherit from the component defaults.

3. **Register the theme** by adding an import to `tokens/_index.scss`:

   ```scss
   @use 'themes/rufus';
   ```

4. **No JavaScript changes needed.** The `ThemeProvider` already supports any theme name via `setTheme()`.

## How specificity works

The CSS cascade resolves the correct values automatically:

- `[data-mode='light']` (specificity 0,1,0) sets the default light mode values
- `[data-theme='rufus'][data-mode='light']` (specificity 0,2,0) overrides naturally — two attribute selectors always beat one

No `!important`, no source-order fragility.

## ThemeProvider

Wrap your app with `ThemeProvider` to enable theming:

```tsx
import { ThemeProvider } from './design-system';

<ThemeProvider defaultTheme="affirm" defaultMode="auto">
  <App />
</ThemeProvider>
```

Props:
- `defaultTheme` — theme name (default: `'affirm'`)
- `defaultMode` — `'light'` | `'dark'` | `'auto'` (default: `'auto'`, follows OS preference)

### Accessing theme state in components

```tsx
import { useTheme } from './design-system';

const { theme, mode, setTheme, setMode } = useTheme();

setTheme('rufus');     // switch theme
setMode('dark');       // force dark mode
setMode('auto');       // follow OS preference
```

Most components don't need `useTheme()` at all — they consume tokens via CSS custom properties.

## Token naming convention

Token names follow a structured pattern that maps 1:1 from the design system CSV:

```
affirm.{foundation}.{component}.{part}.{property}.{state}.{interaction}
```

In CSS this becomes:

```
--affirm-{foundation}-{component}-{part}-{property}-{state}-{interaction}
```

For example:
- CSV: `affirm.color.checkbox.indicator.bg.selected.resting`
- CSS: `--affirm-color-checkbox-indicator-bg-selected-resting`

## Custom one-off overrides

Override any token at any CSS scope without touching the theme system:

```scss
.custom-branded-section {
  --affirm-color-button-bg-resting: #ff6600;
}
```
