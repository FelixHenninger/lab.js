import React, { useState } from 'react'

import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'

import Icon from '../../../Icon'

import NewTab from './components/newTab'
import TemplateTab from './components/templateTab'
import CopyTab from './components/copyTab'
import ImportTab from './components/importTab'

const TabContent = ({ tab, ...tabProps }) => {
  switch(tab) {
    case 'new':
      return <NewTab { ...tabProps } />
    case 'template':
      return <TemplateTab { ...tabProps } />
    case 'copy':
      return <CopyTab { ...tabProps } />
    case 'import':
      return <ImportTab { ...tabProps } />
    default:
      return <div>Requested tab not found</div>
  }
}

export default ({ parent, index, closeHandler }) => {
  const [tab, setTab] = useState('new')

  return (
    <div className="modal-content">
      <Nav tabs>
        <NavItem>
          <NavLink
            className={ classnames({
              active: tab === 'new'
            }) }
            onClick={ () => setTab('new') }
          >
            <Icon icon="plus" weight="s" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={ classnames({
              active: tab === 'copy'
            }) }
            onClick={ () => setTab('copy') }
          >
            <Icon icon="clone" fallbackWeight="r" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={ classnames({
              active: tab === 'template'
            }) }
            onClick={ () => setTab('template') }
          >
            <Icon icon="box-open" fallbackWeight="s" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={ classnames({
              active: tab === 'import'
            }) }
            onClick={ () => setTab('import') }
          >
            <Icon icon="folder-open" fallbackWeight="r" />
          </NavLink>
        </NavItem>
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
            onClick={ closeHandler }
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </NavItem>
      </Nav>
      <ModalBody>
        <TabContent tab={ tab } parent={ parent } index={ index }/>
      </ModalBody>
      <ModalFooter>
        <Button
          outline color="secondary"
          onClick={ closeHandler }
          >
          Cancel
        </Button>
      </ModalFooter>
    </div>
  )
}
