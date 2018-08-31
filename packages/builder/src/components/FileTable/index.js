import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Button } from 'reactstrap'
import { sortBy } from 'lodash'

import Icon from '../Icon'
import { dataURItoIcon } from '../../logic/util/fileType'

export const FileTableColGroup = () =>
  <colgroup>
    <col style={{ width: '60px' }} />
    <col style={{ width: '80%' }} />
    <col style={{ width: '20%' }} />
    <col style={{ width: '60px' }} />
  </colgroup>

export const FileTableHeader = () =>
  <thead>
    <tr>
      <th></th>
      <th>Filename</th>
      <th className="text-right">
        Size <span className="text-muted font-weight-normal">[KB]</span>
      </th>
      <th></th>
    </tr>
  </thead>

const FileTableRow = ({ path, content }, { store }) =>
  <tr>
    <td>
      <div
        className="text-muted text-center"
        style={{
          padding: '0.375rem 0.75rem',
          border: '1px solid transparent',
          lineHeight: '1.5',
        }}
      >
        <Icon
          icon={ dataURItoIcon(content) }
          className="fa-fw"
          style={{
            color: '#ced4da',
            position: 'relative',
            top: '1px',
          }}
        />
      </div>
    </td>
    <td className="text-monospace">
      <div style={{ padding: "0.55rem 0 0.2rem" }}>
        { path }
      </div>
    </td>
    <td className="text-monospace text-right">
      <div style={{ padding: "0.55rem 0 0.2rem" }}>
      {
        // base64 encoding inflates the file, storing 6 bits in every
        // 8-bit character; the initial data URI indicator and the
        // trailing equal sign don't count toward the file size.
        //
        // TODO: Even with all of these corrections, this is an
        // approximation, and will differ from OS file managers.
        // Corrections are welcome!
        Math.ceil(
          0.75 * (content.length - content.indexOf(',') - 1)
          / 1000
        )
      }
      </div>
    </td>
    <td>
      <Button
        block
        outline color="muted"
        onClick={ () => store.dispatch({
          type: 'DELETE_FILE',
          file: path,
        }) }
      >
        <Icon
          icon="trash"
          className="fa-fw"
        />
      </Button>
    </td>
  </tr>

FileTableRow.contextTypes = {
  store: PropTypes.object
}

const _FileTableBody = ({ files }) =>
  <tbody>
    {
      sortBy(Object.entries(files), ([path, _]) => path)
        .filter(([_, { permanent }]) => !permanent)
        .map(([path, { content }]) =>
          <FileTableRow
            path={ path }
            content={ content }
          />
        )
    }
  </tbody>

export const FileTableBody = connect(
  state => ({
    files: state.files.files,
  })
)(_FileTableBody)
