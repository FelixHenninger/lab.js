import { setupTestingContext } from '../core/test/helpers'
import { Screen } from './screen'

setupTestingContext()

it('inserts HTML into the document', async () => {
  const h = new Screen()
  h.options.content = '<strong>Hello World!</strong>'

  const el = document.querySelector('[data-labjs-section="main"]')
  await h.run()

  expect(el?.innerHTML).toEqual('<strong>Hello World!</strong>')
})
