import { capitalize } from '../capitalize'
import { test, expect } from 'vitest'

test('capitalize', () => {
  expect(capitalize('foo')).toBe('Foo')
})
