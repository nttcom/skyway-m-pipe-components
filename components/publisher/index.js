const { InputStream } = require('skyway-m-pipe-sdk/connector')
const GooglePubSub = require('./drivers/google-pubsub')
const { base64ToObj } = require('../libs/util')

const token = process.env.TOKEN
const clientId = process.env.CLIENT_ID
const inHost = process.env.IN_HOST
const inPort = process.env.IN_PORT
const topic = process.env.TOPIC
const gProjectId = process.env.G_PROJECT_ID
const base64GoogleCredentials = process.env.BASE64_GOOGLE_CREDENTIALS;

if( !token || !clientId || !inHost || !inPort || !topic || !gProjectId || !base64GoogleCredentials ) {
  console.warn('TOKEN, CLIENT_ID, IN_HOST, IN_PORT, TOPIC, G_PROJECT_ID and BASE64_GOOGLE_CREDENTIALS must be specified')
  process.exit(0)
}

const googleCredentials = base64ToObj( base64GoogleCredentials )
console.log(`start publisher module with token=${token}, clientId=${clientId} inHost=${inHost}, inPort=${inPort}, topic=${topic}, gProjectId=${gProjectId} and googleCredentials=${googleCredentials}`)


async function start() {
  try {
    const inputStream = new InputStream()
    const googlePubSub = new GooglePubSub({
      gProjectId,
      topic,
      googleCredentials
    })

    await googlePubSub.start()
    inputStream.start({ host: inHost, port: inPort, token })

    inputStream.on( 'data', async data => {
      try {
        const payload = data.payload.toString()
        const pData = JSON.parse( payload )
        pData.token = token
        pData.clientId = clientId

        await googlePubSub.publish( pData )
      } catch(err) {
        console.warn(err)
      }
    })
  } catch(err) {
    console.warn(err);
    process.exit(1);
  }
}

start()
