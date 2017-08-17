import React from 'react'
import Card from '../../../Card'
import { FormGroup, InputGroup, InputGroupAddon } from 'reactstrap'
import { Control } from 'react-redux-form'

export default (props) =>
  <Card { ...props }>
    <FormGroup>
      <InputGroup>
        <Control
          model=".title"
          placeholder="Title"
          className="form-control form-control-lg"
          style={{
            fontWeight: '500',
            padding: '0.5rem 0.75rem',
          }}
          debounce={ 300 }
        />
        { props.icon
          ? <InputGroupAddon>
              <i
                className={`fa fa-${ props.icon }`}
                style={{
                  textAlign: 'center',
                  minWidth: '20px',
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
        rows="10"
        style={{
          padding: '0.5rem 0.75rem',
        }}
          debounce={ 300 }
      />
    </FormGroup>
  </Card>
