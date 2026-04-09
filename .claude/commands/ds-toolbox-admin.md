Run the correct action based on $ACTION:

If $ACTION == "clean up" then 
1. Update the inputs.json file to the following:
{
  "componentName": "componentNameHere",
  "libraryBranchUrl": "https://www.figma.com/design/FileKey/branch/BranchKey/...?node-id=NODE_ID",
  "componentUrl": "https://www.figma.com/design/FileKey/...?node-id=NODE_ID",
  "pullRequestUrl": "https://github.com/ORG/REPO/pull/NUMBER",
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

IMPROTANT: Do not expend time or resources reading the files, just delete the contents of them.

3. Let the user know that the clean up is done.