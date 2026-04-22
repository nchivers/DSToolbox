---
name: build-ds-component
description: >-
  Build a design system component from a Figma component link and token CSV.
  Use when the user wants to build, create, or implement a design system
  component, mentions a Figma component URL with a token CSV, or says
  "build ds component", "create component from Figma", or "implement component".
  Reads input.json and a named CSV from the input/ folder, analyzes the Figma
  component via MCP, produces an implementation plan, collects feedback, then
  builds the component into src/design-system/.
---

# Build Design System Component

Orchestrates a full workflow: validate inputs, analyze a Figma component via MCP, parse a token CSV, produce an implementation plan, iterate on feedback, then build the component.

## Prerequisites

- Figma MCP server (`plugin-figma-figma`) must be connected and authenticated.
- The user must have filled in `input.json` and placed the token CSV in the `input/` folder before invoking this skill. Both files live alongside this SKILL.md at `.cursor/skills/build-ds-component/`.
- Read [reference.md](reference.md) now for the design system architecture patterns you will need throughout this workflow.

---

## Phase 1: Validate Inputs

**You MUST complete this phase before doing anything else.**

### 1a. Read `input.json`

Read `.cursor/skills/build-ds-component/input.json`. It contains:

```json
{
  "figmaUrl": "https://figma.com/design/<fileKey>/<fileName>?node-id=<nodeId>",
  "componentName": "Button"
}
```

- If `figmaUrl` is empty or missing, stop and tell the user: *"Please fill in `figmaUrl` in `.cursor/skills/build-ds-component/input.json` and try again."*
- If `componentName` is empty or missing, stop and tell the user: *"Please fill in `componentName` in `.cursor/skills/build-ds-component/input.json` and try again."*
- `componentName` must be PascalCase (e.g., `Button`, `RadioGroup`, `InputText`).

### 1b. Parse the Figma URL

Extract `fileKey` and `nodeId` from the URL:
- `figma.com/design/:fileKey/:fileName?node-id=:nodeId` -- replace `-` with `:` in the nodeId query param.
- `figma.com/design/:fileKey/branch/:branchKey/:fileName` -- use `branchKey` as fileKey.

### 1c. Locate the token CSV

Derive the CSV path: `.cursor/skills/build-ds-component/input/<componentName>.csv`

- If the file does not exist, stop and tell the user: *"Please place the token CSV at `.cursor/skills/build-ds-component/input/<ComponentName>.csv` and try again."*
- Read the CSV to confirm it is non-empty and parseable.

### 1d. Ask for additional guidance

Ask the user conversationally if they have any extra context: behavioral notes, accessibility requirements, naming preferences, sub-component relationships, or anything else. This is optional -- proceed if they have nothing to add.

---

## Phase 2: Analyze Figma Component

Use the Figma MCP tools to build a complete picture of the component. Call these tools using the `fileKey` and `nodeId` from Phase 1.

### Tool calls

Run these in order. Each produces information the next steps depend on.

1. **`get_screenshot`** -- Visual reference. Parameters: `fileKey`, `nodeId`.

2. **`get_design_context`** -- Code hints, contextual metadata, component documentation links. Parameters: `fileKey`, `nodeId`. Leave `excludeScreenshot` false to get an additional screenshot with context.

3. **`get_context_for_code_connect`** -- Structured component API: all properties with types, variant options, and the descendant tree (nested instances, text nodes, property references). Parameters: `fileKey`, `nodeId`.

4. **`get_metadata`** -- XML layer tree: node IDs, layer types, names, positions, sizes. Gives you the structural hierarchy. Parameters: `fileKey`, `nodeId`.

5. **`get_variable_defs`** -- Variable definitions bound to the node. Shows which Figma variables map to which properties. Parameters: `fileKey`, `nodeId`.

### Synthesize findings

After all tool calls complete, compile a structured summary:

- **Layer tree**: The hierarchical structure of the component (container > track > handle, etc.). Map each layer to a candidate BEM element name.
- **Component API**: Every property, its type (`boolean`, `enum`, `text`, `instanceSwap`), variant values, and defaults (see mapping table below).
- **Variable bindings**: Which Figma variables are bound to which layer properties (fills, strokes, sizing, spacing, etc.).
- **Visual states**: All states represented in the component set (resting, hover, pressed, focus-visible, disabled, error, selected/unselected, etc.).
- **Typography**: Any text layers and their typography settings.

### Map Figma properties to TypeScript props

Figma exposes exactly four property types in the design panel. Every component prop MUST trace back to one of these. Use the table below to derive the TypeScript type:

