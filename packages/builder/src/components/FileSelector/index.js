import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Nav, NavItem, NavLink, ModalBody } from 'reactstrap'
import classnames from 'classnames'

import { addFiles, getLocalFile } from '../../logic/util/files'

import Modal from '../Modal'
import Icon from '../Icon'

import UploadTab from './Components/UploadTab'
import PoolTab from './Components/PoolTab'

export default class FileSelector extends Component {
  constructor(props) {
    super(props)

    this.state = {
      active: false,
      activeTab: 'new',
    }
    this.promiseHandlers = {}

    this.handleUpload = this.handleUpload.bind(this)
    this.handleImport = this.handleImport.bind(this)
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

  handleUpload(files) {
    const result = addFiles(
      this.context.store,
      files.map(([content, file]) => ({
        localPath: file.name,
        component: this.props.component,
        data: {
          content,
        },
      }))
    )

    // Resolve promise
    if (this.promiseHandlers.resolve) {
      this.promiseHandlers.resolve(result)
    }

    return result
  }

  handleImport(sourceComponent, sourceLocalPath) {
    const { poolPath } = getLocalFile(
      this.context.store,
      sourceComponent,
      sourceLocalPath
    )
    // TODO: Consider whether it is ever possible
    // that a file lookup might fail, and add error
    // handling if so.

    const result = [{
      localPath: sourceLocalPath,
      poolPath,
    }]

    if (
      this.props.component && this.props.addToComponent &&
      this.props.component !== sourceComponent
    ) {
      addFiles(this.context.store, [{
        component: this.props.component,
        localPath: result[0].localPath,
        poolPath,
      }])
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
      case 'pool':
        return <PoolTab
          initialComponent={ this.props.component }
          accept={ this.props.accept }
          handleImport={ this.handleImport }
        />
      default:
        return <UploadTab
          accept={ this.props.accept }
          handleUpload={ this.handleUpload }
        />
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
          <NavItem>
            <NavLink
              className={ classnames({
                active: this.state.activeTab === 'pool'
              }) }
              onClick={ () => this.toggleTab('pool') }
            >
              <Icon icon="folder" />
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
  accept: '',
}
