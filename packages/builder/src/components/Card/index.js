import React, { Component } from 'react'

import { Card as BaseCard, CardHeader, Badge, CardBody } from 'reactstrap'
import classnames from 'classnames'

class Card extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: props.open !== false
    }
  }

  render() {
    const { title, badge, children,
      className,
      collapsable, wrapContent } = this.props
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
                borderBottomStyle: (this.state.isOpen ? 'solid' : 'none'),
              }}
              onClick={ () => {
                if (collapsable) this.setState({ isOpen: !this.state.isOpen })
              } }
            >
              { title }
              { badge && <>&nbsp;<Badge color="secondary">{ badge }</Badge></> }
            </CardHeader>
          : null
      }
      { this.state.isOpen ? content : null }
    </BaseCard>
  }
}

export default Card
