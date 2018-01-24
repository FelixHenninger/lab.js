import React from 'react'
import classnames from 'classnames'

// Font Awesome
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }-webfonts/css/fa-solid.css`)
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }-webfonts/css/fa-regular.css`)
// Uncomment if FA-pro is available
//import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }-webfonts/css/fa-light.css`)
import(`@fortawesome/fontawesome-${ process.env.REACT_APP_FA }-webfonts/css/fontawesome.css`)

export const iconSet = `${ process.env.REACT_APP_FA }`

// Alternate icons in the free set that substitute
// only commercially availble icons.
const replacements = {
  'arrows-v': 'arrows-alt-v',
  'arrows-h': 'arrows-alt-h',
  'long-arrow-down': 'long-arrow-alt-down',
  'long-arrow-right': 'long-arrow-alt-right',
  'repeat': 'redo',
  'tachometer': 'tachometer-alt',
}

const Icon = ({ icon, weight, fallbackWeight, id, className, title, style }) =>
  <i
    className={ classnames(
      `fa${ iconSet === 'pro' ? weight : fallbackWeight } `,
      `fa-${ iconSet === 'pro' ? icon : replacements[icon] || icon }`,
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
