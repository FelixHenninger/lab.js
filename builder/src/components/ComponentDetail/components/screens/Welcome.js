import React from 'react'

import Card from '../../../Card'
export default () =>
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    <Card
      style={{ width: '500px', textAlign: 'center' }}
    >
      <i
        className="fa fa-heart"
        style={{
          fontSize: '5rem',
          color: 'rgb(225, 225, 225)',
          margin: '2rem 0 1rem',
        }}
      />
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
        In this software, you'll build your studies from many such&nbsp;
        <em>components</em>.
      </p>
      <p className="small text-muted">
        If you get stuck, you might want to <a
        href="https://labjs.readthedocs.io">take a look at the
        documentation</a>, or <a
        href="https://github.com/felixhenninger/lab.js#find-help">reach out to
        somebody who can help</a>. If something doesn't work as you'd expect,
        please do <a
        href="https://github.com/FelixHenninger/lab.js/issues">let us
        know</a>, we'd be glad to fix things and make them work for you.
      </p>
      <p className="small text-muted">
        Please remember: We do our very best, but as much as we try, there might
        still be some bugs left over &ndash; this is beta-level software still.
        To minimize frustration, please save your work periodically, and again,
        please <a href="https://github.com/FelixHenninger/lab.js/issues">help us
        find and fix any outstanding issues</a> that you find.
      </p>
    </Card>
  </div>
