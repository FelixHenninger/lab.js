import React, { Component } from 'react'
import { Fieldset, actions } from 'react-redux-form'
import { Button } from 'reactstrap'

import './index.css'

export default class Grid extends Component {
  render() {
    const { model, data, columns, columnWidths, formDispatch } = this.props
    const addColumns = this.props.addColumns || false
    const headerCell = this.props.headerCell || (content => content)
    const bodyCell = this.props.bodyCell || (content => content)

    return (
      <Fieldset model={ model }>
        <table className="table grid">
          <colgroup>
            <col style={{ width: '5%' }} />
            {
              columnWidths.map(
                (pct, i) => <col key={ i } style={{ width: `${pct}%` }} />
              )
            }
            <col style={{ width: '5%' }} />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              {
                columns.map(
                  (key, index) =>
                    <th key={ key }>
                      { headerCell(key, index) }
                    </th>
                )
              }
              <th>
                {
                  !addColumns ? null : <Button
                    block
                    onClick={ // Add additional column to data
                      () => formDispatch(
                        actions.change(
                          `local${model}`,
                          {
                            columns: [...columns, ''],
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
                <tr key={ `grid_row_${rowIndex}` }>
                  <td>
                    <Button block>
                      <i className="fa fa-bars"></i>
                    </Button>
                  </td>
                  {
                    rowData.map((cellData, colIndex) =>
                      <td key={ `grid_cell_${rowIndex}_${colIndex}` }>
                        {
                          bodyCell(
                            cellData,
                            rowIndex, colIndex,
                            columns[colIndex]
                          )
                        }
                      </td>
                    )
                  }
                  <td>
                    <Button
                      block
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
                  className="btn-add"
                  onClick={
                    () => formDispatch(
                      actions.change(
                        `local${model}.rows`,
                        [
                          ...data,
                          Array // Create array of empty strings
                            .apply(null, Array(data[0].length))
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
