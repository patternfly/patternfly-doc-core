import { getPackageName, getTabBase, getDefaultTab, addDemosOrDeprecated } from '../packageUtils'

describe('getPackageName', () => {
  it('returns empty string for empty input', () => {
    expect(getPackageName('')).toBe('')
  })

  it('returns empty string for null/undefined input', () => {
    expect(getPackageName(null as any)).toBe('')
    expect(getPackageName(undefined)).toBe('')
    expect(getPackageName()).toBe('')
  })

  it('extracts scoped package name correctly', () => {
    const filePath = '/path/to/node_modules/@patternfly/react-core/dist/index.js'
    expect(getPackageName(filePath)).toBe('@patternfly/react-core')
  })

  it('extracts scoped package name with multiple scoped packages', () => {
    const filePath = '/path/to/node_modules/@patternfly/patternfly/dist/index.js'
    expect(getPackageName(filePath)).toBe('@patternfly/patternfly')
  })

  it('extracts non-scoped package name correctly', () => {
    const filePath = '/path/to/node_modules/react/dist/index.js'
    expect(getPackageName(filePath)).toBe('react')
  })

  it('handles path without node_modules', () => {
    const filePath = '/path/to/some/file.js'
    expect(getPackageName(filePath)).toBe('')
  })

  it('handles complex nested path with scoped package', () => {
    const filePath = '/Users/dev/project/node_modules/@patternfly/react-core/lib/components/Button/Button.js'
    expect(getPackageName(filePath)).toBe('@patternfly/react-core')
  })

  it('handles Windows-style paths with scoped package', () => {
    const filePath = 'C:\\Users\\dev\\project\\node_modules\\@patternfly\\react-core\\dist\\index.js'
    expect(getPackageName(filePath)).toBe('@patternfly/react-core')
  })
})

