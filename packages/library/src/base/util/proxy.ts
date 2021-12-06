export const rwProxy = (
  source: any,
  target: any,
  handler: Partial<ProxyHandler<object>> = {},
) =>
  new Proxy(
    {},
    {
      // Read from the source
      get: (obj, prop) => Reflect.get(source(), prop),
      // Redirect writes to the target
      set: (obj, prop, value) => Reflect.set(target, prop, value),
      has: (obj, prop) => Reflect.has(source(), prop),
      ownKeys: obj => Reflect.ownKeys(source()),
      getOwnPropertyDescriptor: (obj, prop) =>
        Reflect.getOwnPropertyDescriptor(source(), prop),
      ...handler,
    },
  )
