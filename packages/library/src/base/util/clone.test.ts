import { Component } from '../component'
import { clone } from './clone'

// Shim class with arbitrary options
type CustomOptions = { [key: string]: any }
class CustomComponent extends Component {
  options!: CustomOptions

  constructor(options: Partial<CustomOptions> = {}) {
    super(options)
  }
}

// Shim class with nested components
class Nested extends CustomComponent {}
Nested.metadata.nestedComponents = ['content']

it('can clone a component', () => {
  const a = new CustomComponent({
    foo: 'bar',
  })
  const b = clone(a)

  expect(b.options).toEqual(a.options)
})

it('incorporates further options', () => {
  const a = new CustomComponent({
    constantProperty: 'original',
    overwrittenProperty: 'original',
  })
  const b = clone(a, { overwrittenProperty: 'modified' })

  expect(b.options.constantProperty).toBe('original')
  expect(b.options.overwrittenProperty).toBe('modified')
})

it('instantiates directly nested components during cloning', () => {
  const c = new CustomComponent()
  const f = new Nested({ content: c })

  const f1 = clone(f)

  expect(f1.options.content).toBeInstanceOf(Component)
  expect(f1.options.content).not.toEqual(f.options.content)
})

it('instantiates nested components in list during cloning', () => {
  const c1 = new CustomComponent({ foo: 'bar' })
  const c2 = new CustomComponent()
  const f = new Nested({ content: [c1, c2] })

  const f1 = clone(f)

  expect(f1.options.content).toBeInstanceOf(Array)
  expect(f1.options.content).not.toEqual(f.options.content)
  expect(
    f1.options.content.every((c: Component) => c instanceof Component),
  ).toBeTruthy()
  expect(f1.options.content[0].options.foo).toBe('bar')
})
