require = require('esm')(module)
require('./main.js')

//hot reload
try {
    require('electron-reloader')(module)
} catch (_) {}