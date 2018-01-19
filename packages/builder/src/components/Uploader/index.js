import React, { Component } from 'react'

class Uploader extends Component {
  constructor() {
    super()
    this.handleClick = this.handleClick.bind(this)
    this.handleUpload = this.handleUpload.bind(this)
  }

  handleClick() {
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
    // TODO: change wrapping <div> to array
    // as soon as react-popper is ready
    const Wrapper = this.props.tag || 'div'

    return <div>
      <Wrapper
        onClick={ this.handleClick }
        className={ this.props.className }
      >
        { this.props.children }
      </Wrapper>
      <input
        type="file"
        accept={ this.props.accept }
        style={{ display: 'none' }}
        ref={ field => this.inputField = field }
        onChange={ this.handleUpload }
        // Reset value when selected
        // (so that the same file can be uploaded twice)
        onClick={ (e) => e.target.value = null }
      />
    </div>
  }
}

export default Uploader
