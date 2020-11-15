import { Lock } from './lock'

test('Basic functionality', async () => {
  const l = new Lock()

  const p = l.acquire()
  setTimeout(() => l.release('foo'), 25)
  await l.wait()

  expect(p).resolves.toBe('foo')
})
