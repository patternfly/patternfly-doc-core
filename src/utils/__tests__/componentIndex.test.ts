import { readFile } from 'fs/promises'
import { getCollection } from 'astro:content'
import { GET } from '../../pages/api/component-index.json'
import { generateApiIndex } from '../apiIndex/generate'

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}))
jest.mock('astro:content', () => ({ getCollection: jest.fn() }))
jest.mock('../../content', () => ({ content: [{ name: 'react-component-docs', version: 'v6' }] }))
jest.mock('../getOutputDir', () => ({ getOutputDir: jest.fn().mockResolvedValue('/output') }))
jest.mock('../extractReactTokens', () => ({ extractReactTokens: jest.fn().mockResolvedValue([]) }))

const precomputedExamples = {
  'layouts/Flex.mdx': [{ exampleName: 'FlexBasic', title: 'Basic flex' }],
}

const propsData = Object.fromEntries(
  ['Nav', 'NavItem', 'FileUpload', 'FileUploadField', 'ActionGroup', 'Form', 'Flex', 'FlexItem', 'Chip-deprecated', 'ChipGroup-deprecated', 'Table', 'DataViewTable'].map((name) => [name, { name, props: [] }]),
)
const originalRequirePrecomputed = process.env.PF_DOCS_REQUIRE_PRECOMPUTED_EXAMPLES

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  process.env.PF_DOCS_REQUIRE_PRECOMPUTED_EXAMPLES = 'true'
  ;(getCollection as jest.Mock).mockResolvedValue([
    { data: { section: 'components', id: 'Navigation', tab: 'react', propComponents: ['Nav', 'NavItem', 'NavMissingProps'] }, body: '', filePath: 'components/Nav.mdx' },
    { data: { section: 'components', subsection: 'file-upload', id: 'Simple file upload', tab: 'react', propComponents: ['FileUpload', 'FileUploadField'] }, body: '', filePath: 'components/FileUpload.mdx' },
    { data: { section: 'components', id: 'Form', tab: 'react', propComponents: ['ActionGroup', 'Form'] }, body: '', filePath: 'components/Form.mdx' },
    { data: { section: 'components', id: 'Navigation', tab: 'html' }, body: '', filePath: 'html/Nav.mdx' },
    { data: { section: 'components', id: 'Navigation', tab: 'react', propComponents: ['OldNav'] }, body: '', filePath: 'deprecated/components/Nav.mdx' },
    { data: { section: 'components', id: 'Chip', tab: 'react-deprecated', propComponents: ['Chip', 'ChipGroup'] }, body: '', filePath: 'deprecated/components/Chip.mdx' },
    { data: { section: 'components', id: 'Table', tab: 'react', propComponents: ['Table'] }, body: '', filePath: 'components/Table.mdx' },
    { data: { section: 'extensions', subsection: 'data-view', id: 'Table', tab: 'react', propComponents: ['DataViewTable'] }, body: '', filePath: 'extensions/DataViewTable.mdx' },
    { data: { section: 'foundations-and-styles', subsection: 'layouts', id: 'Flex', tab: 'react', propComponents: ['Flex', 'FlexItem'] }, body: '', filePath: 'layouts/Flex.mdx' },
  ])
  ;(readFile as jest.Mock).mockImplementation((filePath: string) => Promise.resolve(JSON.stringify(
    filePath === '/output/.precomputed-examples.json'
      ? precomputedExamples
      : propsData,
  )))
})

afterEach(() => {
  if (originalRequirePrecomputed === undefined) {
    delete process.env.PF_DOCS_REQUIRE_PRECOMPUTED_EXAMPLES
  } else {
    process.env.PF_DOCS_REQUIRE_PRECOMPUTED_EXAMPLES = originalRequirePrecomputed
  }
  jest.restoreAllMocks()
})

it('retains active frontmatter mappings without HTML or deprecated entries overwriting them', async () => {
  const index = await generateApiIndex()
  expect(index.propComponents?.['v6::components::navigation']).toEqual(['Nav', 'NavItem', 'NavMissingProps'])
  expect(index.propComponents?.['v6::components::chip']).toEqual(['Chip', 'ChipGroup'])
  expect(index.propComponents?.['v6::foundations-and-styles::layouts_flex']).toEqual(['Flex', 'FlexItem'])
  expect(index.examples['v6::foundations-and-styles::layouts_flex::react']).toEqual([
    { exampleName: 'FlexBasic', title: 'Basic flex' },
  ])
})

it('indexes current collections, preserving page keys and exposing documented members', async () => {
  const response = await GET({} as any)
  const { components } = await response.json()
  expect(response.status).toBe(200)
  expect(components.Navigation).toMatchObject({ page: 'navigation', component: 'Nav', hasProps: true })
  expect(components.Nav).toMatchObject({ page: 'navigation', component: 'Nav' })
  expect(components.NavItem).toMatchObject({ page: 'navigation', component: 'NavItem', hasProps: true })
  expect(components.NavMissingProps).toMatchObject({ page: 'navigation', component: 'NavMissingProps', hasProps: false })
  expect(components.FileUpload).toMatchObject({ page: 'file-upload_simple-file-upload', component: 'FileUpload' })
  expect(components.FileUploadField).toMatchObject({ page: 'file-upload_simple-file-upload', component: 'FileUploadField' })
    expect(components.Chip).toMatchObject({ page: 'chip', component: 'Chip', hasProps: true })
    expect(components.ChipGroup).toMatchObject({ page: 'chip', component: 'ChipGroup', hasProps: true })
    expect(components.DataViewTable).toMatchObject({ page: 'data-view_table', component: 'DataViewTable', hasProps: true })
  expect(components.Flex).toMatchObject({ page: 'layouts_flex', tabs: ['react'], exampleCount: 1 })
  expect(components.Form).toMatchObject({ hasProps: true })
  expect(readFile).toHaveBeenCalledTimes(2)
  expect(readFile).toHaveBeenCalledWith('/output/.precomputed-examples.json', 'utf8')
  expect(readFile).toHaveBeenCalledWith('/output/props.json', 'utf-8')
})

it('requires the prepared snapshot during a CLI build', async () => {
  const missingCache = Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
  ;(readFile as jest.Mock).mockRejectedValueOnce(missingCache)

  await expect(generateApiIndex()).rejects.toMatchObject({ code: 'ENOENT' })
})

it('only advertises deprecated props when the suffixed record exists', async () => {
  ;(readFile as jest.Mock).mockImplementation((filePath: string) => Promise.resolve(JSON.stringify(
    filePath === '/output/.precomputed-examples.json'
      ? precomputedExamples
      : {
          Chip: { name: 'Chip', props: [] },
          'ChipGroup-deprecated': { name: 'ChipGroup', props: [] },
        },
  )))

  const response = await GET({} as any)
  const { components } = await response.json()

  expect(response.status).toBe(200)
  expect(components.Chip).toMatchObject({ page: 'chip', hasProps: false })
  expect(components.ChipGroup).toMatchObject({ page: 'chip', hasProps: true })
})
