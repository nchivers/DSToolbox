# Token Naming Rules

This file defines how **component token names** are built from segments. The CSV review skill uses it to validate that each segment in the CSV aligns with these rules. Segment order and allowed values follow the design system naming rules below.

---

## Segment order (left to right)

Token names are dot-separated segments in this order:

1. **Namespace**
2. **Foundation**
3. **Component**
4. **Variant** (optional)
5. **Size-Variant** (optional)
6. **Context** (optional)
7. **Polarity** (optional)
8. **Persistence** (optional)
9. **Part** (optional)
10. **Part-Variant** (optional, subcomponents)
11. **Subpart** (optional, subcomponents)
12. **Property**
13. **State** (optional)
14. **Interaction** (optional)

Bracketed segments are optional and may be omitted when not applicable.

---

## Controlled vocabularies by segment

### Namespace

- **Purpose:** Theme of the system.
- **Allowed:** For consumer-facing, logged-in experiences use `affirm`. Other namespaces per theme.
- **Example:** `affirm.color.link.text.resting`

### Foundation

- **Purpose:** Token category (primitive type).
- **Allowed:** `color`, `size`, `spacing`, `radius`, `shadow`, `opacity`, `motion`, `position`
- **Example:** `affirm.color.link.text.resting`, `affirm.size.link.medium.icon.all`

### Component

- **Purpose:** Name of the component.
- **Allowed:** Component name with **underscores** in place of spaces (e.g. `toggle_button`, `button_group`, `date_picker`). No spaces.
- **Example:** `affirm.color.link.text.resting`, `affirm.radius.toggle_button.track.all.resting`

### Variant

- **Purpose:** Main variant of the component that does **not** include size; use underscores for spaces.
- **Allowed:** Variant name with underscores. For boolean-controlled variants:
  - If there is a clear default that impacts various aspects: use `default` for the default variant; the alternate derives its name from the boolean property (e.g. `default` vs `inset` for a card).
  - If the boolean controls visibility of an element (e.g. icon, border): name accordingly.
- **Example:** `affirm.color.card.default.container.bg.resting`, `affirm.color.card.inset.container.bg.resting`

### Size-Variant

- **Purpose:** Size when the component’s appearance or behavior differs by size.
- **Allowed:** `xxsmall`, `xsmall`, `small`, `medium`, `large`, `xlarge`, `xxlarge`
- **Example:** `affirm.size.link.large.icon.all`, `affirm.size.link.medium.icon.all`

### Context

- **Purpose:** Context in which the token is used.
- **Allowed:** `neutral`, `on_color`, `elevated`

### Polarity

- **Purpose:** Normal vs inverse.
- **Allowed:** `inverse` (omit segment if normal)

### Persistence

- **Purpose:** Normal vs static.
- **Allowed:** `static` (omit segment if normal)

### Part

- **Purpose:** Name of the element within the component (or the subcomponent name if the token targets a subcomponent).
- **Allowed:** Examples — `container`, `label`, `icon`, `track`, `fill`, `divider`, `content`, `outline`, `indicator`. For subcomponents, use the subcomponent’s name as the part.
- **Example:** `affirm.color.link.container.bg.resting`, `affirm.radius.link.container.top.resting`

### Part-Variant (subcomponents)

- **Purpose:** Variant of the subcomponent named in Part. Same value rules as **Variant**.
- **Allowed:** Same as Variant segment.

### Subpart (subcomponents)

- **Purpose:** Element within the subcomponent receiving the token.
- **Allowed:** Same kinds of values as Part — `container`, `label`, `icon`, `track`, `fill`, `divider`, `content`, `outline`, `indicator`

### Property

- **Purpose:** The specific property being tokenized; depends on **Foundation**.
- **Allowed:**
  - **Color:** `text`, `icon`, `fill`, `bg`, `border`, `outline`, `shadow`, `gradient_start`, `gradient_end`, `opacity`, `indicator`
  - **Size:** `height`, `width`, `min_width`, `max_width`, `min_height`, `max_height`, `all` (use `all` when element has 1:1 aspect ratio instead of separate height/width)
  - **Spacing:** `padding`, `padding_x`, `padding_y`, `padding_top`, `padding_right`, `padding_bottom`, `padding_left`, `margin`, `margin_x`, `margin_y`, `margin_top`, `margin_left`, `margin_right`, `margin_bottom`, `inset`, `offset`, `gap`, `gap_x`, `gap_y`
  - **Radius:** `all`, `top_left`, `top_right`, `bottom_left`, `bottom_right`, `top`, `left`, `bottom`, `right`
  - **Position:** `z`, `top`, `left`, `bottom`, `right`
  - **Motion:** `transition`, `duration`, `easing`
  - **Shadow:** `composite`, `offset_x`, `offset_y`, `blur`, `spread`
  - **Opacity:** `container`
- **Example:** `affirm.color.link.text.resting` (property `text`), `affirm.spacing.link.gap_x` (property `gap_x`)

### State

