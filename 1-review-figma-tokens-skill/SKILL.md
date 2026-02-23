---
name: review-figma-tokens
description: Reviews a set of Figma Variables against a provided CSV of component specific tokens to ensure correct implementation, find any missing or extra tokens in the Figma set, and look for errors in scoping Figma Variables.
---
Read the input files from this workspace (paths relative to workspace root):
  - inputs/inputs.json (componentName for output file names)
  - inputs/component-tokens.csv
  - inputs/figma-variables.json
  - 1-review-figma-tokens-skill/knowledge/scoping-rules.md (scoping validation rules for Task 2)
---

# Figma Variables Review

You are reviewing Figma design tokens. Perform the following two checks and write all findings to a single output file in the **outputs/1-review** folder.

---

## Inputs

- **Review config:** `inputs/inputs.json`  
  JSON with `componentName`: the name of the component being reviewed (e.g. `"merchant_tile"` or `"Primary Button"`). Use this value in the output file names so each review is stored per component. When writing file paths, turn `componentName` into a safe filename segment: lowercase, spaces and slashes replaced by hyphens, no other punctuation (e.g. `"Primary Button"` → `primary-button`). If `componentName` is missing or empty, use a fallback segment like `component` so filenames remain valid.

- **Component tokens (source of truth):** `inputs/component-tokens.csv`  
  CSV whose first column (or a column named `name` or `Full Token`) contains the token name. Other columns (e.g. `All Modes`, `Light Mode`, `Dark Mode`, or `expected_alias` / `expected_value`) may contain expected assignments for comparison. Every non-empty row after the header is a token: treat the file as having token data whenever that first column has values in rows 2 onward. The CSV is the canonical list of token names and, when provided, expected assignments.

- **Figma variables:** `inputs/figma-variables.json`  
  JSON array of variable objects. Each has: `id`, `name`, `collection`, `resolvedType`, `valuesByMode`, `hiddenFromPublishing`, `scopes`.

- **Scoping rules:** `1-review-figma-tokens-skill/knowledge/scoping-rules.md`  
  Rules that define required `scopes` and `hiddenFromPublishing` by token name patterns.

---

## Task 1: CSV vs Figma comparison (CSV is source of truth)

Compare tokens in the CSV to tokens in the Figma JSON. Report:

1. **Missing in Figma:** Token names listed in the CSV that do not exist in the Figma variables (by exact `name` match).
2. **Extra in Figma:** Token names present in the Figma variables that are not listed in the CSV (only if the CSV has at least one row; otherwise skip this to avoid noise).
3. **Naming discrepancies:** Any case, spacing, or segment differences for the same logical token (e.g. CSV has `color/button/primary` but Figma has `color/Button/Primary`).
4. **Assignment discrepancies:** For CSV rows that define `expected_alias` or `expected_value`, check the Figma variable’s `valuesByMode`. For aliases, resolve or compare the alias target name; for primitives, compare value. Report any mismatch.

Normalize comparison by trimming whitespace and comparing token paths in a case-sensitive way unless the rules specify otherwise.

---

## Task 2: Scoping rules evaluation

**Scope:** Evaluate scoping rules only for the tokens that were compared in Task 1. That is, consider only Figma variables whose `name` appears in (or aligns with) the CSV—i.e. the set of tokens from the source of truth. Do not evaluate every variable in `inputs/figma-variables.json`; only those that correspond to tokens in `inputs/component-tokens.csv`.

Using **only** the rules in `1-review-figma-tokens-skill/knowledge/scoping-rules.md`:

- For each such variable (aligned with the CSV), determine which rule(s) apply based on `name`, `collection`, and any other conditions in the rules.
- For each applicable rule, check:
  - **scopes:** Required scope set (e.g. `["TEXT_FILL"]`). “must include” means the variable’s `scopes` must contain the listed scope(s); “must equal” means exact match (order-independent).
  - **hiddenFromPublishing:** Must match the value required by the rule (true/false).

Report every variable in this set where the actual `scopes` or `hiddenFromPublishing` does not match the rule. Include variable `name`, the rule that was applied, and what was expected vs actual.

Variables that do not match any rule in the scoping-rules file do not need to be reported for Task 2 (no “unmatched rule” required).

---

## Output

Read `componentName` from `inputs/inputs.json`. Turn it into a safe filename segment (lowercase, spaces/slashes → hyphens; if missing or empty use `component`). Use today’s date in ISO format (YYYY-MM-DD-HH-MM). Write the following to the **outputs/1-review** folder:

### 1. Review report: `outputs/1-review/YYYY-MM-DD-HH-MM-{componentName}-figma-token-review.md`

Example: if componentName is `merchant_tile`, use `outputs/1-review/2026-02-26-08-53-merchant_tile-figma-token-review.md` (keep underscores if present; only spaces/slashes become hyphens).

**Contents:**
1. **Task 1: CSV vs Figma**
   - Missing in Figma
   - Extra in Figma (if CSV has data)
   - Naming discrepancies
   - Assignment discrepancies
2. **Task 2: Scoping rule violations**
   - List each violation with variable name, rule, expected vs actual.
3. **Token mapping:** State that the full CSV mapping is in `outputs/1-review/YYYY-MM-DD-HH-MM-{componentName}-figma-token-mapping.csv` and in `inputs/mapped-component-tokens.csv`.

If a section has no findings, say “None” or “No issues” for that subsection. Use clear headings and bullet lists so the file is easy to scan.

### 2. Token mapping CSV (dated): `outputs/1-review/YYYY-MM-DD-HH-MM-{componentName}-figma-token-mapping.csv`

A CSV that maps every token from the component-tokens CSV to its match in the Figma JSON. Columns (STRICT):

- **csv_token** — The token name (or full token value) as it appears in the CSV.
- **figma_name** — The `name` of the matched variable in `figma-variables.json`, or empty if no match.
- **figma_id** — The `id` of the matched variable (e.g. `VariableID:3697:5173`), or empty if no match.

Include one row per CSV token, in the same order as the CSV. For tokens that are missing in Figma or only have a naming mismatch, leave `figma_name` and `figma_id` empty. For tokens that match (exact or resolved after normalizing), set `figma_name` and `figma_id` from the JSON.

### 3. Token mapping CSV (inputs): `inputs/mapped-component-tokens.csv`

Write the **same** token mapping CSV as above to this path. **Fully overwrite** the file each time; do not append or ask for permission—overwriting `inputs/mapped-component-tokens.csv` is intentional and required by this skill.

Do not modify any other files in `inputs/` (e.g. `inputs.json`, `component-tokens.csv`, `figma-variables.json`), or the scoping-rules file; only write the three outputs above (two in **outputs/1-review**, one in **inputs**).