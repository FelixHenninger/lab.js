import { escapeCell } from './csv'

test('escapes commas', () => {
  expect(escapeCell(',')).toEqual('","')
})

test('escapes double quotation marks', () => {
  expect(escapeCell('"content')).toEqual('"""content"')
})

test('escapes double double quotation marks', () => {
  expect(escapeCell('""content')).toEqual('"""""content"')
})

test('escapes commas', () => {
  expect(escapeCell(',')).toEqual('","')
})

test('escapes cells beginning with an equal sign', () => {
  expect(escapeCell('=UNSAFE()')).toEqual(`'=UNSAFE()`)
})

test(`doesn't escape an equal sign elsewhere in the cell`, () => {
  expect(escapeCell('this is =SAFE()')).toEqual('this is =SAFE()')
})

test(`doesn't escape a number`, () => {
  expect(escapeCell(123)).toEqual(123)
})

test(`doesn't escape booleans`, () => {
  expect(escapeCell(false)).toEqual(false)
})

test(`doesn't modify the input value if it is a primtive`, () => {
  let input = ','
  let originalInput = input

  expect(escapeCell(input)).toEqual('","')
  expect(input).toEqual(originalInput)
  expect(originalInput).toEqual(',')
})

test(`doesn't modify the input value if it is an object`, () => {
  let input = { abc: '123' }
  let originalInput = input

  expect(escapeCell(input)).toEqual('"{""abc"":""123""}"')
  expect(input).toEqual(originalInput)
})
