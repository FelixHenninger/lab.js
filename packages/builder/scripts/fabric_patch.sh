# Dry-run patch
patch \
  --dry-run --silent \
  --forward --reject-file - \
  node_modules/fabric/dist/fabric.js < scripts/fabric.patch

# Check for exit status, only apply patch if dry run succeeded
if [ $? -eq 0 ];
then
    patch \
      --forward \
      node_modules/fabric/dist/fabric.js < scripts/fabric.patch
fi