- **Purpose:** Component or element state (not interaction).
- **Allowed:** `default`, `checked`, `selected`, `unselected`, `open`, `closed`, `error`, `success`, `indeterminate`, `complete`, `empty`, `filled`
- **Composite states** (multiple states apply): `error_unselected`, `error_selected`, `error_empty`, `error_filled`, `open_filled`, `open_empty`, `error_open_filled`, `error_open_empty`
- **Example:** Tokens that carry state in addition to interaction.

### Interaction

- **Purpose:** Interaction state.
- **Allowed:** `resting`, `hover`, `focus`, `focus_visible`, `pressed`, `disabled`, `loading`, `stretched`
- **Example:** `affirm.color.link.text.resting`, `affirm.color.link.text.focus_visible`

### Handling error tokens

Error states (`error`, `error_selected`, `error_unselected`, `error_empty`, `error_filled`, and other error-prefixed composite states) **do not require** corresponding tokens with interaction `disabled`. A component is typically not in an error state and disabled at the same time, so omit disabled tokens for error-state tokens. The CSV review should not flag “logically missing” tokens for error states that lack a `disabled` interaction variant.

---

## Token-building patterns (required)

The reviewer should validate tokens against these patterns. Segments in square brackets are optional.

### Icons

- **Color:** `affirm.color.{component}[.{variant}][.{size-variant}][.{context}][.{polarity}][.{persistence}][.{part}][.{part-variant}][.{subpart}].icon[.{state}][.{interaction}]` — `icon` is the property.
- **Size:** `affirm.size.{component}[.{variant}][.{size-variant}][.{context}][.{polarity}][.{persistence}].icon[.{part-variant}][.{subpart}].all[.{state}][.{interaction}]` — `icon` is part/subpart; property is `all`, `width`, `height`, etc.

### Borders vs dividers

- **Borders (attached to an object):**
  - Color: `affirm.color.{component}[...][.{part}][.{part-variant}][.{subpart}].border[.{state}][.{interaction}]` — `border` is the property.
  - Size: `affirm.size.{component}[...].border[.{part-variant}][.{subpart}].width[.{state}][.{interaction}]` — `border` is part/subpart; property is `width`. For a single side: e.g. `border_bottom` as part/subpart, then `width` as property.
- **Dividers (standalone):**
  - Color: `affirm.color.divider[.{variant}][...][.{part}][.{part-variant}][.{subpart}].TBD[.{state}][.{interaction}]`
  - Size: `affirm.size.divider[.{variant}][...][.{part}][.{part-variant}][.{subpart}].thickness[.{state}][.{interaction}]` — `thickness` is the property.

### Shadows

- **Color:** `affirm.color.{component}[...][.{part}][.{part-variant}][.{subpart}].shadow[.{state}][.{interaction}]` — `shadow` is the property.
- **Position (shadow offset):** `affirm.shadow.{component}[...].shadow[.{part-variant}][.{subpart}].offset_x` (and `offset_y`) — first `shadow` is foundation, second is part/subpart; property is `offset_x` or `offset_y`.
- **Size:** `affirm.shadow.{component}[...].shadow[.{part-variant}][.{subpart}].blur` or `.spread` — first `shadow` is foundation, second is part/subpart; property is `blur` or `spread`.
- **Shadow composite:** `affirm.shadow.{component}[...][.{part}][.{part-variant}][.{subpart}].composite[.{state}][.{interaction}]` — foundation is `shadow`; property is `composite`.

### Opacity

- **Opacity (component or part, not combined with fill/stroke color):** `affirm.opacity.{component}[...][.{part}][.{part-variant}][.{subpart}].container[.{state}][.{interaction}]` — `opacity` is foundation; `container` is property.

### Focus-visible

Focus-visible often uses a color change plus a visible **outline** (not `border`). Figma outlines are tokenized as `outline`.

- **Color (outline):** `affirm.color.{component}[...][.{part}][.{part-variant}][.{subpart}].outline[.{state}].focus_visible` — only the outline’s border needs a color token; fill should be transparent.
- **Radius:** Outline typically does not have a radius token (code usually doesn’t accept radius for outline).
- **Spacing (offset):** `affirm.spacing.{component}[...].outline[.{part-variant}][.{subpart}].offset[.{state}].focus_visible` — pixels between outline and component edge; `outline` may be part or subpart; property is `offset`.
- **Size (width):** `affirm.size.{component}[...].outline[.{part-variant}][.{subpart}].width[.{state}].focus_visible` — outline thickness; property is `width`.

### Transparent backgrounds

- Use the base token **`opacity.000`** for transparent backgrounds, not a color base token with alpha (e.g. not a color with `.a00`).

---

## Single-mode vs dual-mode (assignments)

- **Single-mode (use "All Modes" column only):** `size`, `spacing`, `radius`, `position`, `motion`, `opacity` (when used as foundation for a single value)
- **Dual-mode (use "Light Mode" and "Dark Mode" columns):** `color`, `shadow` (composite and color tokens that differ by theme)

The CSV review uses this to flag tokens missing required assignments.
