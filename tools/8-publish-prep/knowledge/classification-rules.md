# Publish Prep classification rules

These rules define how `library_diff.py` decides what to report. They mirror how
Figma decides what to publish, so the report previews "what the next publish will
change."

## What counts as published vs not

- **Baseline = last published.** The baseline snapshot is captured in a Baselining
  File from the **remote** (subscribed) library, so it contains exactly what was last
  published. Figma never exposes hidden/private items remotely, so the baseline is
  already limited to publishable assets.
- **Baseline variables are always `hiddenFromPublishing: false`.** Because a remote
  variable can only appear in a subscribing file if it was published visibly, every
  baseline variable is visible by definition. The plugin enforces this on export
  (`imported.remote ? false : imported.hiddenFromPublishing`) because Figma's
  `importVariableByKeyAsync` currently reports `hiddenFromPublishing: true` for remote
  variables regardless of their real state. Without this, every currently-visible
  variable would be falsely flagged as a `true -> false` change. The diff script does
  no special-casing here - it trusts the snapshot.
- **Current = local working state**, including pending edits and items not yet
  published.

## Matching (current <-> baseline)

1. Match by Figma `key` when both sides have a non-empty key.
2. Otherwise match by exact `name`.

A `key` match with a different `name` is a **rename** (not an add + delete). A
never-published local item has no counterpart in the baseline, so it is treated as
**new**.

## Not-for-publish (excluded from the "new" list)

- **Variables:** `hiddenFromPublishing == true`. Figma does not publish hidden
  variables, so a new hidden variable is excluded; a previously published variable
  that is now hidden is reported under "changed" with a `hiddenFromPublishing`
  change and flagged as "will be removed on publish."
- **Styles and components:** name starts with `.` or `_`. Figma treats these
  as private and does not publish them. Adding a `.`/`_` prefix to a previously
  published style/component unpublishes it on next publish; this surfaces as a rename
  plus a "will be removed on publish" flag.
- **Styles or components matched by an exclusion pattern.** Figma's right-click "Hide
  from publishing" state is **not exposed to plugins** for styles or components (only
  variables have `hiddenFromPublishing`), so those items cannot be detected from the
  export. To cover them, `knowledge/style-publish-exclusions.md` (styles) and
  `knowledge/component-publish-exclusions.md` (components) hold glob patterns (e.g.
  `typography/DEPRICATING/*`, `wip/*`). Any current item whose full path name matches a
  pattern is treated exactly like a `.`/`_`-prefixed item: excluded from the "new"
  list if it has no baseline match, or flagged "will be removed on publish" if it was
  previously published. Matching is `fnmatch`-style and `*` spans `/`. Keep these lists
  in sync with the items hidden in Figma.

## Classification buckets (per asset type)

- **New (publish-eligible):** in current, no baseline match, and not private/hidden.
- **Changed since last publish:** matched to baseline and any tracked field differs,
  or it was renamed, or it is now private/hidden.
- **Removed on publish:** in the baseline, but no matching current item.
- **Excluded:** new but private/hidden (reported only as a count).

## Fields that count as a change (noise control)

Comparison is normalized first: floats rounded to 4 dp, colors reduced to hex,
variable aliases reduced to `@name`, and variable mode values compared by
**mode name** (mode IDs differ between a local file and a subscribed library).

- **Variables:** per-mode value, `scopes`, `hiddenFromPublishing`, `collection`,
  `resolvedType`. Variable `id` and mode IDs are intentionally ignored.
- **Styles:** type-specific properties only - PAINT `paints` (type, color, opacity,
  gradient stops, bound variables), TEXT typography props + bound variables, EFFECT
  `effects` (type, color, offset, radius, spread, bound variables), GRID layout grids,
  plus `description`. Style `id` is intentionally ignored.
- **Components:** the publishable API surface plus a curated set of internal layer
  visuals.
  - **API surface:** `componentProperties` (each property's `type`, `default`, and
    `variantOptions`/`preferredValues`), plus `documentationLinks`, `description`, and
    `type` (COMPONENT vs COMPONENT_SET). `INSTANCE_SWAP` defaults are resolved on
    export to the target component's `key` (or name) instead of a raw node ID, so a
    swapped-instance default no longer false-positives as a change between a local
    file and a subscribed library.
  - **Layer visuals (schema v3+):** the plugin serializes each component's child layer
    tree as a flat list keyed by a stable name-path (e.g. `Button/Background`). For
    each layer the diff compares `type`, `visible`, `opacity`, `fills`, `strokes`,
    `strokeWeight`/`strokeAlign`, `cornerRadius` (uniform or per-corner), auto-layout
    `layoutMode`/padding/`itemSpacing`/axis alignment, `effects`, and layer-level
    variable `boundVariables`. Layers are **matched by name-path**, not node ID (IDs
    differ local vs remote). Geometry (x/y/width/height/rotation) is intentionally
    **excluded** to avoid noise. Renaming a layer surfaces as a remove + add at the
    old/new path. `INSTANCE` layers are **not recursed into** - their internals belong
    to their own published main component (diffed separately); instead the instance's
    `mainComponent` key is captured so a swap is still detected.
  - **Backward compatibility:** layer diffing only runs when BOTH snapshots carry
    `layers` (schema v3+). If the baseline (or current) was exported with an older
    plugin, layer diffing is skipped for safety and a top-level warning is emitted
    telling the user to re-export with the updated plugin - it never floods every
    layer as "added."
  - Component `id` and the Figma `#nodeId` suffix on non-variant property names are
    intentionally ignored (the suffix is stripped on export). Variant components inside
    a component set are reported once at the set level (the set's variant children and
    their layers are all walked).

## Tunables

- `PRIVATE_PREFIXES` in `script/library_diff.py` controls the private style prefixes
  (default `.` and `_`).
