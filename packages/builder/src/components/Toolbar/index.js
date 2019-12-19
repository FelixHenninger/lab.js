import PropTypes from 'prop-types'
import React from 'react'
import { Button, ButtonGroup } from 'reactstrap'
import Icon from '../Icon'
import IOButton from './components/IOButton'
import PreviewButton from './components/PreviewButton'
import './styles.css'

const Toolbar = (props, context) => (
  <div className="toolbar">
    <ButtonGroup>
      <PreviewButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <IOButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <Button
        outline
        color="secondary"
        onClick={() =>
          context.store.dispatch({
            type: 'SHOW_MODAL',
            modalType: 'OPTIONS',
            modalProps: {
              large: 'true',
            },
          })
        }
      >
        <Icon icon="sliders-h" weight="l" />
      </Button>
    </ButtonGroup>
    <hr />
  </div>
)

Toolbar.contextTypes = {
  store: PropTypes.object,
}

export default Toolbar
