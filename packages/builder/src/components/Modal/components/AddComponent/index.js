import React, { useState } from 'react'

import { Button, ModalBody, ModalFooter, Nav } from 'reactstrap'

import Icon from '../../../Icon'
import { NavEntry, NavCloseModal } from '../../../Nav'

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
        <NavEntry id="new" activeId={ tab } setId={ setTab }>
          <Icon icon="plus" weight="s" />
        </NavEntry>
        <NavEntry id="copy" activeId={ tab } setId={ setTab }>
          <Icon icon="clone" fallbackWeight="r" />
        </NavEntry>
        <NavEntry id="template" activeId={ tab } setId={ setTab }>
          <Icon icon="box-open" fallbackWeight="s" />
        </NavEntry>
        <NavEntry id="import" activeId={ tab } setId={ setTab }>
          <Icon icon="folder-open" fallbackWeight="r" />
        </NavEntry>
        <NavCloseModal onClick={ closeHandler } />
      </Nav>
      <ModalBody>
        <TabContent tab={ tab } parent={ parent } index={ index } />
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
