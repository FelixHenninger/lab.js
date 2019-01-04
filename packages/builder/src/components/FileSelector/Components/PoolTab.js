import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { CustomInput, ListGroup, ListGroupItem } from 'reactstrap'
import { repeat } from 'lodash'

import { flatTree } from '../../../logic/tree'

// TODO: Move this component to state hooks
// once they become available (planned for Q1 2019)
// (this is a straightforward extension of an
// earlier version of this component, see git
// history)

class PoolTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      component: this.props.component
    }
  }

  render() {
    const store = this.context.store

    const components = store.getState().components
    const files = components[this.state.component].files
      ? components[this.state.component].files.rows.map(r => r[0])
      : []

    return <div>
      <CustomInput
        type="select"
        id="component"
        bsSize="lg"
        className="mb-2 font-weight-bold"
        defaultValue={ this.state.component }
        onChange={ e => this.setState({ component: e.target.value }) }
      >
        {
          flatTree(components).map(
            ([id, level, data], index) =>
              <option
                value={ id } key={ index }
              >
                { level > 0 ? repeat(' ', level - 1) + '∙ ' : '' }
                { data.title }
              </option>
          )
        }
      </CustomInput>
      <ListGroup>
        {
          files.map((f, index) =>
            <ListGroupItem
              action tag="a"
              key={ index }
              style={{
                fontFamily: 'Fira Mono'
              }}
              onClick={ () => this.props.handleImport(
                this.state.component,
                f.localPath
              ) }
            >
              { f.localPath }
            </ListGroupItem>
          )
        }
      </ListGroup>
    </div>
  }
}

PoolTab.contextTypes = {
  store: PropTypes.object
}

export default PoolTab
