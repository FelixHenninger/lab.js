import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ModalBody, ModalFooter, Nav, NavItem, NavLink, Button } from 'reactstrap'
import classnames from 'classnames'

import MetadataForm from './MetadataForm'
import Editor from '../../../Editor'
import Icon from '../../../Icon'

import { makeDataURI, readDataURI } from '../../../../logic/util/dataURI'
import './style.css'

class OptionsModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: 'meta'
    }
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      })
    }
  }

  tabContent() {
    const files = this.context.store.getState().files.files
    switch(this.state.activeTab) {
      case 'meta':
        return <MetadataForm />
      case 'html':
        return <Editor
          key="html"
          height="400"
          value={ readDataURI(files['index.html'].content).data }
          onChange={
            newContent => this.context.store.dispatch({
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
            newContent => this.context.store.dispatch({
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

  render() {
    const { closeHandler } = this.props
    return <div className="modal-content">
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'meta' })}
            onClick={() => { this.toggle('meta'); }}
          >
            <Icon icon="info" weight="s" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'html' })}
            onClick={() => { this.toggle('html'); }}
          >
            HTML
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === 'css' })}
            onClick={() => { this.toggle('css'); }}
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
        { this.tabContent() }
      </ModalBody>
      <ModalFooter>
        <Button
          outline color="secondary"
          onClick={ closeHandler }
        >
          Close
        </Button>
      </ModalFooter>
    </div>
  }
}

OptionsModal.contextTypes = {
  store: PropTypes.object,
}

export default OptionsModal
