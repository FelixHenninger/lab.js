import { getEventMethodName } from './eventName'

it('Generates basic method names', () => {
  expect(getEventMethodName('foo')).toBe('onFoo')
})

it('Handles split method names', () => {
  expect(getEventMethodName('foo:bar')).toBe('onFooBar')
})
