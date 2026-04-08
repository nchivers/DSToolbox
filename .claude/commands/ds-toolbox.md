Run the correct review skill(s) based on $REVIEW:

If $REVIEW == "review 0" || $REVIEW == "token review" then run tools/0-token-review/SKILL.md

Else if $REVIEW == "build 0" || $REVIEW == "token prep" then run tools/1-token-prep/SKILL.md

Else if $REVIEW == "build 1" || $REVIEW == "build figma variables" then run tools/2-build-figma-variables/SKILL.md

Else if $REVIEW == "review 1" || $REVIEW == "figma variables review" then run tools/3-figma-variables-review/SKILL.md

Else if $REVIEW == "review 2" || $REVIEW == "figma component review" then run tools/4-figma-component-review/SKILL.md

Else if $REVIEW == "qa 1" || $REVIEW == "qa code tokens" then run tools/6-qa-code-tokens/SKILL.md