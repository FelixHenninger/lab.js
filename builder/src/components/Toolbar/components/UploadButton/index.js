import React, { Component } from 'react'

import './style.css'

class UploadButton extends Component {
  handleClick() {
    this.inputField.value = null
    this.inputField.click()
    // When the window comes back into focus,
    // (i.e. when the selection window is
    // closed), blur the button
    window.addEventListener(
      'focus', () => this.button.blur(), { once: true }
    )
  }

  checkFile(file) {
    return (
      file.size <= (this.props.maxSize || 100 * 1024**2) &&
      file.size >= (this.props.minSize || 0)
    )
  }

  handleUpload() {
    // Select the first file that meets all criteria
    const file = Array.from(this.inputField.files)
      .filter( f => this.checkFile(f) )
      .pop()

    // If there is a result, decode it and pass it on
    if (file) {
      const reader = new FileReader()
      reader.onload = e => this.props.onUpload(e.target.result)
      // reader.iMarriedHim
      reader.readAsText(file)
    }
  }

  render() {
    return <div
      className="btn-surrogate"
    >
      {/* TODO: It would be nice to use reactstrap for the button */}
      <button
        className="btn btn-secondary"
        onClick={ () => this.handleClick() }
        ref={ button => this.button = button }
      >
        <i className="fa fa-folder-open-o" aria-hidden="true"></i>
      </button>
      <input
        type="file" id="fileElem"
        accept={ this.props.accept }
        onChange={ () => this.handleUpload() }
        style={{ display: 'none' }}
        ref={ field => this.inputField = field }
      />
    </div>
  }
}

export default UploadButton
