import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { Field } from 'formik'
import {
  Row, Col, Collapse,
  InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap'

import Icon from '../../../../../../../Icon'
import FileSelectorField from '../../../../../../../FileSelector/field'

import { ItemContext } from '../../../index'

export const ImageOptions = ({ name, index }) => {
  const { openItem } = useContext(ItemContext)

  return (
    <Row form>
      <Col>
        <Collapse isOpen={ openItem === index }>
          <InputGroup className="mt-2">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrows-h" fixedWidth />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.width` }
              defaultValue=""
              placeholder="width"
              className="form-control text-monospace"
            />
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Icon icon="arrows-v" fixedWidth />
              </InputGroupText>
            </InputGroupAddon>
            <Field
              name={ `${ name }.height` }
              defaultValue=""
              placeholder="height"
              className="form-control text-monospace"
            />
          </InputGroup>
        </Collapse>
      </Col>
    </Row>
  )
}

const ImageSelector = ({ name }, { id }) =>
  <Row form>
    <Col>
      <FileSelectorField
        name={ `${ name }.src`}
        accept="image/*"
        placeholder="source"
        component={ id }
      />
    </Col>
  </Row>

ImageSelector.contextTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
}

export default ({ name, index }) =>
  <>
    <ImageSelector name={ name } />
    <ImageOptions name={ name } index={ index } />
  </>
