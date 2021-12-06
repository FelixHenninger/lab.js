import { Controller } from './controller'

beforeEach(() => {
  const el = document.createElement('div')
  el.dataset['labjsSection'] = 'main'
  document.body.appendChild(el)
})

afterEach(() => {
  const el = document.querySelector('[data-labjs-section="main"]')
  document.body.removeChild(el!)
})

test('can initialize controller', async () => {
  //@ts-ignore
  const c = new Controller({ root: { internals: {} } })
  expect(c instanceof Controller).toBeTruthy()
})
