import React, { createRef, useContext } from 'react'
import PropTypes from 'prop-types'

import { Control } from 'react-redux-form'
import {
  Row, Col, Collapse, Input, Button,
  InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap'

import Icon from '../../../../../../../Icon'
import FileSelector from '../../../../../../../FileSelector'

import { ItemContext } from '../../../index'

export const ImageOptions = ({ rowIndex, ...props }) => {
  const { openItem } = useContext(ItemContext)

  return (
    <Row form>
      <Col>
        <Collapse isOpen={ openItem === rowIndex }>
          <InputGroup className="mt-2">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrows-h" fixedWidth />
              </InputGroupText>
            </InputGroupAddon>
            <Control
              model=".width"
              defaultValue=""
              placeholder="width"
              debounce={ 300 }
              className="form-control"
              style={{ fontFamily: 'Fira Mono' }}
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrows-v" fixedWidth />
              </InputGroupText>
            </InputGroupAddon>
            <Control
              model=".height"
              defaultValue=""
              placeholder="height"
              debounce={ 300 }
              className="form-control"
              style={{ fontFamily: 'Fira Mono' }}
            />
          </InputGroup>
        </Collapse>
      </Col>
    </Row>
  )
}

const ImageSelector = ({ rowIndex }, { id, gridDispatch }) => {
  const fileSelector = createRef()

  return (
    <Row form>
      <Col>
        <FileSelector
          accept="image/*"
          component={ id }
          ref={ fileSelector }
        />
        <InputGroup>
          <Control
            model=".src"
            placeholder="source"
            component={ Input }
            style={{ fontFamily: 'Fira Mono' }}
            debounce={ 300 }
          />
          <InputGroupAddon addonType="append">
            <Button
              outline color="secondary"
              style={{ minWidth: '3rem' }}
              onClick={ async () => {
                try {
                  const files = await fileSelector.current.select()
                  gridDispatch('change', {
                    model: `local.items.rows[${ rowIndex }][0].src`,
                    value: `\${ this.files["${ files[0].localPath }"] }`
                  })
                } catch (error) {
                  console.log('Error while selecting image', error)
                }
              } }
            >
              <Icon fixedWidth icon="folder" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </Col>
    </Row>
  )
}

ImageSelector.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  gridDispatch: PropTypes.func,
}

export default ({ rowIndex }) =>
  <>
    <ImageSelector rowIndex={ rowIndex } />
    <ImageOptions rowIndex={ rowIndex } />
  </>
