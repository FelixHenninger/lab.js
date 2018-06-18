const shell = require('shelljs')

shell.exec('cd build && zip -r ../dist.zip .')
shell.exec('curl ' +
  '-H "Content-Type: application/zip" ' +
  '-H "Authorization: Bearer $NETLIFY_ACCESS_TOKEN" ' +
  '--data-binary "@dist.zip" ' +
  'https://api.netlify.com/api/v1/sites/$NETLIFY_SITE_ID/deploys'
)
