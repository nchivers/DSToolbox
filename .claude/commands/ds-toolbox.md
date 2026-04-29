Run the correct review skill(s) based on $REVIEW.

If $REVIEW is empty, blank, or does not match any option below, use the AskQuestion tool to ask "Which DS Toolbox skill would you like to run?" with exactly 7 separate options (do NOT group or merge them):

1. "Token Review" — Review a component token CSV for naming, assignment, and coverage issues.
2. "Token Prep" — Create a structured plan for updating Figma variables from the component token CSV.
3. "Build Figma Variables" — Apply variable changes to a Figma library branch from a prepared plan.
4. "Figma Variables Review" — Verify Figma variables match the component token CSV and check scoping.
5. "Figma Component Review" — Audit a Figma component for correct token usage and design-system compliance.
6. "QA Code Tokens" — QA a GitHub PR to confirm design tokens are implemented correctly in code.
7. "QA Storybook" — Check out a PR branch, build Storybook, and launch on a mobile simulator/emulator.

Once the user selects an option, proceed with the matching skill below.

If $REVIEW == "review 0" || $REVIEW == "token review" then run tools/0-token-review/SKILL.md

Else if $REVIEW == "build 0" || $REVIEW == "token prep" then run tools/1-token-prep/SKILL.md

Else if $REVIEW == "build 1" || $REVIEW == "build figma variables" then run tools/2-build-figma-variables/SKILL.md

Else if $REVIEW == "review 1" || $REVIEW == "figma variables review" then run tools/3-figma-variables-review/SKILL.md

Else if $REVIEW == "review 2" || $REVIEW == "figma component review" then run tools/4-figma-component-review/SKILL.md

Else if $REVIEW == "qa 1" || $REVIEW == "qa code tokens" then run tools/6-qa-code-tokens/SKILL.md

Else if $REVIEW == "qa 2" || $REVIEW == "qa storybook" then run tools/7-qa-storybook/SKILL.md