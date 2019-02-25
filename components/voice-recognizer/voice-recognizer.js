const {
  recognize
} = require('./drivers/google-speech-api')

/**
 * start voice recognizer
 *
 * @param {object} params
 * @param {object} params.inputStream
 * @param {string} params.languageCode - en-US, ja-JP etc.
 * @param {object} params.gProjectId
 * @param {object} params.googleCredentials
 * @param {function} callback
 *
 *
 */
const start = ( params, callback ) => {
  const {
    inputStream,
    languageCode,
    gProjectId,
    googleCredentials
  } = params;

  const VOLUME_THRESHOLD = 10
  let caps, bufs = [], averages = [];
  // voice detection
  // we will simply use average volume. When it exceeds threshold value,
  // we will consider that voice has started.
  let started = false, cnt = 0;
  setInterval( async () => {
    const sum = averages.reduce( ( val, accum ) => {
      return accum + Math.abs(val)
    }, 0)

    if( !started && sum > VOLUME_THRESHOLD ) {
      started = true
    } else if ( started && sum > VOLUME_THRESHOLD ) {
      cnt = 0
    } else if ( started && sum <= VOLUME_THRESHOLD ) {
      if ( ++cnt >= 3 ) {
        started = false
        cnt = 0

        const voiceData = Buffer.concat( bufs ).toString('base64');
        const rate = caps.rate
        bufs.length = 0

        try {
          const timestamp = Date.now()
          const recognized = await recognize({
            voiceData,
            rate,
            languageCode,
            gProjectId,
            googleCredentials
          })
          //////////////////////////////////////////////////////
          // {
          //   "timestamp": 1533615356871
          //   "results": [
          //     {
          //       "alternatives": [
          //         {
          //           "words": [],
          //           "transcript": "こんにちは",
          //           "confidence": 0.8553773760795593
          //         }
          //       ]
          //     }
          //   ]
          // }
          //////////////////////////////////////////////////////
          const _recognized = Object.assign({}, recognized, { timestamp })

          if( typeof callback === 'function' ) callback( _recognized )
        } catch(err) {
          console.warn('ERROR:', err)
        }
      }
    } else {
      bufs.length = 0
    }
    averages.length = 0
  }, 100);

  // event handler for inputStream data
  //
  // we will store data and average volume array for volume detection purpose
  //
  inputStream.on('data', async data => {
    // todo - assuming PCM is S16LE and single channel
    const pcm = data.payload
    caps = JSON.parse( data.meta )
    let sum = 0

    for( let i = 0, len = pcm.length; i < len; i += 2 ) {
      sum += pcm.readInt16LE( i )
    }
    const avg = sum / pcm.length * 2

    bufs.push(pcm)
    averages.push(avg)
  });
}

module.exports = {
  start
}
