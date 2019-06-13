import React, { Component, createContext, useState } from 'react'
import { Fieldset, Control } from 'react-redux-form'
import { CardFooter, InputGroup, Input, CustomInput } from 'reactstrap'

import Form from '../../Form'
import Card from '../../../../Card'
import Grid from '../../../../Grid'

import ItemOptions from './components/ItemOptions'
import { LeftColumn, RightColumn } from './components/Columns'
import GridFooter from './components/Footer'

// Grid contents ---------------------------------------------------------------

const HeaderCell = () => null

const GridCell = ({ cellData, rowIndex, ...props }) =>
  <Fieldset model={ `.rows[${ rowIndex }][0]` } >
    <ItemOptions
      type={ cellData.type }
      data={ cellData }
      rowIndex={ rowIndex }
      { ...props }
    />
  </Fieldset>

const Footer = ({ data={} }) =>
  <CardFooter className="px-0">
    <table className="table grid no-header border-bottom-0 my-0">
      <colgroup>
        <col style={{ width: '5%' }} />
        <col style={{ width: '90%' }} />
        <col style={{ width: '5%' }} />
      </colgroup>
      <tbody>
        <tr>
          <td><div style={{ width: '40px' }} /></td>
          <td>
            <InputGroup>
              <Control
                model=".submitButtonText"
                component={ Input }
                controlProps={{
                  disabled: data.submitButtonPosition === 'hidden'
                }}
                placeholder="Submit button text"
                default="Continue →"
                type="text"
                debounce={ 300 }
              />
              <Control.select
                model=".submitButtonPosition"
                component={ CustomInput }
                controlProps={{
                  id: 'submitButtonPosition',
                  type: 'select',
                }}
              >
                <option value="right">
                  Show submit button
                </option>
                <option value="hidden">
                  Hide submit button
                </option>
              </Control.select>
            </InputGroup>
          </td>
          <td><div style={{ width: '42px' }} /></td>
        </tr>
      </tbody>
    </table>
  </CardFooter>

// State management ------------------------------------------------------------

export const ItemContext = createContext({})

const ItemContextProvider = (props) => {
  const [openItem, setOpenItem] = useState(undefined)

  return (
    <ItemContext.Provider
      value={{ openItem, setOpenItem }}
      { ...props }
    />
  )
}

// Main component --------------------------------------------------------------

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')

    // Keep track of open item
    this.state = { openItem: undefined }
    this.setOpenItem = this.setOpenItem.bind(this)

    // Render sub-components
    this.renderGridCell = this.renderGridCell.bind(this)
    this.renderRightColumn = this.renderRightColumn.bind(this)
  }

  setOpenItem(i) {
    if (this.state.openItem === i) {
      this.setState({ openItem: undefined })
    } else {
      this.setState({ openItem: i })
    }
  }

  renderGridCell(props) {
    return (
      <GridCell
        isExpanded={ props.rowIndex === this.state.openItem }
        { ...props }
      />
    )
  }

  renderRightColumn(props) {
    return(
      <RightColumn
        onClickOptions={ this.setOpenItem }
        { ...props }
      />
    )
  }

  render() {
    const { id, data } = this.props

    return (
      <Card title="Content" badge="alpha" wrapContent={false}>
        <Form
          id={ id }
          data={ data }
          keys={ ['questions', 'submitButtonText', 'submitButtonPosition'] }
          getDispatch={ dispatch => this.formDispatch = dispatch }
        >
          <ItemContextProvider>
            <Grid
              model=".questions"
              HeaderContent={ HeaderCell }
              BodyContent={ this.renderGridCell }
              LeftColumn={ LeftColumn }
              RightColumn={ this.renderRightColumn }
              Footer={ GridFooter }
              columnWidths={ [ 90 ] }
              columns={ ['questions'] }
              showHeader={ false }
              defaultRow={
                [ { type: '' }, ]
              }
              data={ data.questions ? data.questions.rows : [] }
              formDispatch={ action => this.formDispatch(action) }
              className="mb-0 border-bottom-0"
            />
          </ItemContextProvider>
          <Footer data={ data } />
        </Form>
      </Card>
    )
  }
}
