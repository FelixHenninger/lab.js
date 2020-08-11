import React, { Fragment } from 'react'

import { FieldArray, useFormikContext, getIn } from 'formik'

export const FormArray = ({
  name, item: Item,
  header: Header, footer: Footer,
  wrapper: Wrapper=Fragment,
  wrapperProps,
  bodyWrapper: BodyWrapper=Fragment,
  defaultItem={},
}) => {
  const { values }  = useFormikContext()
  const rows = getIn(values, name)

  return (
    <FieldArray name={ name }>
      {
        arrayHelpers => <Wrapper { ...wrapperProps }>
          { Header && <Header name={ name } /> }
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
                  />
              )
            }
          </BodyWrapper>
          { Footer && <Footer addItem={ (item) => arrayHelpers.push(item || defaultItem) } /> }
        </Wrapper>
      }
    </FieldArray>
  )
}
