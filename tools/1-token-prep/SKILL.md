---
name: figma-token-update-plan
description: Creates a structured plan for updating Figma variables based on component-tokens.csv as the source of truth. Use when preparing to sync Figma variables with a component token CSV, before running a Figma MCP update skill. Produces a human-reviewable plan covering value updates, renames, deletions, and additions.
---
Read the input files from this workspace (paths relative to workspace root):
  - inputs/inputs.json (componentName)
  - inputs/component-tokens.csv (source of truth for all tasks)
  - inputs/figma-variables.json
  - tools/knowledge/figma-base-variables.csv (base token name → variable ID lookup)

---

# Figma Token Update Plan

You are generating a plan to bring Figma variables in sync with a component token CSV. **Do not make any Figma changes.** Output a human-readable plan file only, for review before any updates are applied.

---

## Inputs

- **Review config:** `inputs/inputs.json`
  `componentName`: the name of the component being updated (e.g. `"button"`). Use this to filter Figma variables and to name the output file.

- **Component tokens (source of truth):** `inputs/component-tokens.csv`
  CSV with a token name column (first column, or named `name` / `Full Token`) and value columns: `All Modes`, `Light Mode`, `Dark Mode`. Every non-empty row after the header is a token and is in scope — treat the CSV as the complete and authoritative token list.

- **Figma variables:** `inputs/figma-variables.json`
  JSON array of variable objects. Each has: `id`, `name`, `collection`, `resolvedType`, `valuesByMode`, `hiddenFromPublishing`, `scopes`. The `valuesByMode` map uses Figma mode IDs as keys; use the mode names in context (e.g. "All Modes", "Light", "Dark") to align with the CSV columns when comparing values.

- **Base variable lookup:** `tools/knowledge/figma-base-variables.csv`
  CSV with columns `name`, `value`, `id`. Maps every base token name (using `/` delimiters, e.g. `base/color/red/500`) to its Figma variable ID. Use this to resolve the variable ID for any required value when planning updates or additions.

---

## Component scoping — Figma variables

Only consider Figma variables whose **component segment** (the second `/`-delimited path segment, e.g. `top_nav_bar` in `color/top_nav_bar/bg`) exactly matches `componentName`. Variables where the component name appears only in a deeper segment belong to other components and must be excluded entirely from all tasks.

---

## Name normalization

The CSV and Figma use different naming conventions. Before any comparison, normalize CSV token names into Figma format using these two rules applied in order:

1. **Strip the `affirm.` namespace prefix** — remove the leading `affirm.` from the CSV name.
2. **Convert delimiter** — replace all remaining `.` separators with `/`.

**Example:** `affirm.color.top_nav_bar.main.container.bg` → `color/top_nav_bar/main/container/bg`

Use the normalized form only for matching. Always display original names (CSV format and Figma format) in the output.

---

## Base token value lookup

CSV token values reference base tokens using dot notation (e.g. `base.color.red.500`). To resolve a variable ID for any required value in a planned UPDATE or ADD:

1. Normalize the CSV value the same way as token names: replace `.` with `/` (no prefix to strip — base token values have no `affirm.` prefix).
   **Example:** `base.color.red.500` → `base/color/red/500`
2. Look up the normalized value in `tools/knowledge/figma-base-variables.csv` by matching the `name` column.
3. Use the `id` column value as the variable ID for that value.

If a value cannot be found in the lookup CSV (e.g. it is a raw primitive like `#FFFFFF` rather than an alias), note it as "no alias found" and include the raw value instead.

Always include the resolved variable ID alongside every required value in UPDATE and ADD plans.

---

## Tasks

Work through the tasks in order. Tokens resolved in an earlier task must not appear as candidates in later tasks.

### Task 1 — Normalized exact matches: identify value updates

Normalize every CSV token name using the rules above. Find all pairs where the normalized CSV name exactly matches an in-scope Figma variable name (case-sensitive, whitespace-trimmed).

A normalized exact match means the segment content is identical — the only differences are the `affirm.` prefix and `.` vs `/` delimiters, which are convention differences and **do not require a rename in Figma**.

