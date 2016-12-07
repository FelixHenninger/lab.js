import React, { Component } from 'react'
import { Card as BaseCard, CardHeader, CardBlock } from 'reactstrap'

class Card extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: props.open !== false
    }
  }
  
  render() {
    const { title, children } = this.props
    return <BaseCard>
      <CardHeader
        style={{
          borderBottomStyle: (this.state.isOpen ? 'solid' : 'none')
        }}
        onClick={() => this.setState({ isOpen: !this.state.isOpen })}
      >
        { title }
      </CardHeader>
      { this.state.isOpen ? <CardBlock>{ children }</CardBlock> : null }
    </BaseCard>
  }
}

export default Card
