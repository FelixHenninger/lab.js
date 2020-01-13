import React from 'react'
import { connect } from 'react-redux'
import { ButtonGroup, Button } from 'reactstrap'

import PreviewButton from './components/PreviewButton'
import IOButton from './components/IOButton'
import Icon from '../Icon'
import './styles.css'

const Toolbar = ({ showModal }) =>
  <div className="toolbar">
    <ButtonGroup>
      <PreviewButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <IOButton />
    </ButtonGroup>{' '}
    <ButtonGroup>
      <Button
        outline color="secondary"
        onClick={
          () => showModal('OPTIONS')
        }
      >
        <Icon icon="sliders-h" weight="l" />
      </Button>
    </ButtonGroup>
  </div>

// TODO: This is a duplicated action creator,
// refactor to share this with the Sidebar component
const mapDispatchToProps = {
  showModal: (type) => ({
    type: 'SHOW_MODAL',
    modalType: type,
  })
}

export default connect(null, mapDispatchToProps)(Toolbar)
