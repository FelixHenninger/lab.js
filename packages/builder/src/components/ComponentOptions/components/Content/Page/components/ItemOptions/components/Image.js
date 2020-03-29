import React, { useContext } from 'react'

import { Control } from 'react-redux-form'
import {
  Row, Col, Collapse, Input,
  InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap'

import Icon from '../../../../../../../Icon'
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

export default ({ rowIndex }) =>
  <>
    <Row form>
      <Col>
        <Control
          model=".src"
          placeholder="source"
          component={ Input }
          style={{ fontFamily: 'Fira Mono' }}
          debounce={ 300 }
        />
      </Col>
    </Row>
    <ImageOptions rowIndex={ rowIndex } />
  </>
