import React from 'react'
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

export default ({ closeHandler }) =>
  <div className="modal-content">
    <ModalHeader>
      You're missing out!
    </ModalHeader>
    <ModalBody>
      <p className="text-danger"><strong>For the <code>lab.js</code> builder to work as it should, it needs functionality that is not available in your browser.</strong> You can still build, modify and export studies, but the preview won't work.</p>
      <p>You'll get the most out of the builder by using <a href="https://getfirefox.com" className="font-weight-bold">Firefox</a> or <a href="https://www.google.com/intl/en/chrome/" className="font-weight-bold">Chrome</a> (<a href="http://caniuse.com/#feat=serviceworkers">compatible browsers and versions</a>). Private browsing mode may disable essential features even on these browsers &ndash; please check whether it is active.</p>
      <p>The studies you design will work fine on a much larger range of systems &ndash; it's just the builder interface that requires more capabilities.</p>
    </ModalBody>
    <ModalFooter>
      <Button
        onClick={ closeHandler }
      >
        Continue
      </Button>
    </ModalFooter>
  </div>
