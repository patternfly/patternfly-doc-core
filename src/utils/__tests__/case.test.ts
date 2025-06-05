import { fixPatternflyCasing, kebabCase, sentenceCase } from '../case'

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
