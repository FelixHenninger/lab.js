import React, { Component } from 'react'
import { Fieldset, actions } from 'react-redux-form'
import { Button } from 'reactstrap'

import { uniqueId } from 'lodash'
import classnames from 'classnames'

import './index.css'

export default class Grid extends Component {
  constructor(props) {
    super(props)
    this.uniqueId = uniqueId('grid_')
  }

  render() {
    // TODO: Attempt to move formDispatch into
    //   context to reduce handing-down of data
    const { model, data, columns, defaultRow, formDispatch } = this.props
    const headerCell = this.props.headerCell || (content => content)
    const bodyCell = this.props.bodyCell || (content => content)

    const addColumns = this.props.addColumns || false
    const maxColumns = this.props.maxColumns || Infinity
    const defaultColumn = this.props.defaultColumn || ''

    const columnWidths = this.props.columnWidths ||
      columns.length > 0
        ? columns.map(() => 90 / columns.length)
        : [90]

    const deleteColumn = index =>
      formDispatch(
        actions.change(
          `local${model}`,
          {
            columns: columns.filter( (_, i) => i !== index ),
            rows: data.map(
              r => r.filter( (_, i) => i !== index)
            )
          }
        )
      )

    return (
      <Fieldset model={ model }>
        <table
          className={ classnames({
            'table': true,
            'grid': true,
            'grid-slim': columns.length > 3,
            'no-header': this.props.showHeader === false
          }) }
        >
          <colgroup>
            <col style={{ width: '5%' }} />
            {
              columnWidths.map(
                (pct, i) => <col
                  key={ `grid_${this.uniqueId}_colgroup_${i}` }
                  style={{ width: `${pct}%` }}
                />
              )
            }
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>
                {/* TODO: This is a hack to avoid the collapse
                    of the first column. There must be a better way! */}
                <Button
                  className="btn-muted" block
                  style={{ visibility: 'hidden' }}
                >
                  <i className="fa fa-bars"></i>
                </Button>
              </th>
              {
                columns.length > 0
                  ? columns.map(
                      (key, index) =>
                        <th key={ `grid_${this.uniqueId}_column_${index}` }>
                          {
                            headerCell(
                              key, index,
                              formDispatch,
                              () => deleteColumn(index)
                            )
                          }
                        </th>
                    )
                  : <th/>
              }
              <th>
                {
                  !(addColumns && columns.length < maxColumns)
                    ? null
                    : <Button block
                        className="btn-muted"
                        onClick={ // Add additional column to data
                          () => formDispatch(
                            actions.change(
                              `local${model}`,
                              {
                                columns: [...columns, defaultColumn],
                                rows: data.map(row => [...row, '']),
                              }
                            )
                          )
                        }
                      >
                    <i className="fa fa-plus"></i>
                  </Button>
                }
              </th>
            </tr>
          </thead>
          <tbody>
            {
              data.map((rowData, rowIndex) =>
                <tr key={ `grid_${this.uniqueId}_row_${rowIndex}` }>
                  <td>
                    <Button
                      className="btn-muted" block
                    >
                      <i className="fa fa-bars"></i>
                    </Button>
                  </td>
                  {
                    rowData.length > 0
                      ? rowData.map((cellData, colIndex) =>
                          <td key={ `grid_${this.uniqueId}_cell_${rowIndex}_${colIndex}` }>
                            {
                              bodyCell(
                                cellData,
                                rowIndex, colIndex,
                                columns[colIndex],
                                formDispatch
                              )
                            }
                          </td>
                        )
                      : <td/>
                  }
                  <td>
                    <Button
                      block
                      className="btn-muted"
                      onClick={
                        () => formDispatch(
                          actions.change(
                            `local${model}.rows`,
                            data.filter((row, i) => i !== rowIndex)
                          )
                        )
                      }
                      >
                      <i className="fa fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              )
            }
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td colSpan={ columns.length }>
                <Button
                  size="sm" block
                  className="btn-add btn-muted"
                  onClick={
                    () => formDispatch(
                      actions.change(
                        `local${model}.rows`,
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
                >
                  <i className="fa fa-plus"></i>
                </Button>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </Fieldset>
    )
  }
}
