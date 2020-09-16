import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Tree extends Component {
  getChildContext() {
    return {
      onNodeClick: this.props.onNodeClick,
      onNodeAdd: this.props.onNodeAdd,
      onNodeDelete: this.props.onNodeDelete,
      onNodeDuplicate: this.props.onNodeDuplicate,
    }
  }

  render() {
    const { Node, rootId } = this.props

    return <Node
      id={ rootId }
      renderBody={ false }
      parentId={ null }
    />
  }
}

Tree.childContextTypes = {
  onNodeClick: PropTypes.func,
  onNodeAdd: PropTypes.func,
  onNodeDelete: PropTypes.func,
  onNodeDuplicate: PropTypes.func,
}

export default Tree
