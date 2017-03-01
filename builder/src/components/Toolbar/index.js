import React from 'react'
import { ButtonGroup, Button } from 'reactstrap'

import PreviewButton from './components/PreviewButton'
import IOButton from './components/IOButton'
import './styles.css'

const Toolbar = (props, context) =>
  <div className="toolbar">
    <ButtonGroup>
      <PreviewButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <IOButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <Button
        onClick={
          () => context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'OPTIONS',
            modalProps: {
              large: true,
            },
          })
        }
      >
        <i className="fa fa-sliders" aria-hidden="true"></i>
      </Button>
    </ButtonGroup>
  </div>

Toolbar.contextTypes = {
  store: React.PropTypes.object
}

export default Toolbar
