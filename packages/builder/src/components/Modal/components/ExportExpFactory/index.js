import React from 'react'
import { useStore } from 'react-redux'

import { ButtonGroup, Button } from 'reactstrap'
import Confirm from '../Confirm'

import downloadStaticExpFactory
  from '../../../../logic/io/export/modifiers/expfactory'

const ExportExpFactory = ({ closeHandler }) => {
  const store = useStore()

  return (
    <Confirm
      title={ <span>Export to <strong>the Experiment Factory</strong></span> }
      closeHandler={ closeHandler }
    >
      <p>
        <strong>The Experiment Factory </strong> creates reproducible, reusable, and modular study containers. <span className="text-muted">If you're getting started, you'll want to start with a new container; alternatively, you can export the study by itself.</span>
      </p>
      <ButtonGroup vertical size="l" className="w-100">
        <Button
          block color="primary" className="p-3"
          onClick={ async () => {
            await downloadStaticExpFactory(store.getState())
            closeHandler()
          } }
        >
          Export study in a <strong>new container</strong>
        </Button>
        <Button
          block outline color="secondary" className="p-3"
          onClick={ async () => {
            await downloadStaticExpFactory(
              store.getState(), { container: false }
            )
            closeHandler()
          } }
        >
          Export study for use in an <strong>existing container</strong>
        </Button>
      </ButtonGroup>
    </Confirm>
  )
}

export default ExportExpFactory
