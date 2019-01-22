import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { CustomInput, ListGroup, ListGroupItem } from 'reactstrap'
import { repeat } from 'lodash'
import accept from 'attr-accept'

import { flatTree } from '../../../logic/tree'
import { mimeFromDataURI } from '../../../logic/util/dataURI'
import { mimeToIcon } from '../../../logic/util/fileType';
import Icon from '../../Icon';

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
    const { components, files: { files } } = this.context.store.getState()

    // TODO: Rejoice when optional chaining makes it into CRA
    const localFiles = components[this.state.component].files
      ? components[this.state.component].files.rows
        .map(r => ({
          // Undo grid data format and look up mime type
          type: files[r[0].poolPath]
            ? mimeFromDataURI(files[r[0].poolPath].content)
            : '',
          ...r[0],
        }))
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
          localFiles.map((f, index) =>
            <ListGroupItem action
              key={ index }
              tag="a" href="#"
              className="d-flex justify-content-between align-items-center"
              disabled={
                !accept(
                  { type: f.type, name: f.poolPath },
                  this.props.accept
                )
              }
              onClick={ () => this.props.handleImport(
                this.state.component,
                f.localPath
              ) }
            >
              <span
                style={{
                  fontFamily: 'Fira Mono',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                { f.localPath }
              </span>
              <Icon
                icon={ mimeToIcon(f.type) }
                className="fa-fw ml-2"
              />
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
