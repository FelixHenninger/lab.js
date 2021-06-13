import React, { useState } from 'react'
import { useField } from 'formik'
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import classNames from 'classnames'

import Icon from '../../../Icon'

const HookItem = ({ title, active, icon, iconFallback, children, className, ...props }) =>
  <DropdownItem
    className={ classNames('py-3 border-bottom', { active }, className) }
    { ...props }
  >
    <Icon
      icon={ icon } fallback={ iconFallback }
      className="text-secondary float-right pt-2 fa-lg"
    />
    <code
      className={ classNames("font-bold d-block", {
        'text-light': active,
        'text-body': !active,
      }) }
    >
      { title }
    </code>
    <small
      className={ classNames("font-bold d-block", {
        'text-light': active,
        'text-muted': !active,
      }) }
    >
      { children }
    </small>
  </DropdownItem>

export default ({ name }) => {
  // Field setup
  const [, meta, helpers] = useField(name)
  const { value } = meta
  const { setValue } = helpers
  const isSelected = v => (v === value ? 'selected' : '')

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return <>
    <ButtonDropdown
      isOpen={ dropdownOpen }
      toggle={ () => setDropdownOpen(!dropdownOpen) }
      className="w-100"
    >
      <DropdownToggle
        caret outline block color="secondary"
        className="text-left"
      >
        <code className="text-reset">
          { value === '' ? 'inactive' : value }
        </code>
      </DropdownToggle>
      <DropdownMenu right className="w-100">
        <HookItem
          title="before:prepare"
          active={ isSelected('before:prepare') }
          onClick={ () => setValue('before:prepare') }
          icon="digging" iconFallback="wrench"
        >
          Run commands prior to component preparation,<br />
          for example to change settings
        </HookItem>
        <HookItem
          title="after:prepare"
          active={ isSelected('after:prepare') }
          onClick={ () => setValue('after:prepare') }
          icon="hammer"
        >
          Run commands after stimulus preparation,<br />
          to override <code className="text-reset">lab.js</code>'
          default behavior
        </HookItem>
        <HookItem
          title="run"
          active={ isSelected('run') }
          onClick={ () => setValue('run') }
          icon="arrow-from-left" iconFallback="play"
        >
          Run code as the stimulus is presented.
        </HookItem>
        <HookItem
          title="end"
          active={ isSelected('end') }
          onClick={ () => setValue('end') }
          icon="arrow-to-right" iconFallback="stop"
        >
          Run code as component ends,<br />
          for example to customize the collected data.
        </HookItem>
        <HookItem
          title="lock"
          active={ isSelected('lock') }
          onClick={ () => setValue('lock') }
          icon="lock-alt"
        >
          Run code after the study has moved on,<br />
          to remove temporary data.
        </HookItem>
        <HookItem
          title="inactive"
          active={ isSelected('') }
          onClick={ () => setValue('') }
          icon="power-off"
        >
          Don't ever run this script.
        </HookItem>
      </DropdownMenu>
    </ButtonDropdown>
  </>
}
