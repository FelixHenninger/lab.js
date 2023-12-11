import { Lock } from './lock'

it('provides basic functionality', async () => {
  const l = new Lock()

  const p = l.acquire()
  setTimeout(() => l.release('foo'), 25)
  await l.wait()

  await expect(p).resolves.toBe('foo')
})
