---
name: review-figma-imp
description: Reviews a Figma library component to ensure tokens are applied correctly, no hex or raw values are used for spacing/color/radius/stroke, typography uses library styles, and names/values follow defined rules. Use when reviewing a Figma component implementation, checking token usage, or auditing a component for design-system compliance.
---

# Figma Component Implementation Review

Review a given component from a Figma library against token usage, variable-only values, typography styles, and naming rules. Write findings to a single results file.

---

## Inputs

Read **inputs/inputs.json** (paths relative to workspace root). It contains only:

| Key | Purpose |
|-----|--------|
| `componentUrl` | **Required.** Figma link to the component (e.g. `https://www.figma.com/design/FILE_KEY/...?node-id=NODE_ID`). Used by Figma MCP to fetch component data. |
| `componentName` | **Required.** Short name for the component (e.g. `merchant-tile`, `Button`). Used in the results filename. If missing, use `component`. |
| `subcomponents` | **Optional.** Array of `{"name": "UserSuppliedName", "subcomponentUrl": "https://..."}`. When present, fetch each subcomponent via Figma MCP using its URL and include it in the review. Match each entry to INSTANCEs in the main component (by component set fileKey/nodeId) so findings can be labeled by the supplied name. |

All other inputs use **fixed paths** (workspace root):

| Path | Purpose |
|------|--------|
| `inputs/mapped-component-tokens.csv` | **Required.** CSV of tokens associated with this component (e.g. output from 1-review skill); used to verify "all tokens applied" and map token → variable ID. First column = CSV token name, second column = Figma token name, and third column = Figma variable ID. |
| `tools/2-figma-component-review/knowledge/naming-rules.md` | Rules for component property naming (variant, boolean, content swap, text). |
| `tools/2-figma-component-review/knowledge/additional-rules.md` | Optional. Interpretive rules and exceptions (e.g. exclude position tokens from "unused token" reporting). If present, read and apply every rule during the review. |

---

## Getting component data (Figma MCP preferred)

**Prefer the Figma MCP server** when it is configured in the user's environment. Then the component link alone is enough; no manual JSON export is required.

1. **Parse componentUrl** to get:
   - **fileKey:** The first path segment after `/design/` (e.g. from `.../design/yvoTWRBHHMvvVdTphS2UpN/branch/...` use `yvoTWRBHHMvvVdTphS2UpN`). Ignore any `branch/...` segment for the key.
   - **nodeId:** The `node-id` query parameter (e.g. `5-3602`). If the URL has `node-id=5%3A3602`, decode to `5-3602`.

2. **Call Figma MCP tools** (if the Figma MCP server is available):
   - **get_variable_defs(fileKey, nodeId)** — Returns the variables and styles used in the selection (colors, spacing, typography). Use this as the primary source for: which variables are used (token coverage), and whether typography uses defined styles. If the response lists variable names and values, treat listed variables as "correctly applied"; any raw values or non-variable entries in the response should be flagged as issues (no hex / non-variable).
   - **get_design_context(fileKey, nodeId)** — Use to get node-level detail (which node has which fill, spacing, etc.) so you can report **layer names** with each issue. Call for root and each subcomponent when reporting raw-value or typography issues.
   - **get_metadata(fileKey, nodeId)** — Use to get layer IDs, **names**, types, positions, sizes so you can include **layer names** in the output for every issue. Call for root and each subcomponent to support find-and-fix.

3. **User-supplied subcomponents (inputs.json):** If **inputs/inputs.json** has a **subcomponents** array, use it as the primary source for subcomponent data so reviews get subcomponent information consistently.
   - For each entry in **subcomponents**, parse **subcomponentUrl** for **fileKey** and **nodeId** (same rules as for componentUrl: fileKey = first path segment after `/design/`, nodeId = `node-id` query param, decoded from `5%3A3602` to `5-3602` or `5:3602` per MCP).
   - Call **get_variable_defs(fileKey, nodeId)**, and optionally **get_design_context(fileKey, nodeId)** and **get_metadata(fileKey, nodeId)** for that node. Merge the returned data into the review scope.
   - **Match to the main component:** Call **get_metadata(fileKey, rootNodeId)** for the root so the response includes the full tree. Parse for **INSTANCE** nodes and each instance's main component reference (e.g. `mainComponent`, `componentId`, or top-level map with `file_key` and `node_id`). For each user-supplied subcomponent, the **(fileKey, nodeId)** from its URL should match one of those main-component references. Use the **name** from **subcomponents** when labeling findings (e.g. "Subcomponent [UserSuppliedName]: …"). Run all review criteria on the root **and** each subcomponent from inputs.json; label each finding by component.

