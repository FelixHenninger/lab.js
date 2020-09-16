import React from 'react'
import { DropdownMenu, DropdownItem,
  Button, ButtonGroup,
  InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap'
import { Field } from 'formik'

import Icon from '../../../../../../../Icon'

export default ({ selection, changeHandler }) =>
  <DropdownMenu
    style={{
      width: '200px',
    }}
  >
    {/* <divs> are needed here because DropdownItems are buttons,
        and the buttons here can't be nested within. */}
    <DropdownItem tag="div" toggle={ false } className="mute">
      <Field
        name="fontFamily"
        component="select"
        className="form-control custom-select"
      >
        <option value="serif">Serif</option>
        <option value="sans-serif">Sans-serif</option>
        <option value="monospace">Monospace</option>
      </Field>
    </DropdownItem>
    <DropdownItem tag="div" toggle={ false } className="mute">
      <ButtonGroup className="w-100 typography-font-style">
        <Button
          outline color={
            selection.fontStyle === 'italic'
              ? 'primary'
              : 'secondary'
          }
          className="w-50"
          onClick={ () => {
            if (selection.fontStyle === 'italic') {
              changeHandler('fontStyle', 'normal')
            } else {
              changeHandler('fontStyle', 'italic')
            }
          } }
        >
          <Icon icon="italic" />
        </Button>
        <Button
          outline color={
            selection.fontWeight === 'bold'
              ? 'primary'
              : 'secondary'
          }
          className="w-50"
          onClick={ () => {
            if (selection.fontWeight === 'bold') {
              changeHandler('fontWeight', 'normal')
            } else {
              changeHandler('fontWeight', 'bold')
            }
          } }
        >
          <Icon icon="bold" />
        </Button>
      </ButtonGroup>
    </DropdownItem>
    <DropdownItem divider />
    <DropdownItem tag="div" toggle={ false } className="mute">
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <Icon icon="text-height" />
          </InputGroupText>
        </InputGroupAddon>
        <Field
          name="fontSize"
          placeholder="Size"
          className="form-control text-monospace"
        />
      </InputGroup>
    </DropdownItem>
    <DropdownItem divider />
    <DropdownItem tag="div" toggle={ false } className="mute">
      <ButtonGroup className="typography-alignment">
      {
        /* Ideally, highlighting of the selected option
            would be covered by the active property, but
            the default style doesn't look good */
        ['left', 'center', 'right'].map(alignment =>
          <Button
            key={ `text-align-${ alignment }` }
            outline color={ selection.textAlign === alignment
              ? 'primary'
              : 'secondary'
            }
            onClick={ () => changeHandler({
              textAlign: alignment,
              originX: alignment,
            }) }
          >
            <Icon icon={ `align-${ alignment }` } />
          </Button>
        )
      }
      </ButtonGroup>
    </DropdownItem>
  </DropdownMenu>
