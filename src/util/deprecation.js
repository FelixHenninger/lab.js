export const renamedOption = (options, oldName, newName) => null

export const renamedMethod = () => null

// 2015 -> 2016: Constructors are called using
// only a single options argument, instead of
// a 'content' argument and an options object
export const multiArgumentConstructor = function(options, args, names, className) {
  if (args.length > 1 || (args.length == 1 && (typeof args[0] !== 'object' || Array.isArray(args[0])))) {
    options = args[names.length] || {}

    console.warn(
      `Calling a constructor with multiple arguments is deprecated
      (e.g. new lab.${ className }(${ names.join(', ') }, options)),
      and the functionality will be removed in future versions.
      Please pass all information using a single options object:
      new lab.${ className }({
        ${ names.map(n => `${ n }: ...`).join(',\n') },
        // ... other options ...
      })`
    )

    // Assign arguments to options anyway
    names.forEach((name, i) => {
      options[name] = args[i]
    })

    return options
  } else {
    return options
  }
}

export default {
  multiArgumentConstructor,
}
