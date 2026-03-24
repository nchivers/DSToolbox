---
name: code-qa
description: QA review of component code on a GitHub PR branch against inputs/component-tokens.csv—token coverage, name and value alignment, and no raw hex/sizing/spacing/radius/typography in component styling. Requires the GitHub MCP server; use when validating a PR implements design tokens correctly for a named component.
---

# Component Code QA (PR + CSV)

Review implementation code on a **GitHub pull request branch** against the canonical token list in **inputs/component-tokens.csv**. Confirm every listed token is defined and used correctly in code, and that component styling does not rely on hard-coded visual primitives. Write findings to a single results file.

**GitHub MCP is required.** Obtain **all** pull-request metadata, changed-file lists, diffs, and file contents through the **GitHub MCP server** configured in the user’s environment. Do **not** substitute the GitHub CLI (`gh`), raw REST API calls from the terminal, or local `git fetch` / `git diff` / workspace-only reads as the source of truth for what is on the PR branch—those bypass the intended review path. If the GitHub MCP server is not available or authenticated, **stop** and tell the user to configure GitHub MCP (token/scopes) before continuing; do not silently fall back to CLI/git.

---

## Inputs

Read **inputs/inputs.json** (paths relative to workspace root):

| Key | Purpose |
|-----|--------|
| `pullRequestUrl` | **Required for this skill.** Full URL to the GitHub pull request (e.g. `https://github.com/org/repo/pull/42`). Used to resolve the PR head branch and the set of files/changes to inspect. |
| `componentName` | **Required.** Short name for the component (e.g. `affirm logo`, `Primary Button`). Used to scope which source files count as “the component,” and in the output filename. If missing, use `component`. |

Optional keys (use when present; do not require them to run the skill):

| Key | Purpose |
|-----|--------|
| `componentUrl` | For other review skills (Figma). Ignore for code QA unless you need cross-reference. |
| `subcomponents` | For other review skills. Ignore unless explicitly extending this skill. |

Fixed paths:

| Path | Purpose |
|------|--------|
| `inputs/component-tokens.csv` | **Required.** Canonical list of tokens for this component. Each row is a token; the **token identifier** used for matching in code is the value in the **`Full Token` column** when present; otherwise the first column named `name`, `Full Token`, or the leftmost non-empty token column (same precedence as **1-review-figma-tokens-skill**). Mode columns (`All Modes`, `Light Mode`, `Dark Mode`, etc.) hold expected **aliases or primitive values** for comparison when present. |

---

## Resolving the PR and code to review (GitHub MCP only)

1. **Parse `pullRequestUrl`** — Accept standard GitHub forms: `https://github.com/{owner}/{repo}/pull/{number}` (query strings may be present; strip them before calling MCP). Extract **owner**, **repo**, and **PR number**.

2. **Fetch PR and changes via GitHub MCP** — Use the **GitHub MCP** tools exposed in the environment (names vary by server; common capabilities include pull-request details, listing changed files, PR diff, and file/blob contents at a ref). You must:
   - Retrieve the PR’s **head** ref and **head SHA** (merge commit is not a substitute for reviewing the PR head).
   - Retrieve the **list of changed files** for the PR.
   - Retrieve the **unified diff** (or per-file patches) for the PR so you can see line-level edits.
   - For any file needed for token or style checks that is not fully visible in the diff, retrieve **full file contents at the head SHA** via MCP (e.g. repository content / blob tools), not by opening only the local workspace copy unless it is known to match that SHA.

3. **Scope “component” files** — From the PR’s changed files (and, when needed, related paths fetched at head SHA via MCP), select files that implement **`componentName`**:
   - Match folder/file names (case-insensitive, hyphen/underscore/space variants).
   - Include style modules colocated with the component (e.g. `*.css`, `*.scss`, `*.module.css`, styled-components, tokens map files **only if** they are clearly dedicated to this component).
   - Exclude unrelated files (tests-only can be included for token checks but raw-style rules should focus on **component implementation and its styling entrypoints**).
   - If scope is ambiguous, prefer the smallest set that contains the component export and its styles; note in the report which paths were included.

4. **Source of truth** — All checks below apply to the **PR head** as returned by GitHub MCP (head SHA), not to uncommitted local edits or an arbitrary local branch unless they match that SHA.

---

## QA criteria

Run these checks against the scoped component files. Report every finding with **file path**, **line number or snippet** when available, and a short **fix hint**.

### 1. Token coverage (all CSV tokens defined / used in code)

- **Source:** All non-header rows in `inputs/component-tokens.csv` with a non-empty token identifier (see Inputs).
- **Check:** For each token, the codebase on the PR branch should **define or reference** that token in component-related code—e.g. import from a design-token package, object key matching the full token string, or generated constants that stringify to the same dot-path **unless** the project uses a single agreed alias (document the convention if you infer it).
- **Report:** Tokens **missing** from code (not referenced anywhere in scoped files or shared token imports used only by this component). Tokens **referenced** but not listed in the CSV are noted under **extra / unexpected** (optional subsection) only if they appear in the same component scope.