| Figma property type | What the developer sees in Figma | TypeScript pattern | Example |
|---------------------|----------------------------------|-------------------|---------|
| **Boolean** | Toggle (true/false). Controls visibility, selection state, or feature flag. | `propName?: boolean` with a default. | Figma "Disabled" → `disabled?: boolean` (default `false`) |
| **Enum (variant)** | Dropdown with named options (e.g., Size: small, medium, large). | Exported union type alias + prop that uses it. | Figma "Size: small \| medium \| large" → `export type ButtonSize = 'small' \| 'medium' \| 'large';` then `size?: ButtonSize` (default the Figma default) |
| **Text** | Editable string content for a text layer. | `propName: string` (required if no sensible default) or `propName?: string`. | Figma "Label" → `label: string` |
| **Instance swap** | Slot that accepts a component instance (icons, illustrations, custom content). | `propName?: React.ReactNode` — let the consumer pass any renderable content. If the slot is icon-specific and your DS has an `IconName` type, accept both: `propName?: React.ReactNode \| IconName`. | Figma "Start Icon" → `startIcon?: React.ReactNode` |

**Naming rules:**

- **One Figma property = one TypeScript prop.** Never decompose a single Figma enum into multiple props. If Figma has one "Variant" property with values like "Primary", "Primary.Inverse", "Secondary", keep it as a single `variant` prop with all values in the union type.
- Use the Figma property name converted to camelCase as the prop name. E.g., Figma "Label Position" → `labelPosition`, Figma "Show Icon" → `showIcon`.
- **Enum values** are converted to kebab-case: dots, spaces, and camelCase boundaries become hyphens, then lowercase. E.g., Figma "Primary.Inverse" → `'primary-inverse'`, "Extra Small" → `'extra-small'`.
- If a Figma boolean controls visibility of an instance swap slot, you may omit the boolean and derive visibility from the slot prop's presence: Figma "Has Icon" (boolean) + "Icon" (instance swap) → single `icon?: React.ReactNode` prop where `undefined` means hidden.
- If a Figma enum has values like "True / False", treat it as a boolean prop.
- Figma "Interaction" enums (resting, hover, pressed, disabled, focused) are NOT props — they map to CSS pseudo-classes and BEM modifiers driven by interaction. Do not expose them in the TypeScript API.

Present this summary to the user before proceeding.

---

## Phase 3: Parse Token CSV

### 3a. Read and group tokens

Read the CSV from Phase 1c. Group rows by their foundation prefix:

| Foundation prefix | Scope | CSS selector |
|-------------------|-------|-------------|
| `affirm.color.*` | Mode-dependent | `[data-mode='light']` / `[data-mode='dark']` |
| `affirm.size.*` | Mode-independent | `:root` |
| `affirm.radius.*` | Mode-independent | `:root` |
| `affirm.spacing.*` | Mode-independent | `:root` |

### 3b. Map token paths to CSS custom properties

Convert CSV paths to CSS variable names by replacing dots and underscores with hyphens:

```
affirm.color.button.bg.resting  -->  --affirm-color-button-bg-resting
affirm.size.button.height       -->  --affirm-size-button-height
```

### 3c. Map values to SCSS expressions

- Color values map to: `#{map.get($base-colors, '<value>')}`
- Size values map to: `#{map.get($base-sizes, '<value>')}`

The CSV columns determine which mode block each value belongs to:
- "All Modes" column --> `:root` block
- "Light Mode" column --> `[data-mode='light']` block
- "Dark Mode" column --> `[data-mode='dark']` block

### 3d. Cross-reference with Figma bindings

Compare the token names from the CSV with the variable bindings from Phase 2. This helps you understand which tokens apply to which layers and CSS properties. **The CSV is the source of truth** -- if there are discrepancies between Figma bindings and the CSV, follow the CSV.

Note any tokens in the CSV that do not appear in Figma bindings (they may be for states only visible via interaction) and any Figma bindings not in the CSV (these should use semantic tokens or be flagged to the user).

---

## Phase 4: Generate Implementation Plan

Produce a detailed plan covering all files. Use the `CreatePlan` tool to present it. The plan MUST cover:

### 4a. `_tokens.scss`

All CSS custom properties from the CSV, organized into three blocks:

```scss
@use 'sass:map';
@use '../../tokens/base-colors' as *;
@use '../../tokens/base-sizes' as *;

:root {
  // Size, radius, spacing tokens (mode-independent)
}

[data-mode='light'] {
  // Color tokens for light mode
}

[data-mode='dark'] {
  // Color tokens for dark mode
}
```

