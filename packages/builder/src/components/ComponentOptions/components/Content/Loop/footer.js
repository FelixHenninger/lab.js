import React from 'react'
import PropTypes from 'prop-types'
import { Button, DropdownToggle, DropdownMenu, DropdownItem  } from 'reactstrap'
import Dropdown from '../../../../Dropdown'
import { actions } from 'react-redux-form'

import Uploader from '../../../../Uploader'
import FileSaver from 'file-saver'
import { parse, unparse } from 'papaparse'

const exportGrid = (data, columns) => {
  const output = unparse({
    fields: columns.map(c => c.name),
    data
  })

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
  <tfoot className="btn-hover-container">
    <tr>
      <td />
      <td colSpan={ columns.length }>
        <Dropdown
          type="button"
          block size="sm"
          className="w-100"
        >
          <Button
            block size="sm"
            outline color="muted"
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
            caret split size="sm"
            outline color="muted"
            style={{
              width: '24px',
            }}
          />
          <DropdownMenu right>
            <DropdownItem header>CSV</DropdownItem>
            <Uploader
              accept='text/csv'
              maxSize={ 1024 ** 2 }
              onUpload={
                fileContents => {
                  const parseResult = parse(
                    fileContents.trim(),
                    { header: true }
                  )

                  if (parseResult.errors.length === 0) {
                    formDispatch(
                      actions.change(
                        `local${ model }`,
                        {
                          columns: Object.keys(parseResult.data[0])
                            .map(c => ({ name: c, type: 'string' })),
                          rows: parseResult.data.map(r => Object.values(r))
                        }
                      )
                    )
                  } else {
                    console.log(
                      'CSV import found errors: ',
                      parseResult.errors
                    )
                    alert(
                      'Sorry, I couldn\'t parse that CSV file. ' +
                      'There seems to be an error. ' +
                      'Could you check it, please?'
                    )
                  }
                }
              }
            >
              <div className="dropdown-item">
                Import
              </div>
            </Uploader>
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
  formDispatch: PropTypes.func,
}
