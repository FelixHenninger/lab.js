import defaultSlugify from 'slugify'

export const slugify = title =>
  defaultSlugify(title).toLowerCase()
