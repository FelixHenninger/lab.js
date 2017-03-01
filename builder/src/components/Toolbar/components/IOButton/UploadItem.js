import React, { Component } from 'react'
import { DropdownItem } from 'reactstrap'

class UploadItem extends Component {
  handleClick() {
    this.inputField.value = null
    this.inputField.click()
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
    return <DropdownItem
      onClick={ () => this.handleClick() }
    >
      Open
      <input
        type="file" id="fileElem"
        accept={ this.props.accept }
        onChange={ () => this.handleUpload() }
        style={{ display: 'none' }}
        ref={ field => this.inputField = field }
      />
    </DropdownItem>
  }
}

export default UploadItem