For each normalized exact match:
- Compare the `All Modes`, `Light Mode`, and `Dark Mode` values from the CSV against the corresponding mode values in `valuesByMode`. Plan an **UPDATE** for any mode where the values differ.
- If all values already match, mark the token as **in sync** — include in Task 5.

### Task 2 — Potential matches: identify renames and value updates

For CSV tokens **not** resolved in Task 1, and for in-scope Figma variables **not** resolved in Task 1, look for likely pairs based on name similarity. Treat a pair as a potential match when the normalized CSV name and the Figma name:
- Share all or nearly all path segments in the same order with only minor differences (e.g. an extra segment in one, a segment renamed or abbreviated)
- Are plausibly the same token despite structural differences not covered by normalization

For each potential match:
- Note the CSV token name and the Figma variable name + id
- Compare `All Modes`, `Light Mode`, and `Dark Mode` values
- If the normalized CSV name and the Figma name differ in segment content (not just convention), plan a **RENAME** of the Figma variable to match the normalized CSV name (using Figma's `/` delimiter, without the `affirm.` prefix)
- Plan an **UPDATE** for any mode value discrepancies
- Assign a confidence level (High / Medium / Low) with a one-line rationale

Low-confidence pairs should be flagged for human review before acting.

### Task 3 — Deletes

In-scope Figma variables that were **not** matched in Task 1 or Task 2 (at High or Medium confidence) have no corresponding token in the CSV and should be removed from Figma.

For each, plan a **DELETE** and list the variable name and id.

### Task 4 — Additions

CSV tokens that were **not** matched in Task 1 or Task 2 (at High or Medium confidence) do not yet exist in Figma and need to be created.

For each, plan an **ADD** and include the token name and the values from the CSV (`All Modes`, `Light Mode`, `Dark Mode`).

---

## Output

Read `componentName` from `inputs/inputs.json`. Turn it into a safe filename segment (lowercase, spaces and slashes → hyphens; use `component` as fallback if missing). Use today's date and time: `YYYY-MM-DD-HH-MM`.

Write the plan to: `outputs/1-token-prep/YYYY-MM-DD-HH-MM-{componentName}-token-update-plan.md`

Use the structure below. If a section has no items, write "None." so reviewers can confirm the check ran cleanly.

---

```markdown
# Token Update Plan — {componentName}

**Generated:** YYYY-MM-DD HH:MM
**Source of truth:** inputs/component-tokens.csv
**Figma variables file:** inputs/figma-variables.json

---

## Summary

| Action | Count |
|--------|-------|
| Value updates (normalized exact match) | N |
| Renames + updates (potential match) | N |
| Deletes | N |
| Additions | N |
| In sync (no changes needed) | N |

---

## Task 1 — Normalized exact matches (value updates only)

| CSV name | Figma name | Figma ID | Mode | Current value | Required value | Required value ID |
|----------|------------|----------|------|---------------|----------------|-------------------|
| ...      | ...        | ...      | ...  | ...           | ...            | ...               |

---

## Task 2 — Potential matches (rename and/or value update)

<!-- One block per potential match -->

**CSV token:** `csv-token-name`
**Figma variable:** `figma-variable-name` (`VariableID:...`)
**Confidence:** High / Medium / Low — _rationale_
**Planned actions:**
- RENAME: `figma-variable-name` → `csv-token-name`
- UPDATE All Modes: `current` → `required` (`VariableID:...`)
- UPDATE Light Mode: `current` → `required` (`VariableID:...`)
- UPDATE Dark Mode: `current` → `required` (`VariableID:...`)

---

## Task 3 — Deletes

| Figma variable name | Figma ID | Action |
|---------------------|----------|--------|
| ...                 | ...      | DELETE |

---

## Task 4 — Additions

| CSV token name | All Modes | All Modes ID | Light Mode | Light Mode ID | Dark Mode | Dark Mode ID | Action |
|----------------|-----------|--------------|------------|---------------|-----------|--------------|--------|
| ...            | ...       | ...          | ...        | ...           | ...       | ...          | ADD    |

---

## Task 5 — In sync (exact match, no changes needed)

| Token name |
|------------|
| ...        |
```

---

Do not modify any file in `inputs/`. Write only the plan file described above.
