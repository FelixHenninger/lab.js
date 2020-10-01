import React from 'react'

import { Button } from 'reactstrap'

import Icon from '../Icon'
import './table.css'
import { FormArray } from './array'

export const ButtonCell = ({ icon, onClick, style, disabled=false, type }) => {
  const Wrapper = type ?? 'td'

  return (
    <Wrapper>
      <Button
        block outline color="muted"
        onClick={ onClick }
        style={ style }
        disabled={ disabled }
      >
        <Icon icon={ icon } />
      </Button>
    </Wrapper>
  )
}

const DefaultColgroup = ({ columns=1 }) =>
  <colgroup>
    <col style={{ width: '5%' }} />
    {
      (new Array(columns)).fill(null).map(
        (_, i) => <col
          key={ `${ i }` }
          style={{ width: `${ 90/columns }%` }}
        />
      )
    }
    <col style={{ width: '5%' }} />
  </colgroup>

export const DefaultRow = ({
  index, name, children, arrayHelpers, isLastItem,
  leftColumn: LeftColumn,
  rightColumn: RightColumn,
  wrapper: Wrapper='td'
}) =>
  <tr>
    { LeftColumn
      ? <LeftColumn
          name={ name } index={ index }
          arrayHelpers={ arrayHelpers }
          isLastItem={ isLastItem }
        />
      : <ButtonCell icon="bars" /> }
    <Wrapper>
      { children }
    </Wrapper>
    { RightColumn
      ? <RightColumn
          name={ name } index={ index }
          arrayHelpers={ arrayHelpers }
          isLastItem={ isLastItem }
        />
      : <ButtonCell
          icon="trash"
          onClick={ () => arrayHelpers.remove(index) }
        /> }
  </tr>

const DefaultFooter = ({ addItem, columns }) =>
  <tfoot>
    <tr>
      <td></td>
      <td colSpan={ columns }>
        <Button
          block size="sm"
          outline color="muted"
          className="hover-target"
          onClick={ () => addItem() }
        >
          <Icon icon="plus" />
        </Button>
      </td>
      <td></td>
    </tr>
  </tfoot>

export const DefaultHeader = ({ columns, children }) =>
  <>
    <DefaultColgroup columns={ columns }/>
    { children }
  </>

export const Table = ({
  row,
  header=DefaultHeader,
  footer=DefaultFooter,
  columns=1,
  className, ...props
}) =>
  <FormArray
    wrapper="table"
    wrapperProps={{ className: `table grid ${ className }` }}
    bodyWrapper="tbody"
    item={ row }
    header={ header }
    footer={ footer }
    globalProps={{ columns }}
    { ...props }
  />
