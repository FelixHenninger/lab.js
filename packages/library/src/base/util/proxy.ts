export const rwProxy = (
  source: any,
  target: any,
  handler: Partial<ProxyHandler<object>> = {},
) =>
  new Proxy(
    {},
    {
      // Read from the source
      get: (_, prop) => Reflect.get(source(), prop),
      // Redirect writes to the target
      set: (_, prop, value) => Reflect.set(target, prop, value),
      has: (_, prop) => Reflect.has(source(), prop),
      ownKeys: () => Reflect.ownKeys(source()),
      getOwnPropertyDescriptor: (_, prop) =>
        Reflect.getOwnPropertyDescriptor(source(), prop),
      ...handler,
    },
  )
