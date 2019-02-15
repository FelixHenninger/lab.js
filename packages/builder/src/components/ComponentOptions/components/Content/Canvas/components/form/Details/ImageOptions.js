import React, { createRef } from 'react'
import PropTypes from 'prop-types'

import { DropdownMenu, DropdownItem,
  InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import { Control } from 'react-redux-form'

import FileSelector from '../../../../../../../FileSelector'
import Icon from '../../../../../../../Icon'

const ImageOptions = ({ changeHandler }, { id }) => {
  const fileSelector = createRef()

  return (
    <DropdownMenu right
      style={{
        width: '500px',
      }}
    >
      <FileSelector
        tab="pool"
        accept="image/*"
        component={ id }
        ref={ fileSelector }
      />
      <DropdownItem tag="div" toggle={ false } className="mute">
        <InputGroup>
          <Control
            model=".src"
            component={ Input }
            placeholder="Source"
            debounce={ 200 }
            className="form-control"
            style={{ fontFamily: 'Fira Mono' }}
          />
          <InputGroupAddon addonType="append">
            <Button
              outline color="secondary"
              style={{ padding: '0 1rem' }}
              onClick={ () => {
                fileSelector.current
                  .select()
                  .then(files => {
                    changeHandler(
                      'src', `\${ this.files["${ files[0].localPath }"] }`
                    )
                  })
                  .catch(e => console.log('Error while inserting image', e))
              } }
            >
              <Icon icon="folder" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </DropdownItem>
    </DropdownMenu>
  )
}

ImageOptions.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default ImageOptions
