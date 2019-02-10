import React from 'react'

import { NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'

export const NavEntry = ({ id, activeId, setId, children }) =>
  <NavItem>
    <NavLink
      className={ classnames({
        active: activeId === id
      }) }
      onClick={ () => setId(id) }
    >
      { children }
    </NavLink>
  </NavItem>

export const NavCloseModal = ({ onClick }) =>
  <NavItem
    className="ml-auto"
    style={{
      padding: '0.25em 0',
    }}
  >
    <button
      type="button"
      className="close"
      aria-label="Close"
      onClick={ onClick }
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </NavItem>