describe('getTabBase', () => {
  it('returns "html" for @patternfly/patternfly package', () => {
    expect(getTabBase('@patternfly/patternfly')).toBe('html')
  })

  it('returns "react" for @patternfly/react-core package', () => {
    expect(getTabBase('@patternfly/react-core')).toBe('react')
  })

  it('returns empty string for unknown package', () => {
    expect(getTabBase('unknown-package')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(getTabBase('')).toBe('')
  })

  it('returns empty string for null/undefined input', () => {
    expect(getTabBase(null as any)).toBe('')
    expect(getTabBase(undefined as any)).toBe('')
  })

  it('is case sensitive', () => {
    expect(getTabBase('@PatternFly/patternfly')).toBe('')
    expect(getTabBase('@patternfly/PatternFly')).toBe('')
  })
})

describe('addDemosOrDeprecated', () => {
  it('returns empty string when filePath is missing', () => {
    expect(addDemosOrDeprecated('html', undefined)).toBe('')
    expect(addDemosOrDeprecated('html', '')).toBe('')
    expect(addDemosOrDeprecated('html', null as any)).toBe('')
  })

  it('returns empty string when tabName is missing', () => {
    expect(addDemosOrDeprecated('', '/path/to/file.js')).toBe('')
  })

  it('returns empty string when both parameters are missing', () => {
    expect(addDemosOrDeprecated('', undefined)).toBe('')
  })

  it('returns original tabName when no demos or deprecated in filePath/tabName', () => {
    expect(addDemosOrDeprecated('html', '/path/to/file.js')).toBe('html')
    expect(addDemosOrDeprecated('react', '/path/to/file.js')).toBe('react')
  })

  it('adds -demos suffix when filePath contains demos', () => {
    expect(addDemosOrDeprecated('html', '/path/to/demos/file.js')).toBe('html-demos')
    expect(addDemosOrDeprecated('react', '/path/to/demos/file.js')).toBe('react-demos')
  })

  it('adds -deprecated suffix when filePath contains deprecated', () => {
    expect(addDemosOrDeprecated('html', '/path/to/deprecated/file.js')).toBe('html-deprecated')
    expect(addDemosOrDeprecated('react', '/path/to/deprecated/file.js')).toBe('react-deprecated')
  })

  it('adds both -demos and -deprecated when both are in filePath', () => {
    expect(addDemosOrDeprecated('html', '/path/to/demos/deprecated/file.js')).toBe('html-demos-deprecated')
    expect(addDemosOrDeprecated('react', '/path/to/demos/deprecated/file.js')).toBe('react-demos-deprecated')
  })

  it('does not add duplicate -demos suffix when tabName already contains -demos', () => {
    expect(addDemosOrDeprecated('html-demos', '/path/to/demos/file.js')).toBe('html-demos')
    expect(addDemosOrDeprecated('react-demos', '/path/to/demos/file.js')).toBe('react-demos')
  })

  it('does not add duplicate -deprecated suffix when tabName already contains -deprecated', () => {
    expect(addDemosOrDeprecated('html-deprecated', '/path/to/deprecated/file.js')).toBe('html-deprecated')
    expect(addDemosOrDeprecated('react-deprecated', '/path/to/deprecated/file.js')).toBe('react-deprecated')
  })

  it('adds only missing suffix when tabName already has one suffix', () => {
    expect(addDemosOrDeprecated('html-demos', '/path/to/demos/deprecated/file.js')).toBe('html-demos-deprecated')
    expect(addDemosOrDeprecated('react-deprecated', '/path/to/demos/deprecated/file.js')).toBe('react-deprecated-demos')
  })

  it('does not add any suffix when tabName already has both suffixes', () => {
    expect(addDemosOrDeprecated('html-demos-deprecated', '/path/to/demos/deprecated/file.js')).toBe('html-demos-deprecated')
    expect(addDemosOrDeprecated('react-deprecated-demos', '/path/to/demos/deprecated/file.js')).toBe('react-deprecated-demos')
  })
})

describe('getDefaultTab', () => {
  it('returns base tab for regular patternfly package path', () => {
    const filePath = '/path/to/node_modules/@patternfly/patternfly/dist/index.js'
    expect(getDefaultTab(filePath)).toBe('html')
  })

  it('returns base tab for regular react-core package path', () => {
    const filePath = '/path/to/node_modules/@patternfly/react-core/dist/index.js'
    expect(getDefaultTab(filePath)).toBe('react')
  })

  it('returns demos tab for demos path with patternfly package', () => {
    const filePath = '/path/to/node_modules/@patternfly/patternfly/demos/Button.js'
    expect(getDefaultTab(filePath)).toBe('html-demos')
  })

  it('returns demos tab for demos path with react-core package', () => {
    const filePath = '/path/to/node_modules/@patternfly/react-core/demos/Button.js'
    expect(getDefaultTab(filePath)).toBe('react-demos')
  })

  it('returns deprecated tab for deprecated path with patternfly package', () => {
    const filePath = '/path/to/node_modules/@patternfly/patternfly/deprecated/OldButton.js'
    expect(getDefaultTab(filePath)).toBe('html-deprecated')
  })

  it('returns deprecated tab for deprecated path with react-core package', () => {
    const filePath = '/path/to/node_modules/@patternfly/react-core/deprecated/OldButton.js'
    expect(getDefaultTab(filePath)).toBe('react-deprecated')
  })

  it('adds both demos and deprecated when both are in path', () => {
    const filePath = '/path/to/node_modules/@patternfly/react-core/demos/deprecated/Button.js'
    expect(getDefaultTab(filePath)).toBe('react-demos-deprecated')
  })

  it('returns empty string for unknown package', () => {
    const filePath = '/path/to/node_modules/unknown-package/dist/index.js'
    expect(getDefaultTab(filePath)).toBe('')
  })

  it('returns empty string for path without node_modules', () => {
    const filePath = '/path/to/some/file.js'
    expect(getDefaultTab(filePath)).toBe('')
  })

  it('handles empty input', () => {
    expect(getDefaultTab('')).toBe('')
  })

  it('handles null/undefined input', () => {
    expect(getDefaultTab(null as any)).toBe('')
    expect(getDefaultTab(undefined)).toBe('')
    expect(getDefaultTab()).toBe('')
  })

  it('returns empty string for unknown package with demos path (empty tabBase causes addDemosOrDeprecated to return empty)', () => {
    const filePath = '/path/to/node_modules/unknown-package/demos/Button.js'
    expect(getDefaultTab(filePath)).toBe('')
  })

  it('returns empty string for unknown package with deprecated path (empty tabBase causes addDemosOrDeprecated to return empty)', () => {
    const filePath = '/path/to/node_modules/unknown-package/deprecated/Button.js'
    expect(getDefaultTab(filePath)).toBe('')
  })
})