Group tokens within each block by component part (container, indicator, label, track, handle, etc.) with comment headers. Follow the exact patterns in existing `_tokens.scss` files -- read `src/design-system/components/Checkbox/_tokens.scss` or `src/design-system/components/Switch/_tokens.scss` as your structural template.

### 4b. `<ComponentName>.scss`

BEM styles that consume the tokens. The plan should specify:

- **BEM block**: `affirm-<kebab-case-name>` (e.g., `affirm-radio-group`)
- **BEM elements**: One per significant Figma layer (e.g., `__track`, `__handle`, `__label`, `__input`)
- **BEM modifiers**: One per boolean/enum prop that changes appearance (e.g., `--selected`, `--disabled`, `--error`)
- **State styling order**: Resting styles first, then interaction states (`:hover`, `:active`, `:has(&__input:focus-visible)`), grouped by modifier combination (unselected, selected, error, error+selected, disabled, disabled+selected).
- **Typography**: Use `@use '../../tokens/component-type' as typography;` and `@include typography.component-*` mixins for text elements.
- **Layout**: Use token-driven sizing (`var(--affirm-size-*)`, `var(--affirm-spacing-*)`, `var(--affirm-radius-*)`).
- **No hardcoded values**: Every visual property must come from a `var(--affirm-*)` token or a typography mixin.

Reference existing SCSS files for patterns. For compound modifier selectors, use the `#{&}` interpolation pattern from Switch.scss: `&--error#{&}--selected`.

### 4c. `<ComponentName>.tsx`

React component following established patterns:

- `import * as React from 'react';`
- Side-effect SCSS import: `import './<ComponentName>.scss';`
- Relative imports for shared components (e.g., `import { Icon } from '../Icon';`)

**Explicit prop typing (MANDATORY):**

- `export interface <ComponentName>Props { ... }` with every prop explicitly declared.
- **NEVER extend base HTML attribute interfaces** (no `extends React.HTMLAttributes<...>`, no `extends Omit<React.InputHTMLAttributes<...>, ...>`). This leaks hundreds of irrelevant props and makes the component API unclear.
- Export union type aliases for every enum property BEFORE the interface: `export type <ComponentName>Size = 'small' | 'medium' | 'large';`
- Every prop must trace back to a Figma property from Phase 2 or be one of the standard structural props below.
- **Standard structural props** (include only the ones the component actually needs):
  - `className?: string` — custom class names on the root element
  - `disabled?: boolean` — maps to Figma "Disabled" boolean or HTML disabled attribute
  - `name?: string` — form field name (only for input-like components)
  - `id?: string` — DOM id (only for input-like components that need label association)
  - `onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void` — typed to the specific element
  - `onFocus?: (e: React.FocusEvent<...>) => void` — only if the component needs focus handling
  - `onBlur?: (e: React.FocusEvent<...>) => void` — only if the component needs blur handling
  - `onClick?: (e: React.MouseEvent<...>) => void` — only for clickable non-form elements
- If a consumer needs to pass `aria-*` or `data-*` attributes, add a focused escape hatch like `aria-label?: string` for the specific attribute, NOT a blanket `...rest` spread of all HTML attributes.

**Component structure:**

- `React.forwardRef<HTMLElement, <ComponentName>Props>` with the specific ref element type (e.g., `HTMLInputElement`, `HTMLButtonElement`, `HTMLDivElement`)
- Controlled/uncontrolled pattern for stateful components (checked, value, etc.)
- Class names built as arrays with `.filter(Boolean).join(' ')`
- `<ComponentName>.displayName = '<ComponentName>';` after the component

### 4d. `index.ts`

