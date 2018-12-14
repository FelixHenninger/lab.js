import React, { Component } from 'react'
import accept from 'attr-accept'

class Uploader extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  // User interactions ---------------------------------------------------------

  handleClick() {
    this.inputField.click()
  }

  handleInputChange() {
    // Select the first file that meets all criteria
    const file = Array.from(this.inputField.files)
      .filter( f => this.checkFile(f) )
      .pop()

    this.handleFile(file)
  }

  handleDrop(e) {
    e.stopPropagation()
    e.preventDefault()

    if (e.dataTransfer.items) {
      const file = Array.from(e.dataTransfer.items)
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter(f => this.checkFile(f))
        .pop()

      this.handleFile(file)
      e.dataTransfer.items.clear()
    }
  }

  handleDragOver(e) {
    // Capturing this event is necessary
    // for the drop action to work
    e.stopPropagation()
    e.preventDefault()
  }

  // Internal file processing --------------------------------------------------

  checkFile(file) {
    if (file.size > this.props.maxSize) {
      alert(
        'This file is to large to be opened. ' +
        'Please contact support for assistance!'
      )
    }

    return (
      file.size <= this.props.maxSize &&
      file.size >= this.props.minSize &&
      accept({
        name: file.name,
        type: file.type,
      }, this.props.accept)
    )
  }

  handleFile(file) {
    // If there is a result, decode it and pass it on
    if (file) {
      const reader = new FileReader()
      reader.onload = e => this.props.onUpload(e.target.result, file)
      // reader.iMarriedHim
      if (this.props.decodeAs === 'text') {
        reader.readAsText(file)
      } else if (this.props.decodeAs === 'dataURL') {
        reader.readAsDataURL(file)
      }
    }
  }

  // User interface ------------------------------------------------------------

  render() {
    // TODO: change wrapping <div> to array
    // as soon as react-popper is ready
    const Wrapper = this.props.tag || 'div'

    return <div>
      <Wrapper
        className={ this.props.className }
        onClick={ this.handleClick }
        onDrop={ this.handleDrop }
        onDragOver={ this.handleDragOver }
      >
        { this.props.children }
      </Wrapper>
      <input
        type="file"
        accept={ this.props.accept }
        style={{ display: 'none' }}
        ref={ field => this.inputField = field }
        onChange={ this.handleInputChange }
        // Reset value when selected
        // (so that the same file can be uploaded twice)
        onClick={ (e) => e.target.value = null }
      />
    </div>
  }
}

Uploader.defaultProps = {
  minSize: 0,
  maxSize: 100 * 1024 ** 2,
  accept: '',
  decodeAs: 'text',
}

export default Uploader
