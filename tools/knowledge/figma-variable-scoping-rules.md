# FIGMA VARIABLE SCOPING VALIDATION RULES

---

## SEMANTIC COLOR

IF name startsWith "color/text/"  
  → scopes must equal ["TEXT_FILL"]
  → hiddenFromPublishing must equal false

IF name startsWith "color/icon/"  
  → scopes must include ["SHAPE_FILL"]
  → hiddenFromPublishing must equal false  

IF name startsWith "color/bg/" OR name startsWith "color/fill/"  
  → scopes must equal ["FRAME_FILL","SHAPE_FILL"]
  → hiddenFromPublishing must equal false  

IF name startsWith "color/divider/"  
  → scopes must equal ["STROKE_COLOR"]
  → hiddenFromPublishing must equal false 

IF name startsWith "color/border/"  
  → scopes must equal ["STROKE_COLOR"]
  → hiddenFromPublishing must equal false  

---

## COMPONENT COLOR (PUBLIC API TOKENS)

IF name matches "^color/{component}/" AND name contains "/text/"  
  → scopes must equal ["TEXT_FILL"]  
  → hiddenFromPublishing must equal true  

IF name matches "^color/{component}/" AND name contains "/icon/"  
  → scopes must include ["SHAPE_FILL"]  
  → hiddenFromPublishing must equal true  

IF name matches "^color/{component}/" AND name contains "/bg/"  
  → scopes must equal ["FRAME_FILL","SHAPE_FILL"]  
  → hiddenFromPublishing must equal true  

IF name matches "^color/{component}/" AND name contains "/fill/"  
  → scopes must equal ["FRAME_FILL","SHAPE_FILL"]  
  → hiddenFromPublishing must equal true 

IF name matches "^color/{component}/" AND name contains "/border"  
  → scopes must equal ["STROKE_COLOR"]  
  → hiddenFromPublishing must equal true  

IF name matches "^color/{component}/" AND name contains "/outline/"  
  → scopes must equal ["STROKE_COLOR"]  
  → hiddenFromPublishing must equal true 

---

## SPACING

IF collection == "spacing" OR name startsWith "spacing/" OR name contains "/padding" OR name contains "/gap" OR name contains "/margin"  
  → scopes must equal ["GAP"]  

IF name contains component name AND represents spacing  
  → hiddenFromPublishing must equal true 

---

## SIZE

IF name startsWith "semantic/size/"  
  → scopes must equal ["FONT_SIZE"]  

IF name startsWith "breakpoint/"  
  → scopes must equal ["WIDTH_HEIGHT"]  
  → hiddenFromPublishing must equal false  

IF name contains component name AND represents dimension  
  → scopes must equal ["WIDTH_HEIGHT"]  
  → hiddenFromPublishing must equal true  

IF name matches "^size/{component}/" AND name contains "/border"  
  → scopes must equal ["STROKE_FLOAT"]  
  → hiddenFromPublishing must equal true 

IF name matches "^size/{component}/" AND name contains "/outline/"  
  → scopes must equal ["STROKE_FLOAT"]  
  → hiddenFromPublishing must equal true 

---

## RADIUS

IF name startsWith "radius/"  
  → scopes must equal ["CORNER_RADIUS"]  

---

## TYPOGRAPHY

IF name contains "lineHeight"  
  → scopes must equal ["LINE_HEIGHT"]  

IF name contains "letterSpacing"  
  → scopes must equal ["LETTER_SPACING"]  

IF name contains "fontFamily"  
  → scopes must equal ["FONT_FAMILY"]  

IF name contains "weight"  
  → scopes must equal ["FONT_STYLE"]  