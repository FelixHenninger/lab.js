import React from 'react'
import classnames from 'classnames'

import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';

export const iconSet = '@fortawesome/fontawesome-free'

// Alternate icons in the free set that substitute
// only commercially availble icons.
const replacements = {
  'alarm-clock': 'clock',
  'arrows-v': 'arrows-alt-v',
  'arrows-h': 'arrows-alt-h',
  'bullseye-pointer': 'hand-pointer',
  'comment-alt-minus': 'comment-alt',
  'comment-alt-lines': 'comment-alt',
  'ellipsis-h-alt': 'ellipsis-h',
  expand: 'square',
  'file-exclamation': 'exclamation-circle',
  'flask-potion': 'flask',
  'heart-circle': 'heart',
  'lock-alt': 'lock',
  'long-arrow-down': 'long-arrow-alt-down',
  'long-arrow-right': 'long-arrow-alt-right',
  repeat: 'redo',
  'spinner-third': 'spinner',
  tachometer: 'tachometer-alt',
  'tachometer-average': 'tachometer-alt',
  volume: 'volume-up',
}

const Icon = ({
  icon,
  fixedWidth,
  weight,
  fallback,
  fallbackWeight,
  id,
  className,
  title,
  style,
}) => (
  <i
    className={classnames(
      `fa${iconSet === 'pro' ? weight : fallbackWeight} `,
      `fa-${iconSet === 'pro' ? icon : replacements[icon] || fallback || icon}`,
      fixedWidth ? 'fa-fw' : null,
      className,
    )}
    aria-hidden
    {...{ id, title, style }}
  />
)

Icon.defaultProps = {
  weight: 'r',
  fallbackWeight: 's',
}

export default Icon
