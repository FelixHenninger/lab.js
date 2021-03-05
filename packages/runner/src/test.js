const lsl=require('./node-lsl/index')
//const os = require('os');

export function test_stream(){
    const info = lsl.create_streaminfo('Muse', 'EEG', 5, 256, lsl.channel_format_t.cft_float32, 'dummy');
    console.log(info)
}

export function proto(){
    console.log(lsl.protocol_version())
}

export function clock(){
    console.log(lsl.local_clock())
}
