const { InputStream, OutputStream } = require('skyway-m-pipe-sdk/connector');
const GoogleTranslate = require('./drivers/google-translate')
const { base64ToObj } = require('../libs/util')

const token = process.env.TOKEN
const inHost = process.env.IN_HOST
const inPort = process.env.IN_PORT
const outPort = process.env.OUT_PORT
const targetLanguage = process.env.TARGET_LANGUAGE
const gProjectId = process.env.G_PROJECT_ID
const base64GoogleCredentials = process.env.BASE64_GOOGLE_CREDENTIALS;

if( !token || !inHost || !inPort || !outPort || !targetLanguage || !gProjectId || !base64GoogleCredentials) {
  console.warn('TOKEN, IN_HOST, IN_PORT, OUT_PORT, TARGET_LANGUAGE, G_PROJECT_ID and BASE64_GOOGLE_CREDENTIALS must be specified')
  process.exit(0)
}

const googleCredentials = base64ToObj( base64GoogleCredentials )

console.log(`start translator module with token=${token}, inHost=${inHost}, inPort=${inPort}, outPort=${outPort}, targetLanguage=${targetLanguage}, gProjectId=${gProjectId} and googleCredentials=${googleCredentials}`)

function start() {
  try {
    const inputStream = new InputStream()
    const outputStream = new OutputStream()
    const googleTranslate = new GoogleTranslate({
      gProjectId,
      targetLanguage,
      googleCredentials
    })

    inputStream.start({ host: inHost, port: inPort, token })
    outputStream.start({ port: outPort, token })

    inputStream.on( 'data', async data => {
      try {
        const payload = data.payload.toString()
        const recognized = JSON.parse( payload )

        if( recognized.results.length > 0 && recognized.results[0].alternatives.length > 0 ) {
          const text = recognized.results[0].alternatives[0].transcript
          recognized.translation = await googleTranslate.translate( text )
        }

        outputStream.write({
          type: 'translation-result',
          payload: Buffer.from( JSON.stringify(recognized) )
        });
      } catch(err) {
        console.warn(err.message)
      }
    })
  } catch(err) {
    console.warn(err);
    process.exit(1);
  }
}

start()
