import React, { createContext, useContext, Fragment } from 'react'

import { FieldArray, useFormikContext, getIn } from 'formik'

// State management ------------------------------------------------------------

const ArrayContext = createContext({})

const ArrayContextProvider = ({ name, values,
  arrayHelpers, setValues, setFieldValue, ...props
}) => {
  const getRows = () => getIn(values, name) ?? []

  const overwriteRows = (newValue) =>
    setFieldValue(name, newValue)

  // TODO: A fair amount of these helper functions are grid-specific.
  // Maybe it might be worth investigating splitting them out
  const overwriteAll = (rows, columns) => {
    const baseName = name.replace('.rows', '')

    setValues({
      ...values,
      [baseName]: {
        ...getIn(values, baseName),
        rows, columns,
      },
    })
  }

  const dispatch = (f) => {
    const columnName = name.replace('.rows', '.columns')

    overwriteAll(...f(
      getIn(values, name) ?? [],
      getIn(values, columnName) ?? [],
    ))
  }

  const addRow = () => arrayHelpers.push([])

  const mapRows = (f) =>
    overwriteRows(getRows().map(f))

  const addColumn = (defaultCell, defaultColumn) =>
    dispatch((rows, columns) => ([
      rows.map(row => [...row, defaultCell]),
      [...columns, defaultColumn],
    ]))

  const deleteColumn = (index) =>
    dispatch((rows, columns) => ([
      rows.map(row => row.filter((_, i) => i !== index)),
      columns.filter((_, i) => i !== index),
    ]))

  const clearColumn = (index) =>
    mapRows(row => {
      const output = [...row]
      output[index] = ''
      return output
    })

  const fillColumn = (index) => {
    // Gather cells with content
    const availableCells = getRows()
      .map(r => r[index])
      .filter(r => r !== '')

    return mapRows((r, rowIndex) => {
      const output = [...r]
      output[index] = output[index] ||
        availableCells[rowIndex % availableCells.length]
      return output
    })
  }

  return (
    <ArrayContext.Provider
      value={{ setValues, setFieldValue, dispatch, overwriteAll,
        addRow, addColumn, clearColumn, fillColumn, deleteColumn
      }}
      { ...props }
    />
  )
}

export const useArrayContext = () => useContext(ArrayContext)

// Basic form array ------------------------------------------------------------

export const FormArray = ({
  name, item: Item,
  header: Header,
  footer: Footer,
  wrapper: Wrapper=Fragment, wrapperProps,
  bodyWrapper: BodyWrapper=Fragment,
  globalProps={},
  defaultItem={},
}) => {
  const { values, setFieldValue, setValues }  = useFormikContext()
  const rows = getIn(values, name)

  return (
    <FieldArray name={ name }>
      {
        arrayHelpers => <Wrapper { ...wrapperProps }>
          <ArrayContextProvider
            name={ name }
            values={ values }
            arrayHelpers={ arrayHelpers }
            setValues={ setValues }
            setFieldValue={ setFieldValue }
          >
            { Header && <Header { ...globalProps } /> }
            <BodyWrapper>
              {
                (rows || []).map(
                  (data, index) =>
                    <Item
                      key={ `${ name }[${ index }]` }
                      name={ `${ name }[${ index }]` }
                      index={ index }
                      isLastItem={ index === rows.length - 1 }
                      data={ data }
                      arrayHelpers={ arrayHelpers }
                      { ...globalProps }
                    />
                )
              }
            </BodyWrapper>
            { Footer && <Footer addItem={ (item) => arrayHelpers.push(item || defaultItem) } { ...globalProps } /> }
          </ArrayContextProvider>
        </Wrapper>
      }
    </FieldArray>
  )
}
