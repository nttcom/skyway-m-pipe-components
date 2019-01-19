const { InputStream } = require('skyway-m-pipe-sdk/connector')
const AWSDynamoDB = require('./drivers/aws-dynamodb')

const token = process.env.TOKEN
const clientId = process.env.CLIENT_ID
const inHost = process.env.IN_HOST
const inPort = process.env.IN_PORT
const region = process.env.REGION
const IdentityPoolId = process.env.IDENTITY_POOL_ID
const tableName = process.env.TABLE_NAME

if( !token || !clientId || !inHost || !inPort || !region || !IdentityPoolId || !tableName ) {
  console.warn('TOKEN, CLIENT_ID, IN_HOST, IN_PORT, REGION, IDENTITY_POOL_ID and TABLE_NAME must be specified')
  process.exit(0)
}

console.log(`start db-writer module with token=${token}, clientId=${clientId}, inHost=${inHost}, inPort=${inPort}`)
console.log(`This component is leveraging AWS DynamoDB`);
console.log(`AWS specific params - region: ${region}, table name: ${tableName}`);



async function start() {
  try {
    const inputStream = new InputStream()
    const awsDynamoDB = new AWSDynamoDB({
      region,
      IdentityPoolId,
      tableName
    })

    await awsDynamoDB.setup()
    inputStream.start({ host: inHost, port: inPort, token })

    inputStream.on( 'data', async data => {
      try {
        const payload = data.payload.toString()
        const pData = JSON.parse( payload )

        const item = {
          clientId,
          token,
          timestamp: pData.timestamp,
          transcript: pData.results.length === 0 ? '' : pData.results[0].alternatives[0].transcript,
          confidence: pData.results.length === 0 ? 0 : pData.results[0].alternatives[0].confidence,
          translation: pData.translation ? pData.translation : ''
        }

        await awsDynamoDB.write( item )
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
