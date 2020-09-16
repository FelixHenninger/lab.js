import React from 'react'

import { Row, Col } from 'reactstrap'

import EditorField from '../../../../../../../Editor/field'

export default ({ name }) =>
  <>
    <Row form>
      <Col>
        <div className="border rounded py-2 pr-2" style={{ height: '220px' }}>
          <EditorField
            name={ `${ name }.content` }
            language="html"
            height="100%"
            options={{
              folding: false,
              fontSize: 16,
              glyphMargin: false,
              lineHeight: 24,
              lineNumbers: 'off',
              minimap: {
                enabled: false,
              },
            }}
          />
        </div>
      </Col>
    </Row>
  </>
