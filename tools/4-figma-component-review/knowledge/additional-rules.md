# Additional Rules

Use this file to define **interpretive rules** and **exceptions** that Claude should follow during the component implementation review. These rules can clarify Figma platform limits, scope certain checks, or add context so the reviewer does not incorrectly flag valid cases.

---

## Position tokens

**Rule:** Position tokens (e.g. variables used for x, y, left, top, or other layout position) may **not** appear as bound variables on the component in Figma, because Figma does not allow variables to be bound to position properties (x or y).

**Effect on review:** When evaluating **token coverage** (Check 1), do **not** report position tokens from the CSV as "tokens not used" or as issues. Treat them as expected exceptions. You may note in the results that position tokens were excluded from the unused-token count per this rule.

---

## Subcomponents

**Rule:** For each **instance of another component** used inside the component being reviewed (a child component instance), the reviewer must **get the context for that child component** and determine: (1) whether it is **local** (same file) or **remote** (from a library), and (2) whether it is **published** or **not published**. **Local and not published** → treat as an **owned subcomponent** and include in the full review. **Remote or published** (or both) → do **not** treat as an owned subcomponent; only overrides on the instance are in scope.

**Effect on review:**

- For each child component instance, obtain context for the component that instance references (e.g. via Figma MCP or export: fetch or resolve the main component and its metadata). From that context, determine:
  - **Local vs remote:** Is the component defined in the same file as the component under review (local) or in a separate library/file (remote)?
  - **Published or not:** Is the component (or its library) published?
- **Local and not published (owned subcomponents):** Treat these as part of the component under review. **You must fetch and include the full context for each owned subcomponent’s component set** in the review. To get the correct node ID for each subcomponent’s **component set** (so MCP calls succeed), follow **SKILL.md → “Getting component data” → step 4 (Owned subcomponents)**: use get_metadata (and get_design_context) for the root to get the tree, parse instance nodes and main-component references (or the parent of variant nodes) to obtain (fileKey, nodeId) for each component set, then call **get_variable_defs**, **get_design_context**, and **get_metadata** for that node. Merge or evaluate that context with the root. Apply **all** review criteria to the root **and** each owned subcomponent: token coverage, no hex/non-variable values, typography uses library styles, and component property naming. Report issues with a clear indication of whether they are in the root component or in which subcomponent (e.g. "In subcomponent [name]: …").
- **Remote or published (not owned subcomponents):** Do **not** full-review these instances. Evaluate them **only for overrides** (e.g. whether any overrides applied to the instance are token-based or valid). Do not report missing tokens, raw values, or naming issues for the internal structure of these instances—they are out of scope.

When reporting, note which nested instances were classified as owned subcomponents (local, not published) vs override-only (remote or published). For each owned subcomponent, confirm that its context (variables, design context, metadata) was fetched and included in the review. If the MCP or export does not provide enough information to determine local/remote or published status for a child, note that in the results and state how that instance was treated (e.g. assumed override-only to be safe).

---

## Typography selection

**Rule:** All typography used in components must come from the **`typography/component/`** set. Typography style names (or their path/identifier) must **begin with** `typography/component/`. Any typography that does not begin with that name is out of scope and should be considered an issue.

**Effect on review:** When evaluating **typography** (Check 3), in addition to requiring that text uses defined library styles, require that the style name or path **starts with** `typography/component/`. For each text node or typography style that does **not** begin with `typography/component/`, report it as an **issue** (e.g. "Typography style [name] is not from affirm.typography/component/ set"). Include the actual style name and, if available, the node or layer it applies to.

---

## Adding more rules

Add further rules below in the same format:

- **Rule:** One-sentence description of the rule or exception.
- **Effect on review:** How Claude should apply it (which check, what to do or not do, what to note in the output).

Examples of rules you might add:

- Excluding certain token types from coverage checks (e.g. tokens used only in code, not in Figma).
- Figma limitations (e.g. a property that cannot be bound to a variable).
- Scoping a check to specific layers or property types.
- When to report something as a warning vs an issue.
