import React from 'react'
import { Button } from 'reactstrap'

import Icon from '../../Icon'

export default ({ icon, onClick, style, type }) => {
  const Wrapper = type || 'td'
  return <Wrapper>
    <Button
      block outline color="muted"
      onClick={ onClick } style={ style }
    >
      <Icon icon={ icon } />
    </Button>
  </Wrapper>
}
