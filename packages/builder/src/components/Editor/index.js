import React from 'react'
import MonacoEditor from 'react-monaco-editor'

import './editor-style-overrides.css'

// TODO: I haven't found a way to reliably host the
// monaco static files on another path than /vs .
// It would be nice to be able to move it into the
// /vendor directory

export default class Editor extends React.Component {
  editorWillMount(monaco) {
    monaco.editor.defineTheme('labjs', {
      base: 'vs', inherit: true,
      rules: [
        { token: 'attribute.name', foreground: '0275d8' },
        { token: 'attribute.value', foreground: '569cd6' },
        { token: 'attribute.value.html', foreground: '569cd6' },
        { token: 'comment', foreground: '999999' },
        { token: 'comment.content', foreground: '999999' },
        { token: 'comment.html', foreground: '999999' },
        { token: 'comment.content.html', foreground: '999999' },
        { token: 'keyword', foreground: '0275d8' },
        { token: 'metatag.content', foreground: '0275d8' },
        { token: 'metatag.content.html', foreground: '0275d8' },
        { token: 'metatag.html', foreground: '999999' },
        { token: 'property-name', foreground: '0275d8' },
        { token: 'token.content', foreground: '0275d8' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editorIndentGuide.background': '#eceeef',
        'editorLineNumber.foreground': '#818a91',
        'editorRuler.foreground': '#eceeef',
      },
    })
  }

  editorDidMount(editor) {
    editor.getModel().updateOptions({
      tabSize: 2,
    })
  }

  render() {
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
      theme="labjs"
      requireConfig={ requireConfig }
      editorDidMount={ this.editorDidMount }
      editorWillMount={ this.editorWillMount }
      options={{
        // Behavior
        contextmenu: false,
        cursorBlinking: 'solid',
        lineNumbers: true,
        lineNumbersMinChars: 4,
        overviewRulerLanes: 0,
        rulers: [80],
        scrollbar: {
          useShadows: false,
        },
        scrollBeyondLastLine: false,
        tabSize: 2,
        // Wrapping
        wordWrap: 'wordWrapColumn',
        wordWrapColumn: 80,
        wrappingIndent: "indent",
        // Style
        fontFamily: 'Fira Mono',
        fontSize: 18,
        lineHeight: 26,
      }}
      {...this.props}
    />
  }
}
