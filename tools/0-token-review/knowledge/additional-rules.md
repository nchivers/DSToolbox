# Additional Rules

Use this file to define **interpretive rules** and **exceptions** that Claude should follow during the CSV token review. These rules can clarify design-system constraints, scope certain checks, or add context so the reviewer does not incorrectly flag valid cases.

---

## Composite tokens (shadow and gradient)

**Rule:** Composite **shadow** and **gradient** tokens are not assigned a single base-token value. They are built by combining multiple individual tokens and will therefore have **no value** in the **All Modes**, **Light Mode**, or **Dark Mode** assignment columns of the CSV.

**Effect on review:** When running **Check 2 (Tokens missing base-token assignments)**, do **not** flag a token as a missing assignment if its **Foundation** column value is `shadow` or `gradient`. Treat empty assignment columns for these tokens as expected and correct. You may note in the results that shadow and gradient tokens were excluded from the missing-assignment check per this rule.

---

## Adding more rules

Add further rules below in the same format:

- **Rule:** One-sentence description of the rule or exception.
- **Effect on review:** How Claude should apply it (which check, what to do or not do, what to note in the output).

Examples of rules you might add:

- Excluding certain token types from naming checks.
- Clarifying allowed value patterns for a specific segment.
- Scoping a check to specific foundations or components.
- When to report something as a warning vs an issue.
