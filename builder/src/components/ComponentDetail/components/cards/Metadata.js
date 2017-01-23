import React from 'react'
import Card from '../../../Card'
import { FormGroup, InputGroup, InputGroupAddon } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card title="Metadata" { ...props }>
    <FormGroup>
      <InputGroup>
        <Control
          model=".title"
          placeholder="Title"
          className="form-control form-control-lg"
          style={{
            fontWeight: 'bold',
            padding: '0.5rem 0.75rem',
          }}
        />
        { props.icon
          ? <InputGroupAddon>
              <i
                className={`fa fa-${ props.icon }`}
                style={{
                  textAlign: 'center',
                  minWidth: '20px',
                  position: 'relative',
                  top: '2px',
                }}
              ></i>
            </InputGroupAddon>
          : null }
      </InputGroup>
    </FormGroup>
    <FormGroup>
      <Control.textarea
        model=".notes"
        className="form-control form-control-sm"
        placeholder="Notes"
        rows="2"
        style={{
          padding: '0.5rem 0.75rem',
        }}
        />
    </FormGroup>
  </Card>
