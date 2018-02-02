import React from 'react'

import { CardBody } from 'reactstrap'

export default () =>
  <CardBody
    style={{ textAlign: 'center' }}
  >
    <h2 style={{ margin: '2rem 0 1rem' }} >
      Welcome!
    </h2>
    <p>
      <strong>Thank you for using <code>lab.js</code>!</strong><br/>
      We hope you find it useful, and that<br />
      you enjoy using it as much as we did building it.
    </p>
    <p>
      To <strong>get started</strong>, please add a <code>screen</code> to
      your new study by using one of the buttons with a plus on the left.
      In this software, youʼll build your studies from many such&nbsp;
      <em>components</em>.
    </p>
    <p className="small text-muted">
      If you get stuck, you might want to <a
      href="https://labjs.readthedocs.io">take a look at the
      documentation</a>, or <a
      href="https://github.com/felixhenninger/lab.js#find-help">reach out to
      somebody who can help</a>. If something doesnʼt work as youʼd expect,
      please do <a
      href="https://github.com/FelixHenninger/lab.js/issues">let us
      know</a>, weʼd be glad to fix things and make them work for you.
    </p>
  </CardBody>
