import lsl from 'node-lsl'

export function logStreamInfo() {
  const info = lsl.create_streaminfo(
    'Muse',
    'EEG',
    5,
    256,
    lsl.channel_format_t.cft_float32,
    'dummy',
  )
  console.log(info)
}

export function logProtocolVersion() {
  console.log(lsl.protocol_version())
}

export function logClock() {
  console.log(lsl.local_clock())
}
