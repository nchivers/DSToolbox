---
name: build-figma-variables
description: Creates a Figma library branch and implements variable changes from a build plan using Figma MCP. Use when building or updating Figma variables in the library based on a prepared plan document, before a designer works on a component. Reads inputs/inputs.json for the library URL and inputs/build-figma-variables-plan.md for the changes to apply.
---

Read these input files (paths relative to workspace root):
- `inputs/inputs.json` — `libraryBranchUrl` (Figma branch URL) and `componentName`
- `inputs/build-figma-variables-plan.md` — Variable changes to implement (adds, updates, renames, deletes)

---

# Build Figma Variables

You are implementing variable changes in a Figma library branch using the Figma MCP server. This runs **before** a designer works on the component.

---

## Step 1 — Read inputs

Read `inputs/inputs.json`:
- `componentName` — used to name the output file
- `libraryBranchUrl` — Figma branch URL the user has already created. Parse to get the **fileKey**: the first path segment after `/design/` (e.g. from `.../design/yvoTWRBHHMvvVdTphS2UpN/...` → `yvoTWRBHHMvvVdTphS2UpN`).

Read `inputs/build-figma-variables-plan.md` in full. Note the **Suggested branch name** from the plan header.

If the Figma MCP server is not available, stop and inform the user that it must be configured to run this skill.

---

## Step 2 — Confirm branch

Inform the user of the plan's suggested branch name and ask them to confirm the linked branch is correct before any changes are made:

> The plan suggests changes should be applied to a branch named **"{suggested branch name}"**. Please confirm that the branch linked in `libraryBranchUrl` is the correct branch. Would you like to proceed?

If the user confirms, proceed. If they do not confirm, exit without making any Figma changes.

---

## Step 3 — Implement changes from the plan

The plan (`inputs/build-figma-variables-plan.md`) follows the output structure from the `figma-token-update-plan` skill. It contains up to five tasks. Read each task and execute as described below. Work through tasks in this order: **Task 2 renames → Task 1 & 2 updates → Task 3 deletes → Task 4 additions**. Skip Task 5 (in sync — no action needed).

Using the **branch file key** for all Figma MCP calls.

---

### Task 1 — Normalized exact matches (value updates only)

The plan has a table with columns: `CSV name | Figma name | Figma ID | Mode | Current value | Required value | Required value ID`.

For each row, use the Figma MCP update tool to set the variable's value for the specified **Mode** (Light Mode / Dark Mode / All Modes):
- Target variable: **Figma ID**
- New value: **Required value ID** (variable alias)

Multiple rows may reference the same variable (one row per mode that needs updating). Group updates to the same variable together.

---

### Task 2 — Potential matches (rename and/or value update)

The plan has one block per match in this format:

```
**CSV token:** `affirm.color...`
**Figma variable:** `color/...` (`VariableID:...`)
**Confidence:** High / Medium / Low — rationale
**Planned actions:**
- RENAME: `old/name` → `new/name`
- UPDATE Light Mode: `old value` → `new value` (`VariableID:...`)
- UPDATE Dark Mode: `old value` → `new value` (`VariableID:...`)
```

For each block:
1. **RENAME** (if present): use the Figma MCP update tool to rename the variable to the path after `→`. Use the Figma variable ID from **Figma variable** line.
2. **UPDATE** (if present): for each UPDATE line, set the variable's value for that mode to the variable alias ID in parentheses at the end of the line.

Skip Low-confidence blocks and note them as skipped in the summary.

If a planned action line reads `No value update needed`, skip the update step for that block.

---

### Task 3 — Deletes

The plan has a table with columns: `Figma variable name | Figma ID | Action`.

For each row with `Action = DELETE`, use the Figma MCP delete tool with the **Figma ID**.

---

### Task 4 — Additions

The plan has a table with columns: `CSV token name | All Modes | All Modes ID | Light Mode | Light Mode ID | Dark Mode | Dark Mode ID | Action`.

For each row with `Action = ADD`:

1. **Convert the CSV token name to a Figma variable name**: strip the leading `affirm.` prefix, then replace all `.` separators with `/`.
   - Example: `affirm.color.top_nav_bar.main.static.container.bg` → `color/top_nav_bar/main/static/container/bg`

2. **Infer the collection** from the first path segment of the converted name:
   - `color/...` → color collection
   - `spacing/...` → spacing collection
   - `size/...` → size collection
   - `radius/...` → radius collection
   - `position/...` → position collection
   - `shadow/...` → color collection

3. Use the Figma MCP `post_variables` tool (or equivalent create tool) to create the variable with:
   - **name**: converted Figma variable name
   - Values per mode: use **All Modes ID** if the All Modes columns are populated; otherwise use **Light Mode ID** and **Dark Mode ID** as variable alias IDs for their respective modes. Empty cells mean that mode has no value — do not set it.

---

If any step fails, note the failure and continue with remaining changes.

---

## Step 4 — Write summary

After completing all changes, write a summary to:

`outputs/2-build-figma-variables/YYYY-MM-DD-HH-MM-{componentName}-build-summary.md`

Sanitize `componentName` for filenames (lowercase, spaces/slashes → hyphens; use `component` as fallback). Use today's date and time for `YYYY-MM-DD-HH-MM`.

```markdown
# Figma Variables Build Summary — {componentName}

**Generated:** YYYY-MM-DD HH:MM
**Library branch:** {libraryBranchUrl}
**Branch:** {branchName}
**Branch file key:** {branchFileKey}

---

## Summary

| Action | Count |
|--------|-------|
| Variables added | N |
| Variables updated | N |
| Variables renamed | N |
| Variables deleted | N |

---

## Changes applied

### Additions
- `variable/name` — Collection: X, Type: Y, All Modes: Z

### Updates
- `variable/name` (`VariableID:...`) — Mode: old value → new value

### Renames
- `old/name` → `new/name` (`VariableID:...`)

### Deletions
- `variable/name` (`VariableID:...`)

---

## Failures

<!-- List any steps that could not be completed, with the error or reason. If none, write "None." -->

---

## Next steps

The branch **{branchName}** is ready for the designer to build the component using these variables.
```

Do not modify any files in `inputs/`. Write only the summary file described above.
