import * as lab from './index'

it('loads the entire library', () => {
  const modules = ['core', 'data', 'flow', 'canvas', 'html', 'plugins', 'util']

  for (const m of modules) {
    expect(lab).toHaveProperty(m)
  }
})