4. **Owned subcomponents (additional-rules.md only):** If **additional-rules.md** defines owned subcomponents and **subcomponents** is not in inputs.json (or you need more subcomponents not listed there), **get the full context for each owned subcomponent’s component set** and include it in the review. Resolve each subcomponent’s **(fileKey, nodeId)** from the root metadata as follows:
   - **Node ID format:** Figma often uses **colon** in API responses (e.g. `3672:742`); URLs use **hyphen** (e.g. `node-id=3672-742`). When calling MCP, use the format the tool expects—try colon first, then hyphen if needed.
   - Call **get_metadata(fileKey, rootNodeId)** (and optionally **get_design_context**) for the **root** so the response includes the full tree of descendants (depth/scope that includes nested instances).
   - Parse for **INSTANCE** nodes. For each owned subcomponent instance, get the **main component** (component set) it references—via instance fields like `mainComponent`, `componentId`, `componentKey`, or `componentSetId` (object with `file_key` / `node_id`), or a top-level `components` / `componentSets` map keyed by id.
   - **If you only have variant node IDs** (sibling COMPONENT nodes): the **component set** is the **parent** of those variants; use that parent’s `id` as the component set node ID for **get_variable_defs** / **get_design_context** / **get_metadata**.
   - Once you have **(fileKey, nodeId)** for the subcomponent’s **component set**, call **get_variable_defs**, **get_design_context**, and **get_metadata** for that node. Merge into the review scope; label findings by subcomponent name.

5. **If Figma MCP is not available:** Inform the user that the Figma MCP server must be configured to run this review; component data is obtained only via Figma MCP.

---

## Review Criteria

Perform these checks and report every finding. If an input file is missing, note it and skip the checks that depend on it. **When inputs.json has a subcomponents array or additional-rules.md defines owned subcomponents,** "component data" means the root component’s context **plus** the full context (variables, design context, metadata) fetched for each subcomponent (from **subcomponents** URLs in inputs.json or from resolved owned subcomponents per additional-rules.md); run each check against the root and each subcomponent, and label findings by component (use the **name** from inputs.json subcomponents when labeling).

### 1. Token coverage (all associated tokens applied)

- **When:** `inputs/mapped-component-tokens.csv` is present and component data is available from Figma MCP **get_variable_defs**. When subcomponents are in scope (from **inputs.json** subcomponents array or additional-rules.md), use the combined context (root + each subcomponent).
- **Check:** Every token listed in the CSV should appear as a variable used in the component (and in owned subcomponents, when applicable). Match by variable ID or by token name → variable name (Figma variable names often use slashes, e.g. `color/button/bg/resting`).
- **Additional rules:** If **additional-rules.md** is loaded, apply any exceptions (e.g. position tokens: do not report them as unused, because Figma cannot bind variables to x/y).
- **Report:** List each token from the CSV that does **not** appear in the component’s used variables and is **not** excluded by additional rules. For each, include the **layer name(s)** where the token was expected (from get_design_context/get_metadata) when the token maps to a specific property on a layer. Highlight as **issues** (tokens not used). If any tokens were excluded per additional rules, note that in the results.

### 2. No hex or non-variable values; no direct base tokens

- **When:** Component data is available from Figma MCP **get_variable_defs** / **get_design_context**.
- **Check:** For spacing, color, border radius, stroke color, and stroke width, values must be variable references only (no hex, no raw RGB/RGBA, no raw numbers). **get_variable_defs** lists “variables and styles used”; treat anything that is a raw value (hex, numeric, or explicit RGB) in the response as an issue. (2) **No direct base tokens:** Any variable used for those properties whose **name begins with `base/`** (the base token set) must also be flagged as an issue. Components should use component or semantic tokens, not base tokens directly; use variable names from the MCP response to detect `base/` usage.
- **Report:** For every issue, include the **layer name** (from get_design_context or get_metadata) so the designer can find and fix it. For each raw value: **layer name**, property, and the raw value. For each direct base token: **layer name**, property, and the variable name. Include node ID when layer name is ambiguous. Mark all as **issue**.

### 3. Typography uses library styles

- **When:** Component data includes text or typography (from Figma MCP **get_variable_defs** “styles” / **get_design_context**).
- **Check:** All typography must use **defined styles** from the library (e.g. bound text style). **get_variable_defs** returns “variables and styles used”; typography should appear as named styles, not ad-hoc font/size/lineHeight.- **Report:** List each text node or style entry that does not use a library typography style. For each, include the **layer name** (from get_design_context or get_metadata) so the designer can find and fix it. Mark as **issue**.

