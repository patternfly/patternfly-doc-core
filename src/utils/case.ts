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

/**
 * Adds the subsection to the page name, if there is no subsection, returns the page name
 * @param page - The page name
 * @param subsection - The subsection name
 * @returns The page name with the subsection
 */
export const addSubsection = (page: string, subsection?: string) => {
  if (subsection) {
    return `${kebabCase(subsection)}_${page}`
  }
  return page;
}

/**
 * Removes the subsection from the page name, if there is no subsection, returns the page name
 * @param page - The page name
 * @returns The page name without the subsection
 */
export const removeSubsection = (page: string) => {
  if (page.includes('_')) {
    return page.split('_')[1]
  }
  return page
}
