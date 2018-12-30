import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ModalHeader, ModalBody } from 'reactstrap'

import { addGlobalFile, addLocalFile } from '../../logic/util/files'

import Modal from '../Modal'

import UploadTab from './Components/UploadTab'

export default class FileSelector extends Component {
  constructor(props) {
    super(props)

    this.state = {
      active: false,
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

  render() {
    return <Modal
      isOpen={ this.state.active }
    >
      <div className="modal-content">
        <ModalHeader
          toggle={ this.toggle }
        >
          New image
        </ModalHeader>
        <ModalBody>
          <UploadTab handleUpload={ this.handleUpload } />
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
