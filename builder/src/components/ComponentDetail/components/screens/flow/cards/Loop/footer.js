import React from 'react'
import { Button, DropdownToggle, DropdownMenu, DropdownItem  } from 'reactstrap'
import Dropdown from '../../../../../../Dropdown'
import { actions } from 'react-redux-form'

import { makeType, escapeCsvCell } from '../../../../../../../logic/util/makeType'
import FileSaver from 'file-saver'

const exportGrid = (data, columns) => {
  const output = [
    // CSV header
    columns.map(
      c => escapeCsvCell(c.name)
    ).join(','),
    // CSV content
    ...data.map(
      row => row.map(
        (x, i) => makeType(x, columns[i].type)
      ).map(
        (x) => escapeCsvCell(x)
      ).join(',')
    )
  ].join('\n')

  return FileSaver.saveAs(
    new Blob(
      [ output ],
      { type: 'text/csv;charset=utf-8' }
    ),
    'loop.csv'
  )
}

export const Footer = (
  { columns, data, defaultRow, model },
  { formDispatch }
) =>
  <tfoot>
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <Dropdown
          type="button"
          style={{
            width: '100%'
          }}
        >
          <Button
            size="sm" block
            className="btn-add btn-muted"
            onClick={
              () => formDispatch(
                actions.change(
                  `local${ model }.rows`,
                  [
                    ...data,
                    defaultRow || Array // Create array of empty strings
                      .apply(null, Array(data[0] ? data[0].length : columns.length))
                      .map(String.prototype.valueOf, "")
                  ]
                )
              )
            }
            onMouseUp={
              e => e.target.blur()
            }
            style={{
              paddingLeft: '32px', // 6px standard + 24px toggle width
            }}
          >
            <i className="fa fa-plus"></i>
          </Button>
          <DropdownToggle
            className="btn-muted btn-add"
            caret split
            style={{
              width: '24px',
            }}
          />
          <DropdownMenu right>
            <DropdownItem header>CSV</DropdownItem>
            <DropdownItem
              disabled
            >
              Import
            </DropdownItem>
            <DropdownItem
              onClick={ () => exportGrid(data, columns) }
            >
              Export
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </td>
      <td />
    </tr>
  </tfoot>

Footer.contextTypes = {
  formDispatch: React.PropTypes.func,
}