### 2. Token names in code match CSV

- **Check:** String identifiers or keys for tokens must **match** the CSV **exactly** (trim whitespace; compare the full dot-path, case-sensitive, e.g. `affirm.color.affirm_logo.monocolor.arch.fill`).
- **Report:** Any **rename**, **casing**, **segment order**, or **alias string** in code that does not match the CSV token name for the same semantic use.

### 3. Token values in code match CSV expectations

- **When:** CSV rows include mode columns (`All Modes`, `Light Mode`, `Dark Mode`) or `expected_alias` / `expected_value`-style columns.
- **Check:** Where code assigns a **resolved** value to a token (or maps a token to a theme value), it should align with the CSV for the relevant mode:
  - If the CSV holds an **alias** (e.g. `gray.white`), code should resolve through the same token/alias chain or equivalent theme binding—not a different alias or primitive unless documented as platform-specific and called out.
  - If the CSV holds a **primitive** (hex, number), compare after normalizing format (e.g. `#fff` vs `#ffffff`).
- **Report:** Each **mismatch** between CSV-expected assignment and code (per mode if the app separates light/dark).

### 4. No hard-coded visual primitives in component styling

- **Scope:** Component **implementation** and **component-scoped styles** (not global reset/base files unless this component owns them).
- **Check — flag as issues:**
  - **Hex / raw colors:** e.g. `#RGB`, `#RRGGBB`, `rgb(`, `rgba(`, `hsl(` when used as literal values (not inside token resolution utilities).
  - **Sizing / spacing:** literal **px**, **rem**, **em**, **%** (and similar) used for **width, height, min/max dimensions, gap, padding, margin**—unless the value is **0** or **transparent** / **none** where obviously required, or the file is a documented exception (list exceptions explicitly if any).
  - **Radius:** literal radius values (e.g. `border-radius: 4px`, `rounded-[8px]`) not sourced from a token.
  - **Typography:** hard-coded **font-family**, **font-size**, **line-height**, **letter-spacing**, **font-weight** (numeric or named) on component styles—should use typography tokens or shared type presets instead.
- **Do not** flag token **definitions** in central theme files unless those definitions are duplicated inside the component in violation of single source of truth.

---

## Output

Write exactly one file:

- **Path:** `outputs/3-code-qa/YYYY-MM-DD-HH-MM-{componentName}-code-qa.md`
  - **`componentName`** from **inputs/inputs.json**, sanitized for filenames: lowercase; spaces and slashes replaced with hyphens; remove or replace characters unsafe in filenames. If missing, use `component`.
  - **Timestamp:** Current local date/time in **`YYYY-MM-DD-HH-MM`** (ISO-style date + hour and minute).

**Contents:**

1. **Inputs used** — `pullRequestUrl`, `componentName`, path to `inputs/component-tokens.csv`; state explicitly that **PR and file data were loaded via GitHub MCP**; PR head ref/SHA and **list of file paths** included in the component scope.
2. **1. Token coverage** — Missing tokens; optionally unexpected token references. Use “None” / “No issues” if clear.
3. **2. Token naming** — Mismatches vs CSV names; file/location for each.
4. **3. Token values** — Mismatches vs CSV expected aliases/values per mode; file/location for each.
5. **4. Raw values / typography** — Each issue: category (color, spacing, radius, typography), file, line or excerpt, and what to use instead (token or abstraction).
6. **Summary** — Counts by category; note blockers vs nice-to-fix if applicable.

Use clear headings and bullet lists. **Do not** modify `inputs/component-tokens.csv` or other inputs except as documented elsewhere; **only** add/update the report under `outputs/3-code-qa/`.

---

## Workflow

1. Read **inputs/inputs.json** — require **`pullRequestUrl`** and **`componentName`** for this QA run.
2. Load **`inputs/component-tokens.csv`** and build the list of token identifiers and any expected per-mode values.
3. **Using GitHub MCP only:** resolve the PR from `pullRequestUrl`, pull head SHA, changed files, diff, and full file contents as needed; determine **component-scoped** source paths.
4. Run checks **1–4**; collect findings with paths and line references.
5. Write **`outputs/3-code-qa/YYYY-MM-DD-HH-MM-{componentName}-code-qa.md`** using today’s date/time for the prefix.

**Note:** The **GitHub MCP server** is required. If MCP is missing, misconfigured, or returns auth errors, **do not** substitute `gh`/git/API curl—report the failure in **`outputs/3-code-qa/...`** (or inform the user if you cannot write the file) and list steps to enable GitHub MCP (PAT with appropriate repo scopes, MCP config in Cursor).
