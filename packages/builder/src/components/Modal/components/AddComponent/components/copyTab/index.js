import React from 'react'
import { useStore } from 'react-redux'

import { repeat } from 'lodash'
import { Button, ButtonGroup, Input } from 'reactstrap'
import { children, flatTree } from '../../../../../../logic/tree'

import './style.css'

const CopyTab = ({ parent, index }) => {
  let sourceSelect = React.createRef()
  const store = useStore()

  return <div className="copy-component-tab">
    <Input
      type="select" bsSize="lg"
      name="copySelect" id="copySelect"
      className="custom-select"
      innerRef={ sourceSelect }
    >
      {
        flatTree(store.getState().components).map(
          ([id, level, data], index) =>
            <option value={ id } key={ index }>
              { level > 0 ? repeat(' ', level - 1) + '∙ ' : '' }
              { data.title }
            </option>
        )
      }
    </Input>
    <ButtonGroup>
      <Button
        outline color="secondary"
        onClick={ () => {
          if (sourceSelect.current.value !== '') {
            store.dispatch({
              type: 'COPY_COMPONENT',
              id: sourceSelect.current.value,
              parent, index,
            })
            // TODO: Show the new component
            store.dispatch({
              type: 'HIDE_MODAL',
            })
          }
        } }
      >
        Copy
      </Button>
      <Button
        outline color="secondary"
        onClick={ () => {
          if (sourceSelect.current.value !== '') {
            // Check whether a component is being
            // cloned into itself, thus creating
            // and infinite recursion.
            const sourceChildren = [
              sourceSelect.current.value,
              ...children(
                sourceSelect.current.value,
                store.getState().components
              ),
            ]
            if (sourceChildren.includes(parent)) {
              alert(
                'I\'m sorry, I\'m afraid I can\'t do that: ' +
                'Cloning a component inside itself would create ' +
                'an endless chain of nested components. ' +
                'Please use a regular copy instead.'
              )
              return
            }
            store.dispatch({
              type: 'CLONE_COMPONENT',
              id: sourceSelect.current.value,
              parent, index,
            })
            // TODO: Show the new component
            store.dispatch({
              type: 'HIDE_MODAL',
            })
          }
        } }
      >
        Clone
      </Button>
    </ButtonGroup>
  </div>
}

export default CopyTab
