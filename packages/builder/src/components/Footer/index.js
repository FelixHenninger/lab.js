import React from 'react'

import { sample } from 'lodash'
import { Imprint } from './imprint'

import './index.css'
import logo from './flask_micro.png'

const message = sample([
  'built with ♥︎',
])

export default () =>
  <footer>
    <hr />
    <div className="d-flex justify-content-between">
      <small className="text-muted logo">
        <img
          alt="lab.js logo"
          src={ logo }
        />{' '}
        <span>{ message }</span>
      </small>
      <Imprint />
    </div>
  </footer>
