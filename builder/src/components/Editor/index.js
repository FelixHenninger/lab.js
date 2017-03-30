import React from 'react'
import MonacoEditor from 'react-monaco-editor'

import './editor-style-overrides.css'

// TODO: I haven't found a way to reliably host the
// monaco static files on another path than /vs .
// It would be nice to be able to move it into the
// /vendor directory

export default (props) => {
  const requireConfig = {
    url: process.env.PUBLIC_URL + '/vendor/require.js',
    paths: {
      'vs': process.env.PUBLIC_URL + '/vs'
    },
    // Give the (large) editor script more time to load
    // (the default is 7 seconds, 30 should
    // be enough even for a 2G connection)
    waitSeconds: 30,
  }
  return <MonacoEditor
    width="100%" height="600"
    language="html" value={''}
    requireConfig={ requireConfig }
    options={{
      // Behavior
      contextmenu: false,
      lineNumbers: true,
      lineNumbersMinChars: 4,
      overviewRulerLanes: 0,
      rulers: [80],
      scrollBeyondLastLine: false,
      wrappingColumn: 0,
      // Style
      fontFamily: 'Fira Mono',
      fontSize: 18,
      lineHeight: 26,
    }}
    {...props}
  />
}
