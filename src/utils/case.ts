import {
  kebabCase as kebabCaseOriginal,
  sentenceCase as sentenceCaseOriginal,
} from 'change-case'

export const fixPatternflyCasing = (id: string) =>
  id.replace('PatternFly', 'Patternfly')

export const kebabCase = (id: string) =>
  kebabCaseOriginal(fixPatternflyCasing(id))

export const sentenceCase = (id: string) =>
  sentenceCaseOriginal(fixPatternflyCasing(id)).replace(
    'Patternfly',
    'PatternFly',
  )
