import { Controller } from './controller'
import { setupTestingContext } from './test/helpers'

setupTestingContext()

it('can initialize controller', () => {
  //@ts-expect-error - LEGACY
  const c = new Controller({ root: { internals: {} } })
  expect(c instanceof Controller).toBeTruthy()
})
