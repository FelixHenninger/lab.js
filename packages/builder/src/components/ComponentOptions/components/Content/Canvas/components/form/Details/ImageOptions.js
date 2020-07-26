import React from 'react'
import PropTypes from 'prop-types'

import { DropdownMenu, DropdownItem,
  InputGroup, InputGroupAddon, InputGroupText, Button } from 'reactstrap'

import FileSelectorField from '../../../../../../../FileSelector/field'
import Icon from '../../../../../../../Icon'

const ImageOptions = ({ selection, changeHandler }, { id }) =>
  <DropdownMenu right
    style={{
      width: '500px',
    }}
  >
    <DropdownItem tag="div" toggle={ false } className="mute">
      <FileSelectorField
        name="src"
        accept="image/*"
        tab="pool"
        icon="file-audio"
        component={ id }
      />
    </DropdownItem>
    <DropdownItem tag="div" toggle={ false } className="mute">
      <InputGroup className="d-flex flex-row image-autoscale" size="sm">
        <InputGroupAddon addonType="prepend" style={{ width: '25%' }}>
          <InputGroupText className="w-100 text-center">
            Auto resize
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon
          className="flex-fill"
          addonType="append"
        >
          <Button outline
            color={
              !['width', 'height'].includes(selection.autoScale)
                ? 'primary'
                : 'secondary'
            }
            style={{ width: '35%' }}
            onClick={ () => changeHandler('autoScale', false) }
          >
            <Icon icon="power-off" />
          </Button>
          <Button outline
            color={ selection.autoScale === 'width'
              ? 'primary' : 'secondary' }
            style={{ width: '32.5%' }}
            onClick={ () => changeHandler('autoScale', 'width') }
          >
            <Icon icon="arrows-alt-h" />
          </Button>
          <Button outline
            color={ selection.autoScale === 'height'
              ? 'primary' : 'secondary' }
            style={{ width: '32.5%' }}
            onClick={ () => changeHandler('autoScale', 'height') }
          >
            <Icon icon="arrows-alt-v" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </DropdownItem>
  </DropdownMenu>

ImageOptions.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default ImageOptions
