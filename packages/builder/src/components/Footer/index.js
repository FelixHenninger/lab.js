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
      <a
        className="text-muted text-decoration-none logo"
        href="https://lab.js.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          alt="lab.js logo"
          src={ logo }
        />{' '}
        <small>{ message }</small>
      </a>
      <Imprint />
    </div>
  </footer>
