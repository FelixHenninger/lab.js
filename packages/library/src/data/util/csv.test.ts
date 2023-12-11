import { escapeCell } from './csv'

it('escapes commas', () => {
  expect(escapeCell(',')).toEqual('","')
})

it('escapes double quotation marks', () => {
  expect(escapeCell('"content')).toEqual('"""content"')
})

it('escapes double double quotation marks', () => {
  expect(escapeCell('""content')).toEqual('"""""content"')
})

it('escapes commas', () => {
  expect(escapeCell(',')).toEqual('","')
})

it('escapes cells beginning with an equal sign', () => {
  expect(escapeCell('=UNSAFE()')).toEqual(`'=UNSAFE()`)
})

it(`doesn't escape an equal sign elsewhere in the cell`, () => {
  expect(escapeCell('this is =SAFE()')).toEqual('this is =SAFE()')
})

it(`doesn't escape a number`, () => {
  expect(escapeCell(123)).toEqual(123)
})

it(`doesn't escape booleans`, () => {
  expect(escapeCell(false)).toEqual(false)
})

it(`doesn't modify the input value if it is a primtive`, () => {
  const input = ','
  const originalInput = input

  expect(escapeCell(input)).toEqual('","')
  expect(input).toEqual(originalInput)
  expect(originalInput).toEqual(',')
})

it(`doesn't modify the input value if it is an object`, () => {
  const input = { abc: '123' }
  const originalInput = input

  expect(escapeCell(input)).toEqual('"{""abc"":""123""}"')
  expect(input).toEqual(originalInput)
})
