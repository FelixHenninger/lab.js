import React from 'react'
import MonacoEditor from 'react-monaco-editor'

import { throttle } from 'lodash'

import './editor-style-overrides.css'

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

  editorDidMount(editor, monaco) {
    const model = editor.getModel()

    // Set tab width
    model.updateOptions({
      tabSize: 2,
    })

    // Hook up custom linter (currently only for HTML)
    if (this.props.language === 'html') {
      // The HTMLHint library loads many dependencies,
      // and is not needed directly when the editor
      // is first loaded, therefore it is split out here.
      import('htmlhint').then(({ default: HTMLHint }) => {
        model.onDidChangeContent(throttle(() => {
          const hints = HTMLHint.verify(
            model.getValue(), {
              "tagname-lowercase": true,
              "attr-lowercase": true,
              "attr-value-double-quotes": true,
              "tag-pair": true,
              "spec-char-escape": true,
              "id-unique": true,
              "src-not-empty": true,
              "attr-no-duplication": true,
              "attr-unsafe-chars": true
            }
          ).map(hint => ({
            startLineNumber: hint.line, startColumn: hint.col,
            endLineNumber: hint.line, endColumn: hint.col + hint.raw.length,
            message: hint.message,
            severity: 1,
          }))

          monaco.editor.setModelMarkers(
            model, 'custom-linter', hints
          )
        }, 500))
      }).catch(e => console.log('Couldn\'t load HTMLHint:', e))
    }
  }

  render() {
    return <MonacoEditor
      width="100%"
      language="html" value={''}
      theme="labjs"
      editorDidMount={ this.editorDidMount.bind(this) }
      editorWillMount={ this.editorWillMount.bind(this) }
      {...this.props}
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
        ...this.props.options
      }}
    />
  }
}
