import { capitalize } from "@patternfly/react-core";

it('capitalize', () => {
  expect(capitalize('foo')).toBe('Foo');
});