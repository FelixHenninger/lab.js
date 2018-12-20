import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ModalHeader, ModalBody } from 'reactstrap'

import { addEmbeddedFile } from '../../logic/util/files'

import Modal from '../Modal'
import Uploader from '../Uploader'
import Icon from '../Icon'

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
    const { path } = addEmbeddedFile(
      this.context.store,
      content, file,
      this.props.component,
    )

    const result = { content, file, path }

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
          <Uploader
            accept="image/*"
            decodeAs="dataURL"
            onUpload={ this.handleUpload }
          >
            <div
              className="btn btn-outline-secondary btn-block text-center p-5"
            >
              <Icon
                icon="file-upload"
                className="d-block text-muted p-3"
                style={{
                  fontSize: '3.5rem',
                }}
              />
              <small className="text-muted">
                Please <strong>drop a file</strong> here,<br />
                or <strong>click to choose</strong> one from your computer
              </small>
            </div>
          </Uploader>
        </ModalBody>
      </div>
    </Modal>
  }
}

FileSelector.contextTypes = {
  store: PropTypes.object
}
