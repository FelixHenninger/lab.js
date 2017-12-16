import defaultSlugify from 'slugify'

export const slugify = title =>
  defaultSlugify(title).toLowerCase()

export const makeFilename = state =>
  slugify(state.components['root'].metadata.title || 'study')
