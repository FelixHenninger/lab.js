import { resolveFlip } from './flipIterable'

it('detects differences between two adjacent stacks', () => {
  const result = resolveFlip(['a1', 'b1', 'c1'], ['a1', 'b2', 'c2'])
  expect(result.incoming).toEqual(['b2', 'c2'])
  expect(result.outgoing).toEqual(['b1', 'c1'])
})

it('uses the first stack difference to detect changes', () => {
  const result = resolveFlip(
    ['a1', 'b1', 'c1'],
    ['a1', 'b2', 'c1'], // c1 duplicated
  )
  expect(result.incoming).toEqual(['b2', 'c1'])
  expect(result.outgoing).toEqual(['b1', 'c1'])
})

it('returns empty if no difference in stacks', () => {
  const result = resolveFlip(
    ['a1', 'b1', 'c1'],
    ['a1', 'b1', 'c1'], // c1 duplicated
  )
  expect(result.incoming).toEqual([])
  expect(result.outgoing).toEqual([])
})
