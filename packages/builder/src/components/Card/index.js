import React, { Component } from 'react'

import { Card as BaseCard, CardHeader, CardBody } from 'reactstrap'
import classnames from 'classnames'

class Card extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: props.open !== false
    }
  }

  render() {
    const { title, children, className, collapsable, wrapContent } = this.props
    const content = wrapContent !== false
      ? <CardBody>{ children }</CardBody>
      : children

    return <BaseCard
        style={ this.props.style }
        className={ classnames('my-1', className) }
      >
      {
        title
          ? <CardHeader
              style={{
                fontWeight: 500,
                borderBottomStyle: (this.state.isOpen ? 'solid' : 'none'),
              }}
              onClick={ () => {
                if (collapsable) this.setState({ isOpen: !this.state.isOpen })
              } }
            >
              { title }
            </CardHeader>
          : null
      }
      { this.state.isOpen ? content : null }
    </BaseCard>
  }
}

export default Card
