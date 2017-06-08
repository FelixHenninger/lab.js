import React from 'react'
import Confirm from '../Confirm'

import { errors } from '../../../../logic/util/compatibility'

export default ({ closeHandler }) =>
  <Confirm
    title="You're missing out!"
    closeLabel="Continue"
    closeHandler={ closeHandler }
  >
    <p><strong className="text-danger">For the <code>lab.js</code> builder to work as it should, it needs functionality that is not available in your browser.</strong> You'll get the most out of the builder by using <a href="https://getfirefox.com" className="font-weight-bold">Firefox</a> or <a href="https://www.google.com/intl/en/chrome/" className="font-weight-bold">Chrome</a>.</p>
    <p>Here's what we found:</p>
    <ul
      style={{
        paddingLeft: '1.5rem',
      }}
    >
      { errors }
    </ul>
    <p><strong className="text-primary">The studies you design will work fine on a much larger range of systems</strong> &mdash; it's just the builder interface that requires more capabilities.</p>
  </Confirm>
