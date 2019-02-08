import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { ModalBody, ModalFooter, Nav, NavItem, NavLink, Button } from 'reactstrap'
import classnames from 'classnames'

import MetadataForm from './MetadataForm'
import Files from './Files'
import Editor from '../../../Editor'
import Icon from '../../../Icon'

import { makeDataURI, readDataURI } from '../../../../logic/util/dataURI'
import './style.css'

const TabContent = ({ tab }, { store }) => {
  const files = store.getState().files.files
  switch(tab) {
    case 'meta':
      return <MetadataForm />
    case 'files':
      return <Files />
    case 'html':
      return <Editor
        key="html"
        height="400"
        value={ readDataURI(files['index.html'].content).data }
        onChange={
          newContent => store.dispatch({
            type: 'UPDATE_FILE',
            file: 'index.html',
            data: {
              content: makeDataURI(newContent, 'text/html')
            }
          })
        }
      />
    case 'css':
      return <Editor
        key="css"
        height="400"
        language="css"
        value={ readDataURI(files['style.css'].content).data }
        onChange={
          newContent => store.dispatch({
            type: 'UPDATE_FILE',
            file: 'style.css',
            data: {
              content: makeDataURI(newContent, 'text/css')
            }
          })
        }
      />
    default:
      return <div>Requested tab not found</div>
  }
}

TabContent.contextTypes = {
  store: PropTypes.object,
}

const OptionsModal = ({ closeHandler }) => {
  const [tab, setTab] = useState('meta')

  return (
    <div className="modal-content">
      <Nav tabs>
        <NavItem>
          <NavLink
            className={ classnames({ active: tab === 'meta' }) }
            onClick={ () => setTab('meta') }
          >
            <Icon icon="info" weight="s" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={ classnames({ active: tab === 'files' }) }
            onClick={ () => setTab('files') }
          >
            <Icon icon="folder" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={ classnames({ active: tab === 'html' }) }
            onClick={ () => setTab('html') }
          >
            HTML
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={ classnames({ active: tab === 'css' }) }
            onClick={ () => setTab('css') }
          >
            CSS
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
        <TabContent tab={ tab } />
      </ModalBody>
      <ModalFooter>
        <Button
          outline color="secondary"
          onClick={ closeHandler }
        >
          Done
        </Button>
      </ModalFooter>
    </div>
  )
}

export default OptionsModal
