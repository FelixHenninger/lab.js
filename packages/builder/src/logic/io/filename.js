import { slugify } from '../util/slug'

export const makeFilename = state =>
  // TODO: Simplify this once optional chaining becomes available
  slugify((
    state.components['root'] &&
    state.components['root'].metadata &&
    state.components['root'].metadata.title &&
    state.components['root'].metadata.title.trim()
  ) || 'study')
