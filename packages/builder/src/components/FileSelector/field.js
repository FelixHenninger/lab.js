import React, { createRef } from 'react'

import { useField, Field } from 'formik'
import { InputGroup, InputGroupAddon, InputGroupText, Button } from 'reactstrap'

import FileSelector from './index'
import Icon from '../Icon'
import { Input } from '../Form'

export default ({
  name, component, icon=undefined, placeholder='source',
  accept='*/*', tab
}) => {
  const fileSelector = createRef()
  const [, , helpers] = useField({ name })

  return <>
    <FileSelector
      accept={ accept }
      component={ component }
      tab={ tab }
      ref={ fileSelector }
    />
    <InputGroup>
      {
        icon !== undefined
          ? <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon fixedWidth icon={ icon } />
              </InputGroupText>
            </InputGroupAddon>
          : null
      }
      <Field
        name={ name }
        placeholder={ placeholder }
        component={ Input }
        className="text-monospace"
      />
      <InputGroupAddon addonType="append">
        <Button
          outline color="secondary"
          style={{ minWidth: '3rem' }}
          onClick={ async () => {
            try {
              const files = await fileSelector.current.select()
              helpers.setValue(`\${ this.files["${ files[0].localPath }"] }`)
            } catch (error) {
              console.log('Error while selecting image', error)
            }
          } }
        >
          <Icon fixedWidth icon="folder" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  </>
}