```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### 4e. `README.md`

A structured README that serves both developers and AI agents. The plan should confirm the following sections will be included:

1. **Header**: Component name and one-sentence description.
2. **Import**: Copy-pasteable import statement.
3. **Props table**: Every prop from the interface — name, exact TypeScript type, default value (or "—" if required), and a short description. Required props marked with **Required.** in the description.
4. **Usage examples**: One example per major variant or feature. If the component supports controlled/uncontrolled, show both. If it has slot props (icons, actions), show examples with content passed in. All examples must be valid JSX.
5. **Do / Don't table**: 3–6 rows covering common mistakes — wrong prop types, using children when the component uses named slots, hardcoding styles, forgetting accessibility, etc.
6. **Accessibility**: Keyboard interactions, ARIA attributes the component sets automatically, and anything the consumer must provide.

Follow the full template in reference.md. The README is not optional.

### 4f. Integration updates

List the exact lines to add to:

1. **`src/design-system/tokens/_index.scss`**: Add `@use '../components/<ComponentName>/tokens' as <kebab-name>-tokens;` in the component tokens section.
2. **`src/design-system/components/index.ts`**: Add `export { ComponentName } from './<ComponentName>';` and `export type { ComponentNameProps } from './<ComponentName>';`.
3. **`src/design-system/index.ts`**: Add the component and type exports from `'./components'`.

---

## Phase 5: User Feedback Loop

After presenting the plan:

1. Explicitly ask: *"Please review the plan above. Let me know if you'd like any changes, or say 'build it' when you're ready to implement."*
2. If the user requests changes, update the plan and re-present the affected sections.
3. Repeat until the user approves with a phrase like "build it", "implement it", "looks good", or "go ahead".

**Do NOT proceed to Phase 6 until the user explicitly approves.**

---

## Phase 6: Build Component

Implement the approved plan in this order:

### Step 1: Create the component directory

Create `src/design-system/components/<ComponentName>/`.

### Step 2: Write `_tokens.scss`

Write the token file exactly as specified in the plan. Use the CSV as the authoritative source for every value.

### Step 3: Write `<ComponentName>.scss`

Write the BEM stylesheet. Read at least one existing component SCSS file (e.g., `Switch.scss` or `Checkbox.scss`) right before writing to ensure pattern alignment.

### Step 4: Write `<ComponentName>.tsx`

Write the React component. Read at least one existing component TSX file right before writing to ensure pattern alignment.

### Step 5: Write `index.ts`

Write the barrel export file.

### Step 6: Write `README.md`

Write the component README following the template in reference.md. Populate it from the data already gathered:

- **Props table**: Derive directly from the `<ComponentName>Props` interface you just wrote. Every prop must appear.
- **Usage examples**: Write realistic, copy-pasteable JSX. Cover: basic usage, each major variant/size/emphasis, controlled vs uncontrolled (if applicable), slot props with content, error state, and disabled state.
- **Do / Don't**: Think about what an agent or unfamiliar developer would get wrong. Common pitfalls: passing `children` to a component that uses named slot props, using wrong prop types (e.g., string instead of union literal), hardcoding colors instead of using the component's built-in variants, forgetting required props.
- **Accessibility**: Document keyboard behavior, auto-applied ARIA attributes, and any consumer responsibilities (e.g., `aria-label` for icon-only usage).

### Step 7: Register tokens

Add the `@use` import to `src/design-system/tokens/_index.scss`, placed alphabetically among the existing component token imports.

### Step 8: Export from components barrel

Add the component and type exports to `src/design-system/components/index.ts`, placed alphabetically.

### Step 9: Export from root barrel

Add the component and type exports to `src/design-system/index.ts`.

### Step 10: Verify

Run linter checks on all new and modified files. Fix any errors introduced.

---

## Rules

- **NEVER hardcode colors, sizes, or spacing** in SCSS. Always use `var(--affirm-*)` tokens.
- **NEVER use a classnames library.** Use the array + filter + join pattern.
- **NEVER extend base HTML attribute interfaces** (`React.HTMLAttributes`, `React.InputHTMLAttributes`, etc.) or use `Omit<>` wrappers on them. Declare every prop explicitly.
- **ALWAYS export union type aliases** for enum/variant properties before the props interface. Name them `<ComponentName><PropertyName>` (e.g., `ButtonSize`, `SwitchLabelPosition`).
- **ALWAYS map props 1:1 to Figma properties.** One Figma property = one TypeScript prop. Never split a single Figma enum into multiple props (e.g., do NOT decompose a "Variant" enum with values "Primary" and "Primary.Inverse" into separate `variant` + `inverse` props). Every prop must trace back to a Figma boolean, enum, text, or instance swap property — or be a standard structural prop (`className`, `disabled`, `name`, `id`, event handlers).
- **ALWAYS use `React.forwardRef`** and set `displayName`.
- **CSV is the source of truth** for token assignments. Do not invent tokens not in the CSV.
- **Read existing component files** before writing new ones to ensure pattern consistency. Prefer `Checkbox`, `Switch`, `Button`, and `Icon` as templates (they use explicit prop typing). Avoid copying the `extends` pattern from `InputText`, `InputTextArea`, or `Link`.
- **Do not skip the feedback loop.** Always get user approval before building.
