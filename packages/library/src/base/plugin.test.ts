import { Component } from './component'
import { Plugin, PluginAPI } from './plugin'

it('Calls plugin for registration', () => {
  const p = new Plugin()
  const spy = jest.spyOn(p, 'handle')
  const c = new Component({ id: 'c', plugins: [p] })

  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(c, 'pluginAdd')
})

it('Calls plugin handle method on component event', () => {
  const p = new Plugin()
  const spy = jest.spyOn(p, 'handle')
  const c = new Component({ id: 'c', plugins: [p] })

  c.internals.emitter.trigger('foo', 'bar')

  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy).toHaveBeenLastCalledWith(c, 'foo', 'bar')
})

it('Default plugin calls handler methods by name', () => {
  const p = new Plugin()

  const spyHandle = jest.spyOn(p, 'handle')
  //@ts-ignore
  p.onPluginAdd = () => {}
  //@ts-ignore
  const spyPluginAdd = jest.spyOn(p, 'onPluginAdd')
  //@ts-ignore
  p.onFoo = () => {}
  //@ts-ignore
  const spyFoo = jest.spyOn(p, 'onFoo')

  const c = new Component({ id: 'c', plugins: [p] })
  expect(spyHandle).toHaveBeenCalledTimes(1)
  expect(spyPluginAdd).toHaveBeenCalledTimes(1)
  expect(spyPluginAdd).toHaveBeenLastCalledWith(c)

  c.internals.emitter.trigger('foo', 'bar')
  expect(spyHandle).toHaveBeenCalledTimes(2)
  expect(spyFoo).toHaveBeenCalledTimes(1)
  expect(spyFoo).toHaveBeenLastCalledWith(c, 'bar')
})

it('Calls plugin handler with appropriate context', () => {
  const p = new Plugin()
  const c = new Component({ id: 'c', plugins: [p] })

  let context = undefined

  //@ts-ignore
  p.onFoo = function () {
    context = this
  }
  //@ts-ignore
  const spy = jest.spyOn(p, 'onFoo')
  c.internals.emitter.trigger('foo', 'bar')

  expect(context).toEqual(p)
})
