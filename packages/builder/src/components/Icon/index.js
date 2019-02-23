import React from 'react'
import classnames from 'classnames'

// Font Awesome
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }/css/solid.css`)
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }/css/regular.css`)
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }/css/brands.css`)
// Uncomment if FA-pro is available
//import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }/css/light.css`)
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }/css/fontawesome.css`)

export const iconSet = `${ process.env.REACT_APP_FA }`

// Alternate icons in the free set that substitute
// only commercially availble icons.
const replacements = {
  'alarm-clock': 'clock',
  'arrows-v': 'arrows-alt-v',
  'arrows-h': 'arrows-alt-h',
  'expand': 'square',
  'file-exclamation': 'exclamation-circle',
  'flask-potion': 'flask',
  'heart-circle': 'heart',
  'long-arrow-down': 'long-arrow-alt-down',
  'long-arrow-right': 'long-arrow-alt-right',
  'repeat': 'redo',
  'tachometer': 'tachometer-alt',
  'tachometer-average': 'tachometer-alt',
  'volume': 'volume-up',
}

const Icon = ({ icon, fixedWidth, weight, fallback, fallbackWeight,
  id, className, title, style }) =>
  <i
    className={ classnames(
      `fa${ iconSet === 'pro' ? weight : fallbackWeight } `,
      `fa-${ iconSet === 'pro' ? icon : replacements[icon] || fallback || icon }`,
      fixedWidth ? 'fa-fw' : null,
      className
    )}
    aria-hidden
    { ...{ id, title, style } }
  />

Icon.defaultProps = {
  weight: 'r',
  fallbackWeight: 's',
}

export default Icon
