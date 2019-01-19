const speech = require('@google-cloud/speech');

/**
 * do voice recognitioin using cloud speech api
 *
 * @param {object} params
 * @param {Buffer} params.voiceData - PCM data
 * @param {number} params.rate - PCM rate (e.g. 44100)
 * @param {string} params.languageCode - language code ( e.g. 'ja-JP' )
 * @param {object} params.gProjectId
 * @param {object} params.googleCredentials - google credentials object
 */
async function recognize( { voiceData, rate, languageCode, gProjectId, googleCredentials } ) {
  const client = new speech.SpeechClient({
    projectId: gProjectId,
    credentials: googleCredentials
  });

  const request = {
    audio: {
      content: voiceData,
    },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: rate,
      languageCode
    }
  }

  try {
    const data = await client.recognize( request )
    return data[0]
  } catch(err) {
    throw err
  }
}

module.exports = {
  recognize
}
