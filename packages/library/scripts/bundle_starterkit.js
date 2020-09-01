
// Copy files ------------------------------------------------------------------
shell.mkdir('-p', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'src/starterkit/index.html', 'dist/labjs-starterkit')
shell.cp('-R', 'src/starterkit/study.js', 'dist/labjs-starterkit')
shell.cp(
  '-R',
  'src/starterkit/lib/lab.fallback.js',
  'dist/labjs-starterkit/lib',
)
shell.cp('-R', 'dist/lab.dev.js', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'dist/lab.js', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'dist/lab.js.map', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'dist/lab.legacy.js', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'dist/lab.legacy.js.map', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'dist/lab.css', 'dist/labjs-starterkit/lib')
shell.cp('-R', 'src/starterkit/lib/loading.svg', 'dist/labjs-starterkit/lib')

// Create the starterkit bundle ------------------------------------------------
// (TODO: Think about doing this directly from the source files)
const JSZip = require('jszip')
const fs = require('fs')
zip = new JSZip()

shell
  .ls('-R', 'dist/labjs-starterkit/**/*')
  .filter((filename: any) => filename.startsWith('dist/labjs-starterkit'))
  .forEach((filename: any) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'zip'.
    zip.file(
      filename.replace(/^dist\/labjs-starterkit\//, ''),
      fs.readFileSync(filename),
    )
  })

// Compress and output bundle file
// @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'zip'.
zip
  .generateNodeStream({
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    type: 'nodebuffer',
    streamFiles: true,
  })
  .pipe(fs.createWriteStream('dist/labjs-starterkit.zip'))
  .on('finish', () => console.log('Created starterkit bundle'))
