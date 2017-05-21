import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ModalBody, ModalFooter, Nav, NavItem, NavLink, Button } from 'reactstrap'
import Editor from '../../../Editor'
import classnames from 'classnames'

import './style.css'

class OptionsModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeTab: 'html'
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
      case 'html':
        return <Editor
          key="html"
          height="400"
          value={ files['index.html'].content }
          onChange={
            newContent => this.context.store.dispatch({
              type: 'UPDATE_FILE',
              file: 'index.html',
              data: {
                content: newContent
              }
            })
          }
        />
      case 'css':
        return <Editor
          key="css"
          height="400"
          language="css"
          value={ files['style.css'].content }
          onChange={
            newContent => this.context.store.dispatch({
              type: 'UPDATE_FILE',
              file: 'style.css',
              data: {
                content: newContent
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
          color="secondary"
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
