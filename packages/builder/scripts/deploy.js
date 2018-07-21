const shell = require('shelljs')
const { CI, TRAVIS_PULL_REQUEST, TRAVIS_BRANCH } = process.env

if (!(
  CI === 'true' && (
    TRAVIS_BRANCH !== 'master' ||
    TRAVIS_PULL_REQUEST === 'true'
  )
)) {
  shell.exec('cd build && zip -r ../dist.zip .')
  shell.exec('curl ' +
    '-H "Content-Type: application/zip" ' +
    '-H "Authorization: Bearer $NETLIFY_ACCESS_TOKEN" ' +
    '--data-binary "@dist.zip" ' +
    'https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys'
  )
}
