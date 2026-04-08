# Token Update Plan — divider

**Generated:** 2026-04-08 14:43
**Source of truth:** inputs/component-tokens.csv
**Figma variables file:** inputs/figma-variables.json
**Suggested branch name:** divider: Update - migrate to new base color tokens

> **Note:** The base variable lookup (`tools/knowledge/figma-base-variables.csv`) was not validated against the live DS Base Library. The Figma MCP `get_variable_defs` tool requires a selected layer and could not fetch all variables from the file. The existing CSV was used as-is.

---

## Summary

| Action | Count |
|--------|-------|
| Value updates (normalized exact match) | 6 |
| Renames + updates (potential match) | 0 |
| Deletes | 0 |
| Additions | 0 |
| In sync (no changes needed) | 1 |

---

## Task 1 — Normalized exact matches (value updates only)

| CSV name | Figma name | Figma ID | Mode | Current value | Required value | Required value ID |
|----------|------------|----------|------|---------------|----------------|-------------------|
| affirm.color.divider.primary.fill | color/divider/primary/fill | `VariableID:210:23107` | Light Mode | `base/g-color/gray/100` | `base/color/gray/100` | `VariableID:4360:1125973` |
| affirm.color.divider.primary.fill | color/divider/primary/fill | `VariableID:210:23107` | Dark Mode | `base/g-color/gray/750` | `base/color/gray/700` | `VariableID:4360:1126014` |
| affirm.color.divider.primary.inverse.fill | color/divider/primary/inverse/fill | `VariableID:210:23117` | Light Mode | `base/g-color/gray/750` | `base/color/gray/700` | `VariableID:4360:1126014` |
| affirm.color.divider.primary.inverse.fill | color/divider/primary/inverse/fill | `VariableID:210:23117` | Dark Mode | `base/g-color/gray/100` | `base/color/gray/100` | `VariableID:4360:1125973` |
| affirm.color.divider.secondary.fill | color/divider/secondary/fill | `VariableID:210:23108` | Light Mode | `base/g-color/gray/150` | `base/color/gray/150` | `VariableID:4360:1125974` |
| affirm.color.divider.secondary.fill | color/divider/secondary/fill | `VariableID:210:23108` | Dark Mode | `base/g-color/gray/800` | `base/color/gray/650` | `VariableID:4360:1126013` |
| affirm.color.divider.secondary.inverse.fill | color/divider/secondary/inverse/fill | `VariableID:210:23118` | Light Mode | `base/g-color/gray/800` | `base/color/gray/650` | `VariableID:4360:1126013` |
| affirm.color.divider.secondary.inverse.fill | color/divider/secondary/inverse/fill | `VariableID:210:23118` | Dark Mode | `base/g-color/gray/150` | `base/color/gray/150` | `VariableID:4360:1125974` |
| affirm.color.divider.tertiary.fill | color/divider/tertiary/fill | `VariableID:210:23109` | Light Mode | `base/g-color/gray/200` | `base/color/gray/150` | `VariableID:4360:1125974` |
| affirm.color.divider.tertiary.fill | color/divider/tertiary/fill | `VariableID:210:23109` | Dark Mode | `base/g-color/gray/800` | `base/color/gray/650` | `VariableID:4360:1126013` |
| affirm.color.divider.tertiary.inverse.fill | color/divider/tertiary/inverse/fill | `VariableID:210:23119` | Light Mode | `base/g-color/gray/800` | `base/color/gray/650` | `VariableID:4360:1126013` |
| affirm.color.divider.tertiary.inverse.fill | color/divider/tertiary/inverse/fill | `VariableID:210:23119` | Dark Mode | `base/g-color/gray/200` | `base/color/gray/150` | `VariableID:4360:1125974` |

---

## Task 2 — Potential matches (rename and/or value update)

None.

All CSV tokens and all in-scope Figma variables were resolved by normalized exact match in Task 1.

---

## Task 3 — Deletes

None.

All in-scope Figma divider variables were matched in Task 1.

---

## Task 4 — Additions

None.

All CSV tokens were matched in Task 1.

---

## Task 5 — In sync (exact match, no changes needed)

| Token name |
|------------|
| `size/divider/thickness` (CSV: `affirm.size.divider.thickness`, Figma: `VariableID:9860:374` — CSV value `size.013` normalizes to `size/013`; Figma references `base/size/013`. The underlying token reference is the same; the CSV omits the `base.` prefix.) |
