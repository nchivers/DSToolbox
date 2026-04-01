# Additional Rules

Use this file to define **interpretive rules** and **exceptions** that Claude should follow during the Figma variables review. These rules can clarify design-system constraints, scope certain checks, or add context so the reviewer does not incorrectly flag valid cases.

---

## Composite tokens (shadow and gradient)

**Rule:** Composite **shadow** and **gradient** tokens are implemented as **Figma styles**, not as Figma variables. They will therefore never appear in `inputs/figma-variables.json`.

**Effect on review:** When running **Task 1 (CSV vs Figma comparison)**, do **not** flag a token as **missing in Figma** if its foundation segment is `shadow` or `gradient`. Treat their absence from `figma-variables.json` as expected and correct. You may note in the results that shadow and gradient tokens were excluded from the missing-in-Figma check per this rule.

---

## Component segment scoping (Extra in Figma)

**Rule:** The `inputs/figma-variables.json` file may contain tokens for many components. When evaluating which tokens in the JSON are relevant to the current review, only consider tokens whose **component segment** (the third path segment when the token name is split by `/`, e.g. `foundation/component/...`) matches the component being reviewed. Do **not** treat tokens as relevant if the component name appears only in a **part**, **part_variant**, or **subpart** segment — those belong to other components that use this component as a subcomponent.

**Example:** When reviewing `button`, the token `color/button/bg/resting` is in scope (component segment = `button`). The token `color/card/button/label/text` (where `button` appears in the part segment, not the component segment) is **not** in scope and must not be evaluated or reported for the button component review.

**Effect on review:**
- For **Task 1 — Extra in Figma:** When determining which Figma variables are "extra" (present in Figma but not in the CSV), only consider variables whose component segment matches the component being reviewed. Variables from other components that happen to share the component name in a deeper path segment must be excluded from this check entirely — do not report them as extra tokens.
- For **Task 2 — Scoping rules evaluation:** Apply the same scoping constraint. Only evaluate scoping rules for Figma variables whose component segment matches the component being reviewed.

---

## Adding more rules

Add further rules below in the same format:

- **Rule:** One-sentence description of the rule or exception.
- **Effect on review:** How Claude should apply it (which task, what to do or not do, what to note in the output).

Examples of rules you might add:

- Excluding certain token types from comparison checks.
- Clarifying how to handle token name format differences between CSV and Figma JSON.
- Scoping a check to specific collections or foundations.
- When to report something as a warning vs an issue.
