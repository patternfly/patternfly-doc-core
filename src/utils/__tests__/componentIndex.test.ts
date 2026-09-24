import { readFile } from 'fs/promises'
import { getCollection } from 'astro:content'
import { GET } from '../../pages/api/component-index.json'
import { generateApiIndex } from '../apiIndex/generate'

jest.mock('fs/promises', () => ({ readFile: jest.fn() }))
jest.mock('astro:content', () => ({ getCollection: jest.fn() }))
jest.mock('../../content', () => ({ content: [{ name: 'react-component-docs', version: 'v6' }] }))
jest.mock('../getOutputDir', () => ({ getOutputDir: jest.fn().mockResolvedValue('/output') }))
jest.mock('../extractReactTokens', () => ({ extractReactTokens: jest.fn().mockResolvedValue([]) }))

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  ;(getCollection as jest.Mock).mockResolvedValue([
    { data: { section: 'components', id: 'Navigation', tab: 'react', propComponents: ['Nav', 'NavItem', 'NavMissingProps'] }, body: '', filePath: '/components/Nav.md' },
    { data: { section: 'components', subsection: 'file-upload', id: 'Simple file upload', tab: 'react', propComponents: ['FileUpload', 'FileUploadField'] }, body: '', filePath: '/components/FileUpload.md' },
    { data: { section: 'components', id: 'Form', tab: 'react', propComponents: ['ActionGroup', 'Form'] }, body: '', filePath: '/components/Form.md' },
    { data: { section: 'components', id: 'Navigation', tab: 'html' }, body: '', filePath: '/html/Nav.md' },
    { data: { section: 'components', id: 'Navigation', tab: 'react', propComponents: ['OldNav'] }, body: '', filePath: '/deprecated/components/Nav.md' },
    { data: { section: 'components', id: 'Chip', tab: 'react-deprecated', propComponents: ['Chip', 'ChipGroup'] }, body: '', filePath: '/deprecated/components/Chip.md' },
    { data: { section: 'components', id: 'Table', tab: 'react', propComponents: ['Table'] }, body: '', filePath: '/components/Table.md' },
    { data: { section: 'extensions', subsection: 'data-view', id: 'Table', tab: 'react', propComponents: ['DataViewTable'] }, body: '', filePath: '/extensions/DataViewTable.md' },
    { data: { section: 'foundations-and-styles', subsection: 'layouts', id: 'Flex', tab: 'react', propComponents: ['Flex', 'FlexItem'] }, body: '<LiveExample src={FlexBasic} />', filePath: '/layouts/Flex.md' },
  ])
  ;(readFile as jest.Mock).mockResolvedValue(JSON.stringify(Object.fromEntries(
    ['Nav', 'NavItem', 'FileUpload', 'FileUploadField', 'ActionGroup', 'Form', 'Flex', 'FlexItem', 'Chip-deprecated', 'ChipGroup-deprecated', 'Table', 'DataViewTable'].map((name) => [name, { name, props: [] }]),
  )))
})

afterEach(() => jest.restoreAllMocks())

it('retains active frontmatter mappings without HTML or deprecated entries overwriting them', async () => {
  const index = await generateApiIndex()
  expect(index.propComponents?.['v6::components::navigation']).toEqual(['Nav', 'NavItem', 'NavMissingProps'])
  expect(index.propComponents?.['v6::components::chip']).toEqual(['Chip', 'ChipGroup'])
  expect(index.propComponents?.['v6::foundations-and-styles::layouts_flex']).toEqual(['Flex', 'FlexItem'])
  expect(index.examples['v6::foundations-and-styles::layouts_flex::react']).toEqual([{ exampleName: 'FlexBasic', title: null }])
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
  // Only props are read from disk: an old apiIndex.json cannot seed the new index.
  expect(readFile).toHaveBeenCalledTimes(1)
  expect(readFile).toHaveBeenCalledWith('/output/props.json', 'utf-8')
})
