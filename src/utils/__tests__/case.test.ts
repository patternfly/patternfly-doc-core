import { fixPatternflyCasing, kebabCase, sentenceCase, addSubsection, removeSubsection } from '../case'

describe('fixPatternflyCasing', () => {
  it('replaces PatternFly with Patternfly', () => {
    expect(fixPatternflyCasing('PatternFly Button')).toBe('Patternfly Button')
    expect(fixPatternflyCasing('PatternFly-Button')).toBe('Patternfly-Button')
  })

  it('does not modify strings without PatternFly', () => {
    expect(fixPatternflyCasing('Regular Button')).toBe('Regular Button')
    expect(fixPatternflyCasing('')).toBe('')
  })
})

describe('kebabCase', () => {
  it('converts strings to kebab case and fixes PatternFly casing', () => {
    expect(kebabCase('PatternFly Button')).toBe('patternfly-button')
    expect(kebabCase('PatternFly Alert Group')).toBe('patternfly-alert-group')
  })

  it('handles kebab case for regular strings', () => {
    expect(kebabCase('Button Component')).toBe('button-component')
    expect(kebabCase('camelCase')).toBe('camel-case')
  })
})

describe('sentenceCase', () => {
  it('converts strings to sentence case and maintains PatternFly casing', () => {
    expect(sentenceCase('PatternFly Button')).toBe('PatternFly button')
    expect(sentenceCase('PatternFly-alert-group')).toBe(
      'PatternFly alert group',
    )
  })

  it('handles sentence case for regular strings', () => {
    expect(sentenceCase('button-component')).toBe('Button component')
    expect(sentenceCase('camelCase')).toBe('Camel case')
  })
})

describe('addSubsection', () => {
  it('adds subsection to page name with underscore separator', () => {
    expect(addSubsection('checkbox', 'forms')).toBe('forms_checkbox')
    expect(addSubsection('button', 'components')).toBe('components_button')
  })

  it('kebab-cases subsection before adding to page name', () => {
    expect(addSubsection('checkbox', 'Forms')).toBe('forms_checkbox')
    expect(addSubsection('checkbox', 'Forms Group')).toBe('forms-group_checkbox')
    expect(addSubsection('dropdown', 'MenusGroup')).toBe('menus-group_dropdown')
    expect(addSubsection('button', 'PatternFly Components')).toBe('patternfly-components_button')
  })

  it('returns page name when no subsection is provided', () => {
    expect(addSubsection('alert')).toBe('alert')
    expect(addSubsection('button', undefined)).toBe('button')
  })

  it('returns page name when subsection is empty string', () => {
    expect(addSubsection('alert', '')).toBe('alert')
  })
})

describe('removeSubsection', () => {
  it('removes subsection from page name by splitting on underscore', () => {
    expect(removeSubsection('forms_checkbox')).toBe('checkbox')
    expect(removeSubsection('components_button')).toBe('button')
  })

  it('returns page name when no subsection exists', () => {
    expect(removeSubsection('alert')).toBe('alert')
    expect(removeSubsection('button')).toBe('button')
  })
})
