const { InputStream } = require('skyway-m-pipe-sdk/connector');
const FileWriter = require('./file-writer')

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const inHost = process.env.IN_HOST;
const inPort = process.env.IN_PORT;
const driverName = process.env.DRIVER_NAME;
const awsRegion = process.env.AWS_REGION;
const awsIdentityPoolId = process.env.AWS_IDENTITY_POOL_ID;
const s3Bucket = process.env.S3_BUCKET;
const chunkTime = parseInt(process.env.CHUNK_TIME) || 60;

// we assume that driverName is always S3
if( !token || !clientId || !inHost || !inPort || !driverName || !awsRegion || !awsIdentityPoolId || !s3Bucket ) {
  console.warn('TOKEN, CLIENT_ID, IN_HOST, IN_PORT, DRIVER_NAME, AWS_REGION, AWS_IDENTITY_POOL_ID and S3_BUCKET must be specified')
  process.exit(0);
}

const driverParams = {
  region: awsRegion,
  identityPoolId: awsIdentityPoolId,
  bucket: s3Bucket
}

// since logging `identityPoolId` has security issue, we will only display region and s3Bucket
console.log(`start file-writer module with token=${token}, clientId=${clientId} inPort=${inPort}, and inHost=${inHost}`);
console.log(`driveris ${driverName} and chunk time is ${chunkTime}`);
if( driverName === 'S3' ) {
  console.log(`AWS specific params - region: ${awsRegion}, bucket: ${s3Bucket}`);
}

async function start() {
  try {
    const inputStream = new InputStream();

    inputStream.start({ host: inHost, port: inPort, token });

    FileWriter.start({ inputStream, token, clientId, driverName, driverParams, chunkTime });
  } catch(err) {
    console.warn(err);
    process.exit(1);
  }
}

start()
