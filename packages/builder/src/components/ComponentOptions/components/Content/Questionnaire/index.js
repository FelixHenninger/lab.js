import React, { Component, createContext } from 'react'
import { Fieldset } from 'react-redux-form'

import Form from '../../Form'
import Card from '../../../../Card'
import Grid from '../../../../Grid'

import ItemOptions from './components/ItemOptions'
import { LeftColumn, RightColumn } from './components/Columns'
import Footer from './components/Footer'

const HeaderCell = () => null

export const ItemContext = createContext(undefined)

const GridCell = ({ cellData, rowIndex }) =>
  <Fieldset model={ `.rows[${ rowIndex }][0]` } >
    <ItemContext.Provider value={ `.rows[${ rowIndex }][0]` }>
      <ItemOptions
        type={ cellData.type }
        data={ cellData }
      />
    </ItemContext.Provider>
  </Fieldset>

export default class extends Component {
  constructor(props) {
    super(props)
    this.formDispatch = () => console.log('invalid dispatch')
  }

  render() {
    const { id, data } = this.props

    return (
      <Card title="Content" badge="alpha" wrapContent={false}>
        <Form
          id={ id }
          data={ data }
          keys={ ['questions'] }
          getDispatch={ dispatch => this.formDispatch = dispatch }
        >
          <Grid
            model=".questions"
            HeaderContent={ HeaderCell }
            BodyContent={ GridCell }
            LeftColumn={ LeftColumn }
            RightColumn={ RightColumn }
            Footer={ Footer }
            columnWidths={ [ 90 ] }
            columns={ ['questions'] }
            showHeader={ false }
            defaultRow={
              [ { type: '' }, ]
            }
            data={ data.questions ? data.questions.rows : [] }
            formDispatch={ action => this.formDispatch(action) }
          />
        </Form>
      </Card>
    )
  }
}
