import React from 'react'
import PropTypes from 'prop-types'
import { repeat } from 'lodash'
import { Button, ButtonGroup, Input } from 'reactstrap'
import { children } from '../../../../../../logic/tree'

import './style.css'

const flatTree = (nodes, id='root', level=0) => {
  const output = []
  if (nodes[id].children) {
    nodes[id].children.forEach(
      c => output.push(
        [ c, level, nodes[c] ],
        ...flatTree(nodes, c, level + 1)
      )
    )
  }
  return output
}

const CopyTab = ({ parent, index }, context) => {
  let sourceSelect = null

  return <div className="copy-component-tab">
    <Input
      type="select" bsSize="lg"
      name="copySelect" id="copySelect"
      className="custom-select"
      innerRef={ select => sourceSelect = select }
    >
      {
        flatTree(context.store.getState().components).map(
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
          if (sourceSelect.value !== '') {
            context.store.dispatch({
              type: 'COPY_COMPONENT',
              id: sourceSelect.value,
              parent, index,
            })
            // TODO: Show the new component
            context.store.dispatch({
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
          if (sourceSelect.value !== '') {
            // Check whether a component is being
            // cloned into itself, thus creating
            // and infinite recursion.
            const sourceChildren = [
              sourceSelect.value,
              ...children(
                sourceSelect.value,
                context.store.getState().components
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
            context.store.dispatch({
              type: 'CLONE_COMPONENT',
              id: sourceSelect.value,
              parent, index,
            })
            // TODO: Show the new component
            context.store.dispatch({
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

CopyTab.contextTypes = {
  store: PropTypes.object,
}

export default CopyTab
