import React, { Component } from 'react'

class Tree extends Component {
  getChildContext() {
    return {
      onNodeClick: this.props.onNodeClick,
      onNodeAdd: this.props.onNodeAdd,
      onNodeDelete: this.props.onNodeDelete,
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
  onNodeClick: React.PropTypes.func,
  onNodeAdd: React.PropTypes.func,
  onNodeDelete: React.PropTypes.func,
};

export default Tree
