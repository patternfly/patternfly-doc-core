export const content = [
  { base: 'textContent', pattern: '*.md', name: "textContent" }, 
  {
    "packageName":"@patternfly/react-core",
    "pattern":"**/examples/**/*.md", // had to update the pattern to bring in demos docs
    "name":"react-component-docs"
  }, 
  {
    "packageName":"@patternfly/patternfly",
    "pattern":"**/examples/**/*.md", // had to update the pattern to bring in demos docs
    "name":"core-component-docs"
  }
]
