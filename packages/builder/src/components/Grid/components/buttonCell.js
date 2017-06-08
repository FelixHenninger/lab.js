import React from 'react'
import { Button } from 'reactstrap'

export default ({ icon, onClick, style, type }) => {
  const Wrapper = type || 'td'
  return <Wrapper>
    <Button className="btn-muted" block onClick={ onClick } style={ style }>
      <i className={ `fa fa-${ icon }` } />
    </Button>
  </Wrapper>
}
