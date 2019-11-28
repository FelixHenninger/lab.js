import React, { Component, createContext, useState } from 'react'
import { Fieldset, Control } from 'react-redux-form'
import { CardFooter, FormGroup, InputGroup, Label, Input, CustomInput, Button,
  Row, Col, Collapse } from 'reactstrap'

import Form from '../../Form'
import Card from '../../../../Card'
import Grid from '../../../../Grid'
import Icon from '../../../../Icon'

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

const Footer = ({ data={} }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
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
              <Row form>
                <Col>
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
                </Col>
              </Row>
              <Collapse isOpen={ isOpen }>
                <hr />
                <h3 className="h6">Presentation</h3>
                <FormGroup row className="mt-2">
                  <Label xs={ 3 } for="width">
                    Page width
                  </Label>
                  <Col xs={9}>
                    <InputGroup>
                      <Control.select
                        id="width"
                        model=".width"
                        component={ CustomInput }
                        controlProps={{
                          id: 'width',
                          type: 'select',
                        }}
                      >
                        { /* TODO: Change order and set default */ }
                        <option value="m">
                          Medium
                        </option>
                        <option value="s">
                          Small
                        </option>
                        <option value="l">
                          Large
                        </option>
                      </Control.select>
                    </InputGroup>
                  </Col>
                </FormGroup>
              </Collapse>
            </td>
            <td>
              <Button
                block outline color="muted"
                onClick={ () => setIsOpen(!isOpen) }
              >
                <Icon icon="cog" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </CardFooter>
  )
}

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
          keys={ [
            'items',
            'submitButtonText', 'submitButtonPosition',
            'width'
          ] }
          getDispatch={ dispatch => this.formDispatch = dispatch }
        >
          <ItemContextProvider>
            <Grid
              model=".items"
              HeaderContent={ HeaderCell }
              BodyContent={ this.renderGridCell }
              LeftColumn={ LeftColumn }
              RightColumn={ this.renderRightColumn }
              Footer={ GridFooter }
              columnWidths={ [ 90 ] }
              columns={ ['items'] }
              showHeader={ false }
              defaultRow={
                [ { type: '' }, ]
              }
              data={ data.items ? data.items.rows : [] }
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
