Run the correct action based on $ACTION:

If $ACTION == "clean up" then 
1. Update the inputs.json file to the following:
{
  "componentName": "componentNameHere",
  "libraryBranchUrl": "https://www.figma.com/design/FileKey/branch/BranchKey/...?node-id=NODE_ID",
  "componentUrl": "https://www.figma.com/design/FileKey/...?node-id=NODE_ID",
  "pullRequestUrl": "https://github.com/ORG/REPO/pull/NUMBER",
  "mainLibraryUrl": "https://www.figma.com/design/FileKey/...",
  "subcomponents": [
    {
      "name": "UserSuppliedName",
      "subcomponentUrl": "https://www.figma.com/design/FILE_KEY/...?node-id=NODE_ID"
    }
  ]
}

2. Remove all content from the following files so that they are completely empty:
inputs/build-figma-variables-plan.md
inputs/component-tokens.csv
inputs/figma-variables.json
inputs/mapped-component-tokens.csv
inputs/library-current.json
inputs/library-baseline.json

IMPROTANT: Do not expend time or resources reading the files, just delete the contents of them.

3. Let the user know that the clean up is done.

---

If $ACTION == "update base variables" then
1. Fetch the latest local variables from the DS Base Library using the Figma REST API:
   - File key: `Sj1A24j9ANkav6SG2pHbop`
   - Endpoint: `GET https://api.figma.com/v1/files/Sj1A24j9ANkav6SG2pHbop/variables/local`
   - Auth header: `X-Figma-Token: <token>` — read the token from the environment variable `FIGMA_TOKEN`, or if not set, ask the user to provide it.

2. Parse the response and write `tools/knowledge/figma-base-variables.csv` with columns: `name`, `value`, `id`.
   - Include only local variables (where `remote` is false or absent).
   - Sort rows alphabetically by `name`.
   - For COLOR values: convert `r/g/b/a` floats (0–1) to hex. Use `#RRGGBB` when alpha is 1, `#RRGGBBAA` otherwise.
   - For VARIABLE_ALIAS values: resolve recursively until a concrete value is reached, then format as above.
   - For FLOAT values: write as a number (omit trailing `.0` for whole numbers).
   - For STRING values: write as-is.
   - For variables with multiple modes: format the value as `Mode1Name: value1 | Mode2Name: value2`.

3. Let the user know how many rows were written and how many variables changed since the previous version of the file (added, removed).