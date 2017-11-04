import React from 'react'
import { Button } from 'reactstrap'

export default ({ icon, onClick, style, type }) => {
  const Wrapper = type || 'td'
  return <Wrapper>
    <Button
      block outline color="muted"
      onClick={ onClick } style={ style }
    >
      <i className={ `fa fa-${ icon }` } />
    </Button>
  </Wrapper>
}
