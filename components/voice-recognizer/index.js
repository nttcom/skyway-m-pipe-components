const { InputStream, OutputStream } = require('skyway-m-pipe-sdk/connector');
const VoiceRecognizer = require('./voice-recognizer')
const { base64ToObj } = require('../libs/util')

const token = process.env.TOKEN;
const inHost = process.env.IN_HOST;
const inPort = process.env.IN_PORT;
const outPort = process.env.OUT_PORT;
const languageCode = process.env.LANGUAGE_CODE;
const gProjectId = process.env.G_PROJECT_ID
const base64GoogleCredentials = process.env.BASE64_GOOGLE_CREDENTIALS;

if( !token || !inHost || !inPort || !outPort || !languageCode || !gProjectId || !base64GoogleCredentials ) {
  console.warn('TOKEN, IN_HOST, IN_PORT, OUT_PORT, LANGUAGE_CODE, G_PROJECT_ID and BASE64_GOOGLE_CREDENTIALS must be specified')
  process.exit(0);
}

const googleCredentials = base64ToObj( base64GoogleCredentials )

console.log(`start voice-recognizer module with token=${token}, inHost=${inHost}, inPort=${inPort}, outPort=${outPort}, languageCode=${languageCode}, gProjectId=${gProjectId} and googleCredential=${googleCredentials}`);

async function start() {
  try {
    const inputStream = new InputStream();
    const outputStream = new OutputStream();

    inputStream.start({ host: inHost, port: inPort, token });
    outputStream.start({ port: outPort, token });

    VoiceRecognizer.start({ inputStream, token, languageCode, gProjectId, googleCredentials }, recognized => {
      outputStream.write({
        type: 'voice-recognition-result',
        payload: Buffer.from( JSON.stringify(recognized) )
      });
    });
  } catch(err) {
    console.warn(err);
    process.exit(1);
  }
}

start()
