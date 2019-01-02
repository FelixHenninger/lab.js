import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Nav, NavItem, NavLink, ModalBody } from 'reactstrap'
import classnames from 'classnames'

import { addGlobalFile, addLocalFile } from '../../logic/util/files'

import Modal from '../Modal'
import Icon from '../Icon'

import UploadTab from './Components/UploadTab'

export default class FileSelector extends Component {
  constructor(props) {
    super(props)

    this.state = {
      active: false,
      activeTab: 'new',
    }
    this.promiseHandlers = {}

    this.handleUpload = this.handleUpload.bind(this)
    this.select = this.select.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState((prevState) => {
      // Reject promise
      if (prevState.active && this.promiseHandlers.reject) {
        this.promiseHandlers.reject('FileSelector hidden')
      }

      // Switch state
      return { active: !prevState.active }
    })
  }

  toggleTab(name) {
    this.setState({
      activeTab: name
    })
  }

  handleUpload(content, file) {
    const { poolPath } = addGlobalFile(
      this.context.store,
      content, file
    )

    const result = {
      localPath: file.name,
      poolPath,
    }

    if (this.props.component && this.props.addToComponent) {
      addLocalFile(this.context.store, {
        component: this.props.component,
        localPath: result.localPath,
        poolPath,
      })
    }

    // Resolve promise
    if (this.promiseHandlers.resolve) {
      this.promiseHandlers.resolve(result)
    }

    return result
  }

  async select() {
    this.toggle()
    return new Promise(
      (resolve, reject) => {
        this.promiseHandlers = {
          resolve: result => {
            this.setState({ active: false })
            return resolve(result)
          },
          reject
        }
      }
    )
  }

  renderTab() {
    switch (this.state.activeTab) {
      default:
        return <UploadTab handleUpload={ this.handleUpload } />
    }
  }

  render() {
    return <Modal
      isOpen={ this.state.active }
    >
      <div className="modal-content">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={ classnames({
                active: this.state.activeTab === 'new'
              }) }
              onClick={ () => this.toggleTab('new') }
            >
              <Icon icon="plus" weight="s" />
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
              onClick={ this.toggle }
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </NavItem>
        </Nav>
        <ModalBody>
          { this.renderTab() }
        </ModalBody>
      </div>
    </Modal>
  }
}

FileSelector.contextTypes = {
  store: PropTypes.object
}

FileSelector.defaultProps = {
  addToComponent: true,
}
