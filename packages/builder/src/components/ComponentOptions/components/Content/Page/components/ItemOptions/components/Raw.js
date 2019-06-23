import React from 'react'

import { Control } from 'react-redux-form'
import { Row, Col } from 'reactstrap'

import Editor from '../../../../../../../Editor'

export default () =>
  <>
    <Row form>
      <Col>
        <div className="border rounded py-1" style={{ height: '200px' }}>
          <Control.textarea
            model=".content"
            component={ Editor }
            controlProps={{
              language: 'html',
              height: '100%',
              options: {
                folding: false,
                fontSize: 16,
                glyphMargin: false,
                lineHeight: 24,
                lineNumbers: 'off',
                minimap: {
                  enabled: false,
                },
              },
            }}
            debounce={ 300 }
          />
        </div>
      </Col>
    </Row>
  </>
