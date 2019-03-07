import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { CustomInput, ListGroup, ListGroupItem } from 'reactstrap'
import { repeat } from 'lodash'
import { default as checkAccept } from 'attr-accept'

import { flatTree } from '../../../logic/tree'
import { mimeFromDataURI } from '../../../logic/util/dataURI'
import { mimeToIcon } from '../../../logic/util/fileType';
import Icon from '../../Icon';

const PoolTab = ({ accept, handleImport, initialComponent }, { store }) => {
  const [component, setComponent] = useState(initialComponent)
  const { components, files: { files } } = store.getState()

  // TODO: Rejoice when optional chaining makes it into CRA
  const localFiles = components[component].files
    ? components[component].files.rows
      .map(r => ({
        // Undo grid data format and look up mime type
        type: files[r[0].poolPath]
          ? mimeFromDataURI(files[r[0].poolPath].content)
          : '',
        ...r[0],
      }))
    : []

  return <>
    <CustomInput
      type="select"
      id="component"
      bsSize="lg"
      className="mb-2 font-weight-bold"
      defaultValue={ component }
      onChange={ e => setComponent(e.target.value) }
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
              !checkAccept(
                { type: f.type, name: f.poolPath },
                accept
              )
            }
            onClick={ () => handleImport(
              component,
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
              fixedWidth
              className="ml-2"
            />
          </ListGroupItem>
        )
      }
    </ListGroup>
  </>
}

PoolTab.contextTypes = {
  store: PropTypes.object
}

export default PoolTab
