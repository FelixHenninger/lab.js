import React from 'react'
import { repeat } from 'lodash'
import { Button, ButtonGroup, Input } from 'reactstrap'

import './style.css'

const flatTree = (nodes, id='root', level=0) => {
  const output = []
  if (nodes[id].children) {
    nodes[id].children.forEach(
      c => output.push(
        [ c, level, nodes[c]],
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
      type="select" size="lg"
      name="copySelect" id="copySelect"
      className="custom-select"
      getRef={ select => sourceSelect = select }
    >
      {
        flatTree(context.store.getState().components).map(
          ([id, level, data]) =>
            <option value={ id } key={ id }>
              { level > 0 ? repeat(' ', level - 1) + '∙ ' : '' }
              { data.title }
            </option>
        )
      }
    </Input>
    <ButtonGroup>
      <Button
        onClick={ () => {
          context.store.dispatch({
            type: 'COPY_COMPONENT',
            id: sourceSelect.value,
            parent, index,
          })
          // TODO: Show the new component
          context.store.dispatch({
            type: 'HIDE_MODAL',
          })
        } }
      >
        Copy
      </Button>
      <Button
        onClick={ () => {
          context.store.dispatch({
            type: 'CLONE_COMPONENT',
            id: sourceSelect.value,
            parent, index,
          })
          // TODO: Show the new component
          context.store.dispatch({
            type: 'HIDE_MODAL',
          })
        } }
      >
        Clone
      </Button>
    </ButtonGroup>
  </div>
}

CopyTab.contextTypes = {
  store: React.PropTypes.object,
}

export default CopyTab
