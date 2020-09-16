import React, { Component } from 'react'
import accept from 'attr-accept'

class Uploader extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.inputField = React.createRef()
  }

  // User interactions ---------------------------------------------------------

  handleClick() {
    this.inputField.current.click()
  }

  handleInputChange() {
    // Select the first file that meets all criteria
    const files = Array.from(this.inputField.current.files)
      .filter( f => this.checkFile(f) )

    this.handleFiles(files)
  }

  handleDrop(e) {
    e.stopPropagation()
    e.preventDefault()

    if (e.dataTransfer.items) {
      const files = Array.from(e.dataTransfer.items)
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter(f => this.checkFile(f))

      this.handleFiles(files)
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
        'This file is too large to be opened. ' +
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

  handleFiles(files) {
    Promise.all(files.map(f => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = e => resolve([e.target.result, f])

      // reader.iMarriedHim
      if (this.props.decodeAs === 'text') {
        reader.readAsText(f)
      } else if (this.props.decodeAs === 'dataURL') {
        reader.readAsDataURL(f)
      }
    }))).then(results => {
      this.props.onUpload(results)
    })
  }

  // User interface ------------------------------------------------------------

  render() {
    // TODO: change wrapping <div> to array
    // as soon as react-popper is ready
    const Wrapper = this.props.tag || 'div'

    return <>
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
        multiple={ this.props.multiple }
        style={{ display: 'none' }}
        ref={ this.inputField }
        onChange={ this.handleInputChange }
        // Reset value when selected
        // (so that the same file can be uploaded twice)
        onClick={ (e) => e.target.value = null }
      />
    </>
  }
}

Uploader.defaultProps = {
  minSize: 0,
  maxSize: 2.5 * 1024 ** 2, // 2.5MB ought to be enough for anybody
  accept: '',
  multiple: true,
  decodeAs: 'text',
}

export default Uploader
