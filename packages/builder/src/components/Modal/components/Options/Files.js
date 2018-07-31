import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Table, Button } from 'reactstrap'
import Icon from '../../../Icon'

import { sortBy } from 'lodash'

const Files = ({ files }, { store }) =>
  <Table className="grid">
    <colgroup>
      <col style={{ width: '6%' }} />
      <col style={{ width: '60%' }} />
      <col style={{ width: '18%' }} />
      <col style={{ width: '6%' }} />
    </colgroup>
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
    <tbody>
      {
        sortBy(Object.entries(files), ([k, v]) => k)
          .filter(([k, v]) => !v.permanent)
          .map(([k, v]) =>
            <tr key={ k }>
              <td />
              <td className="text-monospace">
                <div style={{ padding: "0.55rem 0 0.2rem" }}>
                  { k }
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
                    0.75 * (v.content.length - v.content.indexOf(',') - 1)
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
                    file: k,
                  }) }
                >
                  <Icon
                    icon="trash"
                    style={{ position: 'relative', top: '1px'}}
                  />
                </Button>
              </td>
            </tr>
          )
      }
    </tbody>
    <tfoot>
      <tr>
        <td />
        <td colSpan="2">
          <Button
            size="sm" block
            outline color="muted"
          >
            <Icon icon="plus" />
          </Button>
        </td>
        <td />
      </tr>
    </tfoot>
  </Table>

// Redux integration
const mapStateToProps = (state) => ({
  files: state.files.files
})

Files.contextTypes = {
  store: PropTypes.object,
}

export default connect(mapStateToProps)(Files)
