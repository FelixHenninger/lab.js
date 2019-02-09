
import React from 'react'
import PropTypes from 'prop-types'

import { UncontrolledButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,
  Button, ButtonGroup } from 'reactstrap'

import Icon from '../../../../../../Icon'
import FileSelector from '../../../../../../FileSelector'

const AddDropDown = (
  { addHandler, cloneHandler, removeHandler },
  { id }
) => {
  let fileSelector = React.createRef()

  return <div>
    <ButtonGroup>
      <UncontrolledButtonDropdown direction="up">
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
              fileSelector.current
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
      </UncontrolledButtonDropdown>
      <Button
        outline color="secondary"
        onClick={ removeHandler }
      >
        <Icon icon="trash" />
      </Button>
    </ButtonGroup>
    <FileSelector
      ref={ fileSelector }
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
