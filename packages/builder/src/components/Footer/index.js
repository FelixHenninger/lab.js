import { sample } from 'lodash'
import React from 'react'
import logo from './flask_micro.png'
import { Imprint } from './imprint'
import './index.css'

const message = sample(['built with ♥︎'])

export default () => (
  <footer>
    <hr />
    <div className="d-flex justify-content-between">
      <a className="text-muted logo" href="https://lab.js.org/">
        <img alt="lab.js logo" src={logo} /> <small>{message}</small>
      </a>
      <Imprint />
    </div>
  </footer>
)
