import { Controller } from './controller'
import { setupTestingContext } from './test/helpers'

setupTestingContext()

it('can initialize controller', async () => {
  //@ts-ignore
  const c = new Controller({ root: { internals: {} } })
  expect(c instanceof Controller).toBeTruthy()
})
