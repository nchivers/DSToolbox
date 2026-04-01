Run the correct review skill(s) based on $REVIEW:

If $REVIEW == 0 || $REVIEW == "token review" then run tools/0-token-review/SKILL.md

Else if $REVIEW == 1 || $REVIEW == "figma variables review" then run tools/1-figma-variables-review/SKILL.md

Else if $REVIEW == 2 || $REVIEW == "figma component review" then run tools/2-figma-component-review/SKILL.md

Else if $REVIEW == 3 || $REVIEW == "code qa" then run tools/3-code-qa/SKILL.md