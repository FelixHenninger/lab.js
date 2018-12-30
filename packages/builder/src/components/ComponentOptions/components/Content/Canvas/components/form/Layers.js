import React from 'react'

import { Button, ButtonGroup } from 'reactstrap'

import Icon from '../../../../../../Icon'

export default ({ upHandler, downHandler }) =>
  <ButtonGroup
    className="ml-2"
  >
    <Button outline color="secondary" onClick={ upHandler }>
      <Icon icon="arrow-up" />
    </Button>
    <Button outline color="secondary" onClick={ downHandler }>
      <Icon icon="arrow-down" />
    </Button>
  </ButtonGroup>
