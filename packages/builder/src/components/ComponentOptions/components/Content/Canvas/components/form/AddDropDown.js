
import React from 'react'
import PropTypes from 'prop-types'

import { DropdownToggle, DropdownMenu, DropdownItem,
  Button, ButtonGroup } from 'reactstrap'

import DropDown from '../../../../../../Dropdown'
import Icon from '../../../../../../Icon'
import FileSelector from '../../../../../../FileSelector'

const AddDropDown = (
  { addHandler, cloneHandler, removeHandler },
  { id }
) => {
  let fileSelector

  return <div>
    <ButtonGroup>
      <DropDown type="button" direction="up">
        <DropdownToggle outline color="secondary">
          <Icon
            icon="plus"
            style={{
              position: 'relative',
              top: '0.5px'
            }}
          />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Shapes</DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('line') }
          >
            Line
          </DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('circle') }
          >
            Circle
          </DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('ellipse') }
          >
            Ellipse
          </DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('triangle') }
          >
            Triangle
          </DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('rect') }
          >
            Rectangle
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>Media</DropdownItem>
          <DropdownItem
            onClick={ () =>
              fileSelector
                .select()
                .then(files =>
                  files.forEach(({ localPath }) => {
                    addHandler('image', {
                      src: `\${ this.files["${ localPath }"] }`
                    })
                  })
                )
                .catch(() => null)
            }
          >
            Image
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>Text</DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('text', { content: 'text' }) }
          >
            Text
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>From selected</DropdownItem>
          <DropdownItem
            onClick={ cloneHandler }
          >
            Duplicate
          </DropdownItem>
        </DropdownMenu>
      </DropDown>
      <Button
        outline color="secondary"
        onClick={ removeHandler }
      >
        <Icon icon="trash" />
      </Button>
    </ButtonGroup>
    <FileSelector
      ref={ ref => fileSelector = ref }
      component={ id }
      accept="image/*"
    />
  </div>
}

AddDropDown.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default AddDropDown
