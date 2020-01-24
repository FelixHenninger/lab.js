import React, { useState } from 'react'
import { useStore } from 'react-redux'

import { ModalBody, ModalFooter, Nav, Button } from 'reactstrap'

import MetadataForm from './MetadataForm'
import Files from './Files'
import Editor from '../../../Editor'
import { NavEntry, NavCloseModal } from '../../../Nav'
import Icon from '../../../Icon'

import { makeDataURI, readDataURI } from '../../../../logic/util/dataURI'
import './style.css'

const TabContent = ({ tab }) => {
  // TODO: Refactor to use connect()
  const store = useStore()
  const files = store.getState().files.files
  switch(tab) {
    case 'meta':
      return <MetadataForm />
    case 'files':
      return <Files />
    case 'html':
      return (
        <div className="d-flex flex-column" style={{ minHeight: '60vh' }}>
          <Editor
            key="html"
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
        </div>
      )
    case 'css':
      return (
        <div className="d-flex flex-column" style={{ minHeight: '60vh' }}>
          <Editor
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
        </div>
      )
    default:
      return <div>Requested tab not found</div>
  }
}

const OptionsModal = ({ closeHandler }) => {
  const [tab, setTab] = useState('meta')

  return (
    <div className="modal-content">
      <Nav tabs>
        <NavEntry id="meta" activeId={ tab } setId={ setTab }>
          <Icon icon="info" weight="s" />
        </NavEntry>
        <NavEntry id="files" activeId={ tab } setId={ setTab }>
          <Icon icon="folder" />
        </NavEntry>
        <NavEntry id="html" activeId={ tab } setId={ setTab }>
          HTML
        </NavEntry>
        <NavEntry id="css" activeId={ tab } setId={ setTab }>
          CSS
        </NavEntry>
        <NavCloseModal onClick={ closeHandler } />
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
