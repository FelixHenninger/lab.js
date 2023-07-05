// Inject variables into distribution code
// (this was previously handled by webpack for the bundled library)
const fs = require('fs')
const shell = require('shelljs')

const files = [
  'dist/es6/index.js',
  'dist/es2022/index.js'
]

const build_flavor = JSON.stringify('module')
const build_commit = JSON.stringify(
  shell.exec('git rev-list -1 HEAD -- .', { silent: true }).trim(),
)

files.map(f => {
  fs.readFile(f, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.warn('Could not patch file', f, `which doesn't seem to exist`)
        return
      } else {
        throw err
      }
    }

    let output = data.replace(
      /BUILD_FLAVOR/g,
      build_flavor
    )
    output = output.replace(
      /BUILD_COMMIT/g,
      build_commit
    )

    fs.writeFile(f, output, 'utf8', (err) => {
      if (err) throw err
    })
  })
})
