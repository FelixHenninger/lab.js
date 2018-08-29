import defaultSlugify from 'slugify'

export const slugify = title =>
  defaultSlugify(title).toLowerCase()

export const makeFilename = state =>
  // TODO: Simplify this once optional chaining becomes available
  slugify((
    state.components['root'] &&
    state.components['root'].metadata &&
    state.components['root'].metadata.title &&
    state.components['root'].metadata.title.trim()
  ) || 'study')
