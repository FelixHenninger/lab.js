import { app } from 'electron'

import { logProtocolVersion, logClock, logStreamInfo } from '../../util/lsl'

const isMac = process.platform === 'darwin'

export const menuEntries = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ role: 'quit' }],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  // LSL test shims
  {
    label: 'Test LSL',
    submenu: [
      {
        label: 'Log protocol version',
        click: logProtocolVersion,
      },
      {
        label: 'Log local clock',
        click: logClock,
      },
      {
        label: 'Log stream info',
        click: logStreamInfo,
      },
    ],
  },
]
