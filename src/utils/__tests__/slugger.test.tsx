import { slugger } from '../slugger'

test('slugger', () => {
  expect(slugger("Prefixed with 'pf-v6-c-alert-group'")).toBe(
    'prefixed-with-pf-v6-c-alert-group',
  )
  expect(slugger(' has outer spaces ')).toBe('has-outer-spaces')
  expect(slugger('Multiple  spaces')).toBe('multiple--spaces')
  expect(slugger('MiXeD CaSe')).toBe('mixed-case')
  expect(slugger('!@#$%^&*()')).toBe('')
  expect(slugger('with~tilda')).toBe('with~tilda')
  expect(slugger('with !@# special')).toBe('with--special')
  expect(slugger('page index')).toBe('page-')
  expect(slugger('index')).toBe('')
  expect(slugger('index page')).toBe('index-page')
  expect(slugger('')).toBe('')
  expect(slugger(null)).toBe('')
  expect(slugger(undefined)).toBe('')
  expect(slugger(0)).toBe('0')
  expect(slugger([])).toBe('')
  expect(slugger(true)).toBe('')
  expect(slugger(false)).toBe('')
  expect(slugger(<span>React component</span>)).toBe('')
  expect(slugger(<span></span>)).toBe('')
  expect(slugger([<span key="0">1</span>, <span key="1">2</span>])).toBe('')
})