### 4. Component property naming (variant, boolean, content swap, text)

- **When:** `2-review-figma-imp-skill/knowledge/naming-rules.md` exists and is readable.
- **Check:** Apply the rules in that file **only** to component set properties: **variant** (e.g. Interaction with values Resting, Hover, Focus-Visible, Pressed, Disabled), **boolean**, **content swap**, and **text** properties. Verify property names and their values match the defined rules. Do not use this check for variable/token names or token usage—those are covered by checks 1 and 2.
- **Report:** List each violation with: **layer/component name** (if the violation applies to a specific instance or subcomponent), component property name, actual value(s), the rule that was broken, and expected name or value. Mark as **issue**.

---

## Output

Write exactly one results file:

- **Path:** `outputs/2-review/YYYY-MM-DD-HH-MM-{componentName}-figma-imp-review.md`. Use `componentName` from **inputs/inputs.json** if present; sanitize for filenames (lowercase, replace spaces and invalid chars with hyphens, e.g. "Merchant Tile" → `merchant-tile`). If `componentName` is missing, use `component`. Use today’s date in ISO format for YYYY-MM-DD-HH-MM.
- **Contents:**
  1. **Inputs used** – componentName (if set); componentUrl; **subcomponents** from inputs.json (if present) with names and URLs; that component data came from Figma MCP; which of the fixed-path inputs were present (mapped-component-tokens.csv, naming-rules.md, additional-rules.md). If subcomponents were in scope (from inputs.json or additional-rules.md), list them and confirm their context was fetched and included.
  2. **1. Token coverage** – Tokens not used (from mapped-component-tokens.csv), with **layer name(s)** where applicable; or note that the CSV was missing.
  3. **2. Raw values and direct base tokens** – For each issue: **layer name**, property, and the raw value or base variable name (include node ID if helpful).
  4. **3. Typography** – For each issue: **layer name** of the text node and the problem (e.g. no library style).
  5. **4. Component property naming** – For each violation: component/layer name, property name, actual vs expected, and rule broken; or note that rules file was missing.
  6. **Summary** – Count of issues per category and any critical vs non-critical note if the rules define them.

Use clear headings and bullet lists. **Include the layer name for every issue** so designers can find and fix them quickly in Figma (use get_design_context and get_metadata to obtain layer names). When the review includes subcomponents (from inputs.json or additional-rules.md), label each finding by component (e.g. "Root component:", "Subcomponent [name]:") using the **name** from inputs.json when available. If a section has no findings, write "None" or "No issues." Do not modify input files; only write the results file.

---

## Workflow

1. Read **inputs/inputs.json** for **componentName**, **componentUrl**, and **subcomponents** (optional array of `{ "name", "subcomponentUrl" }`). Require **componentUrl**. If **2-review-figma-imp-skill/knowledge/additional-rules.md** exists, load it and apply its rules throughout the review.
2. **Get component data:** If the Figma MCP server is available, parse **componentUrl** for fileKey and nodeId, then call **get_variable_defs**, **get_design_context**, and **get_metadata** so you have layer names for the output. Use the responses as component data and to include **layer name** with every issue in the results file. If **inputs.json** has a **subcomponents** array, for each entry parse **subcomponentUrl** for fileKey and nodeId, call **get_variable_defs** (and optionally **get_design_context**, **get_metadata**) for that node, and merge the data into the review scope; match each to INSTANCEs in the main component by (fileKey, nodeId) and use the supplied **name** when labeling findings. If **subcomponents** is not present and **additional-rules.md** defines owned subcomponents, identify each owned subcomponent and **get the full context** (get_variable_defs, get_design_context, get_metadata) for each one’s component set and include it in the data used for the review. If the Figma MCP server is not available, inform the user that it must be configured to run this review.
3. Load other inputs at their fixed paths (mapped-component-tokens.csv, naming-rules.md, additional-rules.md).
4. Run each applicable check (1–4) using the component data and collect issues.
5. Write **outputs/2-review/YYYY-MM-DD-HH-MM-{componentName}-figma-imp-review.md** with all findings (componentName from inputs.json, sanitized; date = today).

**Note:** The Figma MCP server is required. The user sets **componentUrl** (required), and optionally **componentName** and **subcomponents** (array of `{ "name", "subcomponentUrl" }`) in inputs.json to supply known subcomponent links for consistent subcomponent review.
