// Patch service worker to include all static assets in build,
// not only those imported in the source code
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const glob = require('glob')

// Create md5 hash of file
const hash = data =>
  crypto.createHash('md5')
    .update(data)
    .digest('hex')

fs.readFile('build/service-worker.js', 'utf8', (err, data) => {
  if (err) throw err

  // Add static files to inventory of
  // files cached by worker
  const localStaticFiles = glob.sync('public/**/*')
    .filter(f => !fs.lstatSync(f).isDirectory()) // filter directories
    .map(f => [ // make path/hash pairs
      path.relative('public', f),
      hash(fs.readFileSync(f))
    ])

  // Remove legacy fonts from cache
  // and insert remaining static files
  let output = data.replace(
    /precacheConfig=(\[(?:\["[^"]+","[\w\d]+"\],?)+\])/g,
    (match, assets) => `precacheConfig=${ JSON.stringify([
      ...JSON.parse(assets)
        .filter(([filename, hash]) => !filename.match(/(ttf|eot|woff)$/)),
      ...localStaticFiles,
    ]) }`
  )

  // Exclude previews from being covered by
  // progressive app service worker (all paths below /api/)
  output = output.replace(
    /isPathWhitelisted\(\[/g,
    'isPathWhitelisted(["^(?!\\\\/api\\\\/).*",'
  )

  fs.writeFile('build/service-worker.js', output, 'utf8', (err) => {
    if (err) throw err
  })
})
