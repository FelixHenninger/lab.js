
import React from 'react'
import PropTypes from 'prop-types'

import { UncontrolledButtonDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,
  Button, ButtonGroup } from 'reactstrap'

import Icon from '../../../../../../Icon'
import FileSelector from '../../../../../../FileSelector'

const AddDropDown = (
  { addHandler, cloneHandler, removeHandler, selection },
  { id }
) => {
  let fileSelector = React.createRef()

  return <>
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
          <DropdownItem header>Text</DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('text', { content: 'text' }) }
          >
            Text
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>Media</DropdownItem>
          <DropdownItem
            onClick={ async () => {
              try {
                const files = await fileSelector.current.select()
                files.forEach(({ localPath }) => {
                  addHandler('image', {
                    src: `\${ this.files["${ localPath }"] }`
                  })
                })
              } catch (error) {
                console.log('Error while inserting images', error)
              }
            } }
          >
            Image
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>Interaction</DropdownItem>
          <DropdownItem
            onClick={ () => addHandler('aoi') }
          >
            AOI
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem header>From selected</DropdownItem>
          <DropdownItem
            onClick={ cloneHandler }
            disabled={ !selection || selection.type === undefined }
          >
            Duplicate
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
      <Button
        outline color="secondary"
        onClick={ removeHandler }
        disabled={ !selection || selection.type === undefined }
      >
        <Icon icon="trash" />
      </Button>
    </ButtonGroup>
    <FileSelector
      ref={ fileSelector }
      component={ id }
      accept="image/*"
    />
  </>
}

AddDropDown.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default AddDropDown
